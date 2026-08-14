import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { fetchFriendStreaks, fetchConversation, sendIdea } from '../../services/messageService';
import { showSuccessToast, showErrorToast } from '../../utils/toast';
import styles from './FriendsPage.module.css';

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #6366f1, #8b5cf6)',
  'linear-gradient(135deg, #ec4899, #f43f5e)',
  'linear-gradient(135deg, #f59e0b, #ef4444)',
  'linear-gradient(135deg, #10b981, #06b6d4)',
  'linear-gradient(135deg, #3b82f6, #6366f1)',
  'linear-gradient(135deg, #a855f7, #ec4899)',
];

const displayName = (u) => u.username || u.email?.split('@')[0] || u.email;

const formatTime = (d) => new Date(d).toLocaleString('en-US', {
  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
});

export default function FriendsPage({ user }) {
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [streak, setStreak] = useState(0);
  const [ideaText, setIdeaText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (!user?.token) { setLoading(false); return; }
    fetchFriendStreaks()
      .then(data => {
        setFriends(data);
        if (data.length > 0 && !selectedFriend) setSelectedFriend(data[0]);
      })
      .catch(() => showErrorToast('Failed to load friends'))
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    if (!selectedFriend) return;
    fetchConversation(selectedFriend.id)
      .then(data => {
        setMessages(data.messages || []);
        setStreak(data.streak || 0);
      })
      .catch(() => showErrorToast('Failed to load conversation'));
  }, [selectedFriend]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendIdea = async (e) => {
    e.preventDefault();
    if (!ideaText.trim() || !selectedFriend) return;
    setSending(true);
    try {
      const result = await sendIdea(selectedFriend.id, ideaText.trim());
      showSuccessToast(`Idea sent! 🔥 Streak: ${result.streak} days`);
      setIdeaText('');
      setStreak(result.streak);
      const refreshed = await fetchConversation(selectedFriend.id);
      setMessages(refreshed.messages || []);
      setFriends(prev => prev.map(f =>
        f.id === selectedFriend.id ? { ...f, streak: result.streak } : f
      ));
    } catch (err) {
      showErrorToast(err.response?.data?.message || 'Failed to send idea');
    } finally {
      setSending(false);
    }
  };

  if (!user) {
    return (
      <div className="app-page" style={{ textAlign: 'center', padding: 60 }}>
        <h2 style={{ color: '#1e293b' }}>Friends</h2>
        <p style={{ color: '#64748b' }}>Please <Link to="/profile">sign in</Link> to view friends.</p>
      </div>
    );
  }

  return (
    <div className="app-page">
      <div className={styles.pageWrap}>
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>Friends & Ideas</h1>
            <p className={styles.pageSub}>
              Send ideas daily to keep your streak alive — like Snapchat snaps!
            </p>
          </div>
          <Link to="/add-friends" className={styles.addBtn}>+ Add Friends</Link>
        </div>

        {loading ? (
          <p className={styles.loadingText}>Loading friends...</p>
        ) : friends.length === 0 ? (
          <div className={styles.emptyPage}>
            <div className={styles.emptyPageIcon}>👥</div>
            <h3>No friends yet</h3>
            <p>Add friends to start sending ideas and building streaks!</p>
            <Link to="/add-friends" className={styles.findBtn}>Find Friends</Link>
          </div>
        ) : (
          <div className={styles.chatGrid}>
            {/* Friends sidebar */}
            <div className={styles.friendsPanel}>
              <div className={styles.friendsPanelHeader}>
                <p className={styles.friendsPanelTitle}>Your Squad</p>
                <p className={styles.friendsPanelCount}>{friends.length} friends</p>
              </div>
              <div className={styles.friendScrollList}>
                {friends.map((f, i) => (
                  <button
                    key={f.id}
                    type="button"
                    className={`${styles.friendRow} ${selectedFriend?.id === f.id ? styles.friendRowActive : ''}`}
                    onClick={() => setSelectedFriend(f)}
                  >
                    <div
                      className={styles.friendAvatar}
                      style={{ background: AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length] }}
                    >
                      {displayName(f)[0]?.toUpperCase()}
                    </div>
                    <div className={styles.friendMeta}>
                      <p className={styles.friendName}>{displayName(f)}</p>
                      <p className={styles.friendEmail}>{f.email}</p>
                    </div>
                    {f.streak > 0 && (
                      <span className={styles.streakBadge}>🔥 {f.streak}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat panel */}
            <div className={styles.chatPanel}>
              {selectedFriend ? (
                <>
                  <div className={styles.chatHeader}>
                    <div className={styles.chatHeaderLeft}>
                      <div
                        className={styles.chatHeaderAvatar}
                        style={{
                          background: AVATAR_GRADIENTS[
                            friends.findIndex(f => f.id === selectedFriend.id) % AVATAR_GRADIENTS.length
                          ],
                        }}
                      >
                        {displayName(selectedFriend)[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className={styles.chatHeaderName}>{displayName(selectedFriend)}</p>
                        <p className={styles.chatHeaderStatus}>💡 Idea exchange</p>
                      </div>
                    </div>
                    <div className={styles.streakCard}>
                      <div className={styles.streakEmoji}>🔥</div>
                      <div className={styles.streakCount}>{streak}</div>
                      <div className={styles.streakLabel}>day streak</div>
                    </div>
                  </div>

                  <div className={styles.messagesArea}>
                    {messages.length === 0 ? (
                      <div className={styles.emptyChat}>
                        <div className={styles.emptyChatIcon}>💡</div>
                        <p>No ideas yet — send the first snap!</p>
                      </div>
                    ) : (
                      messages.map(msg => {
                        const isMine = msg.sender_email === user.email;
                        return (
                          <div
                            key={msg.id}
                            className={isMine ? styles.bubbleMine : styles.bubbleTheirs}
                          >
                            {!isMine && (
                              <div className={styles.bubbleLabel}>
                                {displayName({ username: msg.sender_username, email: msg.sender_email })}
                              </div>
                            )}
                            <p className={styles.bubbleText}>{msg.content}</p>
                            <p className={styles.bubbleTime}>{formatTime(msg.created_at)}</p>
                          </div>
                        );
                      })
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  <div className={styles.inputArea}>
                    <form className={styles.inputForm} onSubmit={handleSendIdea}>
                      <input
                        type="text"
                        className={styles.ideaInput}
                        placeholder="Drop an idea, topic, or inspiration..."
                        value={ideaText}
                        onChange={e => setIdeaText(e.target.value)}
                        disabled={sending}
                      />
                      <button
                        type="submit"
                        className={styles.sendBtn}
                        disabled={sending || !ideaText.trim()}
                      >
                        {sending ? '...' : 'Send 💡'}
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className={styles.noChatSelected}>
                  <div className={styles.noChatIcon}>💬</div>
                  <p>Select a friend to start chatting</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
