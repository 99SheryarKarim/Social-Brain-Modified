import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  fetchAllUsers,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  fetchPendingRequests,
} from '../../services/friendService';
import { showSuccessToast, showErrorToast } from '../../utils/toast';
import styles from './FriendsPage.module.css';

const displayName = (u) => u.username || u.email?.split('@')[0] || u.email;

export default function AddFriendsPage({ user }) {
  const [users, setUsers] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [actionId, setActionId] = useState(null);

  const loadData = async () => {
    if (!user?.token) { setLoading(false); return; }
    try {
      const [allUsers, pendingReqs] = await Promise.all([
        fetchAllUsers(),
        fetchPendingRequests(),
      ]);
      setUsers(allUsers);
      setPending(pendingReqs);
    } catch (err) {
      showErrorToast('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [user]);

  const refreshUser = (id, status) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, friendshipStatus: status } : u));
  };

  const handleAdd = async (friendId) => {
    setActionId(friendId);
    try {
      await sendFriendRequest(friendId);
      showSuccessToast('Friend request sent!');
      refreshUser(friendId, 'pending');
    } catch (err) {
      showErrorToast(err.response?.data?.message || 'Failed to send request');
    } finally {
      setActionId(null);
    }
  };

  const handleAccept = async (friendId) => {
    setActionId(friendId);
    try {
      await acceptFriendRequest(friendId);
      showSuccessToast('Friend request accepted!');
      setPending(prev => prev.filter(p => p.id !== friendId));
      refreshUser(friendId, 'accepted');
    } catch (err) {
      showErrorToast(err.response?.data?.message || 'Failed to accept');
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (friendId) => {
    setActionId(friendId);
    try {
      await rejectFriendRequest(friendId);
      showSuccessToast('Request declined');
      setPending(prev => prev.filter(p => p.id !== friendId));
      refreshUser(friendId, null);
    } catch (err) {
      showErrorToast('Failed to decline request');
    } finally {
      setActionId(null);
    }
  };

  const getActionButton = (u) => {
    const isIncoming = pending.some(p => p.id === u.id);
    if (u.friendshipStatus === 'accepted') {
      return <span className={styles.statusButton}>Friends ✓</span>;
    }
    if (isIncoming) {
      return (
        <div style={{ display: 'flex', gap: 8 }}>
          <button className={styles.actionButton} disabled={actionId === u.id} onClick={() => handleAccept(u.id)}>Accept</button>
          <button className={styles.statusButton} disabled={actionId === u.id} onClick={() => handleReject(u.id)}>Decline</button>
        </div>
      );
    }
    if (u.friendshipStatus === 'pending') {
      return <span className={styles.statusButton}>Request Sent</span>;
    }
    return (
      <button className={styles.actionButton} disabled={actionId === u.id} onClick={() => handleAdd(u.id)}>
        {actionId === u.id ? 'Sending...' : 'Add Friend'}
      </button>
    );
  };

  const filtered = users.filter(u => {
    const q = filter.toLowerCase();
    return !q || (u.email?.toLowerCase().includes(q) || u.username?.toLowerCase().includes(q));
  });

  if (!user) {
    return (
      <div className="app-page" style={{ textAlign: 'center', padding: 60 }}>
        <h2 style={{ color: '#1e293b' }}>Add Friends</h2>
        <p style={{ color: '#64748b' }}>Please <Link to="/profile">sign in</Link> to find and add friends.</p>
      </div>
    );
  }

  return (
    <div className="app-page">
      <div className={styles.container}>
        <h1 className={styles.header}>Add Friends</h1>
        <p style={{ textAlign: 'center', color: '#64748b', marginTop: -20, marginBottom: 24 }}>
          Browse all users on Idea Pulse and connect with them
        </p>

        {pending.length > 0 && (
          <div className={styles.section}>
            <h2>Pending Requests ({pending.length})</h2>
            {pending.map(u => (
              <div key={u.id} className={styles.userCard}>
                <div>
                  <strong>{displayName(u)}</strong>
                  <p style={{ margin: 0, fontSize: 12, color: '#94a3b8' }}>{u.email}</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className={styles.actionButton} disabled={actionId === u.id} onClick={() => handleAccept(u.id)}>Accept</button>
                  <button className={styles.statusButton} disabled={actionId === u.id} onClick={() => handleReject(u.id)}>Decline</button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className={styles.section}>
          <h2>All Users ({filtered.length})</h2>
          <input
            type="text"
            placeholder="Filter by name or email..."
            className={styles.searchInput}
            value={filter}
            onChange={e => setFilter(e.target.value)}
          />
          {loading ? (
            <p className={styles.loading}>Loading users...</p>
          ) : filtered.length === 0 ? (
            <p style={{ color: '#94a3b8', textAlign: 'center' }}>No users found</p>
          ) : (
            <div className={styles.searchResults}>
              {filtered.map(u => (
                <div key={u.id} className={styles.userCard}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #46a29f, #3b8c86)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontWeight: 700, fontSize: 16, flexShrink: 0,
                    }}>
                      {displayName(u)[0]?.toUpperCase()}
                    </div>
                    <div>
                      <strong>{displayName(u)}</strong>
                      <p style={{ margin: 0, fontSize: 12, color: '#94a3b8' }}>{u.email}</p>
                    </div>
                  </div>
                  {getActionButton(u)}
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <Link to="/friends" style={{ color: '#46a29f', fontWeight: 600, textDecoration: 'none' }}>
            View your friends & send ideas →
          </Link>
        </div>
      </div>
    </div>
  );
}
