import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../../services/notificationService';
import { showSuccessToast, showErrorToast } from '../../utils/toast';

const typeIcons = {
  friend_request: { icon: 'fas fa-user-plus', color: '#46a29f', bg: '#e8f6f5' },
  friend_accepted: { icon: 'fas fa-user-check', color: '#10b981', bg: '#ecfdf5' },
  idea_received: { icon: 'fas fa-lightbulb', color: '#f59e0b', bg: '#fffbeb' },
  default: { icon: 'fas fa-bell', color: '#64748b', bg: '#f1f5f9' },
};

const formatTime = (d) => {
  const diff = (Date.now() - new Date(d)) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function NotificationsPage({ user, onRead }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = async () => {
    if (!user?.token) { setLoading(false); return; }
    try {
      const data = await fetchNotifications();
      setNotifications(data);
    } catch {
      showErrorToast('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [user]);

  const handleClick = async (n) => {
    if (!n.is_read) {
      await markNotificationRead(n.id);
      setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, is_read: 1 } : x));
      onRead?.();
    }
    if (n.link) navigate(n.link);
  };

  const handleMarkAll = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
      onRead?.();
      showSuccessToast('All notifications marked as read');
    } catch {
      showErrorToast('Failed to mark all as read');
    }
  };

  const unread = notifications.filter(n => !n.is_read).length;

  if (!user) {
    return (
      <div className="app-page" style={{ textAlign: 'center', padding: 60 }}>
        <h2 style={{ color: '#1e293b' }}>Notifications</h2>
        <p style={{ color: '#64748b' }}>Please <Link to="/profile">sign in</Link> to view notifications.</p>
      </div>
    );
  }

  return (
    <div className="app-page">
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 style={{ margin: 0, fontWeight: 800, color: '#1e293b', fontSize: 24 }}>Notifications</h1>
            {unread > 0 && (
              <p style={{ margin: '4px 0 0', color: '#46a29f', fontSize: 13, fontWeight: 600 }}>
                {unread} unread
              </p>
            )}
          </div>
          {unread > 0 && (
            <button onClick={handleMarkAll} style={{
              background: 'none', border: '1px solid #e2e8f0', borderRadius: 8,
              padding: '8px 14px', fontSize: 12, color: '#64748b', cursor: 'pointer', fontWeight: 600,
            }}>
              Mark all read
            </button>
          )}
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: '#94a3b8', padding: 40 }}>Loading...</p>
        ) : notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: 40, marginBottom: 16, color: '#cbd5e1' }}>
              <i className="far fa-bell" />
            </div>
            <h3 style={{ color: '#1e293b' }}>No notifications yet</h3>
            <p style={{ color: '#64748b' }}>Friend requests, accepted friends, and received ideas will appear here.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {notifications.map(n => {
              const cfg = typeIcons[n.type] || typeIcons.default;
              return (
                <button
                  key={n.id}
                  onClick={() => handleClick(n)}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 14,
                    padding: '16px 18px', borderRadius: 12, border: '1px solid #e5e7eb',
                    background: n.is_read ? '#fff' : '#f0fdfc',
                    cursor: 'pointer', textAlign: 'left', width: '100%',
                    transition: 'box-shadow 0.15s',
                  }}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                    background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, color: cfg.color
                  }}>
                    <i className={cfg.icon} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 14, color: '#1e293b', fontWeight: n.is_read ? 400 : 600, lineHeight: 1.4 }}>
                      {n.content}
                    </p>
                    <p style={{ margin: '4px 0 0', fontSize: 11, color: '#94a3b8' }}>{formatTime(n.created_at)}</p>
                  </div>
                  {!n.is_read && (
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#46a29f', flexShrink: 0, marginTop: 6 }} />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
