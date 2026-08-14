import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchFriends } from '../../services/friendService';
import { sendIdea } from '../../services/messageService';
import { showSuccessToast, showErrorToast } from '../../utils/toast';
import styles from './SendIdeaModal.module.css';

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #6366f1, #8b5cf6)',
  'linear-gradient(135deg, #ec4899, #f43f5e)',
  'linear-gradient(135deg, #f59e0b, #ef4444)',
  'linear-gradient(135deg, #10b981, #06b6d4)',
  'linear-gradient(135deg, #3b82f6, #6366f1)',
];

const displayName = (u) => u.username || u.email?.split('@')[0] || u.email;

export default function SendIdeaModal({ isOpen, onClose, ideaText, onSent }) {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    fetchFriends()
      .then(setFriends)
      .catch(() => showErrorToast('Failed to load friends'))
      .finally(() => setLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSend = async (friend) => {
    setSendingId(friend.id);
    try {
      const result = await sendIdea(friend.id, ideaText);
      showSuccessToast(`Idea sent to ${displayName(friend)}! 🔥 Streak: ${result.streak} days`);
      onSent?.(result, friend);
      onClose();
    } catch (err) {
      showErrorToast(err.response?.data?.message || 'Failed to send idea');
    } finally {
      setSendingId(null);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.headerGlow} />
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
          <h2 className={styles.headerTitle}>💡 Send to Friend</h2>
          <p className={styles.headerSub}>Share this idea and grow your streak!</p>
        </div>

        <div className={styles.ideaPreview}>{ideaText}</div>

        <div className={styles.body}>
          <p className={styles.sectionLabel}>Choose a friend</p>

          {loading ? (
            <p className={styles.loading}>Loading friends...</p>
          ) : friends.length === 0 ? (
            <div className={styles.emptyState}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>👥</div>
              <p>No friends yet. Add friends first!</p>
              <Link to="/add-friends" onClick={onClose}>Go to Add Friends →</Link>
            </div>
          ) : (
            <div className={styles.friendList}>
              {friends.map((f, i) => (
                <button
                  key={f.id}
                  type="button"
                  className={`${styles.friendItem} ${sendingId === f.id ? styles.friendItemSending : ''}`}
                  disabled={!!sendingId}
                  onClick={() => handleSend(f)}
                >
                  <div
                    className={styles.avatar}
                    style={{ background: AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length] }}
                  >
                    {displayName(f)[0]?.toUpperCase()}
                  </div>
                  <div className={styles.friendInfo}>
                    <p className={styles.friendName}>{displayName(f)}</p>
                    <p className={styles.friendEmail}>{f.email}</p>
                  </div>
                  <div className={styles.sendIcon}>
                    {sendingId === f.id ? <i className="fas fa-spinner fa-spin" /> : '→'}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
