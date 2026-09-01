import { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchFriendStreaks, fetchConversation, sendIdea } from '../../services/messageService';
import { showSuccessToast, showErrorToast } from '../../utils/toast';
import styles from './FriendsPage.module.css';

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #0095f6, #7000ff)',
  'linear-gradient(135deg, #ec4899, #f43f5e)',
  'linear-gradient(135deg, #f59e0b, #ef4444)',
  'linear-gradient(135deg, #10b981, #06b6d4)',
  'linear-gradient(135deg, #3b82f6, #6366f1)',
  'linear-gradient(135deg, #a855f7, #ec4899)',
];

const QUICK_INSPIRATIONS = [
  { label: '🚀 Viral Reach', text: '3 actionable secrets to 10x your social media engagement in 30 days' },
  { label: '💡 Creator Mistake', text: 'The biggest mistake creators make when launching a new product' },
  { label: '🔥 Hot Take', text: 'Hot take: Why daily consistency beats talent every single time' },
  { label: '🎯 Carousel Hook', text: '5 free tools that will save you 15 hours of work every week' },
  { label: '⚡ Storytelling', text: 'Behind the scenes: How we turned a failure into our biggest win' },
  { label: '🧠 Mindset Shift', text: '1 habit you should build today to stay ahead in your industry' },
];

const EMOJI_LIST = ['❤️', '🔥', '💡', '🚀', '✨', '👏', '🙌', '💯', '🎯', '🤩'];

const displayName = (u) => u?.username || u?.email?.split('@')[0] || 'Friend';

const formatTimeAgo = (d) => {
  if (!d) return '';
  const date = new Date(d);
  const now = new Date();
  const diffSec = Math.floor((now - date) / 1000);
  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatMessageTime = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
};

export default function FriendsPage({ user }) {
  const navigate = useNavigate();
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [streak, setStreak] = useState(0);
  const [ideaText, setIdeaText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showDetails, setShowDetails] = useState(true);
  const [showPrompts, setShowPrompts] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [mobileChatView, setMobileChatView] = useState(false);
  const [reactions, setReactions] = useState(() => {
    try {
      const saved = localStorage.getItem('chatReactions');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  // Load friends on mount
  useEffect(() => {
    if (!user?.token) { setLoading(false); return; }
    fetchFriendStreaks()
      .then(data => {
        setFriends(data || []);
        if (data && data.length > 0 && !selectedFriend) {
          setSelectedFriend(data[0]);
        }
      })
      .catch(() => showErrorToast('Failed to load friends'))
      .finally(() => setLoading(false));
  }, [user]);

  // Load conversation when selected friend changes
  useEffect(() => {
    if (!selectedFriend) return;
    fetchConversation(selectedFriend.id)
      .then(data => {
        setMessages(data.messages || []);
        setStreak(data.streak || 0);
      })
      .catch(() => showErrorToast('Failed to load conversation'));
  }, [selectedFriend]);

  // Scroll to bottom of chat on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Save reactions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('chatReactions', JSON.stringify(reactions));
    } catch {
      // Ignore storage errors
    }
  }, [reactions]);

  // Filtered friends list
  const filteredFriends = useMemo(() => {
    if (!searchQuery.trim()) return friends;
    const q = searchQuery.toLowerCase();
    return friends.filter(f =>
      (f.username && f.username.toLowerCase().includes(q)) ||
      (f.email && f.email.toLowerCase().includes(q))
    );
  }, [friends, searchQuery]);

  // Send message or quick snap
  const handleSendIdea = async (contentToSend) => {
    const text = (contentToSend || ideaText).trim();
    if (!text || !selectedFriend) return;

    setSending(true);
    try {
      const result = await sendIdea(selectedFriend.id, text);
      showSuccessToast(`Idea sent! Streak: ${result.streak} days`);
      setIdeaText('');
      setShowPrompts(false);
      setShowEmojiPicker(false);
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
      inputRef.current?.focus();
    }
  };

  // Quick heart reaction
  const handleSendHeart = () => {
    handleSendIdea('❤️');
  };

  // Reaction on individual message
  const handleToggleReaction = (messageId, emoji) => {
    setReactions(prev => {
      const current = prev[messageId];
      if (current === emoji) {
        const copy = { ...prev };
        delete copy[messageId];
        return copy;
      }
      return { ...prev, [messageId]: emoji };
    });
  };

  // Copy message text
  const handleCopyMessage = (text) => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(text);
    showSuccessToast('Copied to clipboard!');
  };

  // Use idea directly in Post Genie
  const handleUseInPostGenie = (text) => {
    try {
      localStorage.setItem('pendingPrompt', text);
    } catch {
      // Ignore storage error
    }
    showSuccessToast('Opening in Post Genie...');
    navigate('/post-genie', { state: { prompt: text } });
  };

  // Select a friend
  const handleSelectFriend = (friend) => {
    setSelectedFriend(friend);
    setMobileChatView(true);
  };

  if (!user) {
    return (
      <div className="app-page" style={{ textAlign: 'center', padding: 80 }}>
        <div style={{
          maxWidth: 420, margin: '0 auto', background: '#ffffff',
          padding: 40, borderRadius: 16, border: '1px solid #dbdbdb',
          boxShadow: '0 8px 30px rgba(0,0,0,0.06)'
        }}>
          <div style={{ fontSize: 44, color: '#0095f6', marginBottom: 16 }}>
            <i className="far fa-paper-plane" />
          </div>
          <h2 style={{ color: '#262626', fontWeight: 800, fontSize: 22, margin: '0 0 8px' }}>Your Messages</h2>
          <p style={{ color: '#8e8e8e', fontSize: 14, margin: '0 0 24px' }}>
            Sign in to your Idea Pulse account to exchange ideas and keep your daily streaks alive!
          </p>
          <Link to="/auth" className={styles.igSendMessageBtn}>
            Sign In to Continue
          </Link>
        </div>
      </div>
    );
  }

  const currentUsername = user.email?.split('@')[0] || 'User';

  return (
    <div className="app-page">
      <div className={styles.igPageWrap}>
        <div className={styles.igMessengerCard}>

          {/* ── LEFT SIDEBAR: Conversations List ── */}
          <div className={`${styles.igSidebar} ${mobileChatView ? styles.igSidebarHiddenMobile : ''}`}>
            {/* Header with Username & Add Friends icon */}
            <div className={styles.igSidebarHeader}>
              <div className={styles.igCurrentUser}>
                <span>{currentUsername}</span>
                <i className={`fas fa-circle-check ${styles.igVerifiedBadge}`} title="Verified account" />
              </div>
              <Link to="/add-friends" className={styles.igNewChatBtn} title="Find & Add Friends">
                <i className="fa-regular fa-pen-to-square" />
              </Link>
            </div>

            {/* Search Friends */}
            <div className={styles.igSearchWrapper}>
              <div className={styles.igSearchBar}>
                <i className={`fas fa-magnifying-glass ${styles.igSearchIcon}`} />
                <input
                  type="text"
                  className={styles.igSearchInput}
                  placeholder="Search friends..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button className={styles.igSearchClear} onClick={() => setSearchQuery('')}>✕</button>
                )}
              </div>
            </div>

            {/* Messages Label / Active count */}
            <div className={styles.igSectionTitleRow}>
              <span>Messages</span>
              {friends.length > 0 && (
                <span className={styles.igStreakCountBadge}>
                  <i className="fas fa-fire me-1" /> {friends.reduce((acc, f) => acc + (f.streak > 0 ? 1 : 0), 0)} Streaks
                </span>
              )}
            </div>

            {/* Friends / Conversation Items */}
            <div className={styles.igFriendList}>
              {loading ? (
                <p style={{ textAlign: 'center', color: '#8e8e8e', padding: 30, fontSize: 13 }}>
                  <i className="fas fa-spinner fa-spin me-2" /> Loading conversations...
                </p>
              ) : filteredFriends.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#8e8e8e' }}>
                  <p style={{ fontSize: 13, margin: '0 0 12px' }}>
                    {searchQuery ? 'No friends found matching your search.' : 'No friends yet.'}
                  </p>
                  <Link to="/add-friends" className={styles.igIntroBtn} style={{ background: '#0095f6', color: '#ffffff' }}>
                    + Find Friends
                  </Link>
                </div>
              ) : (
                filteredFriends.map((friend, idx) => {
                  const isSelected = selectedFriend?.id === friend.id;
                  const avatarGradient = AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length];
                  return (
                    <button
                      key={friend.id}
                      type="button"
                      className={`${styles.igFriendItem} ${isSelected ? styles.igFriendItemActive : ''}`}
                      onClick={() => handleSelectFriend(friend)}
                    >
                      <div className={styles.igAvatarWrap}>
                        <div className={styles.igStoryRing}>
                          <div className={styles.igAvatar} style={{ background: avatarGradient }}>
                            {displayName(friend)[0]?.toUpperCase()}
                          </div>
                        </div>
                        <span className={styles.igOnlineDot} />
                      </div>

                      <div className={styles.igFriendContent}>
                        <div className={styles.igFriendNameRow}>
                          <span className={styles.igFriendUsername}>{displayName(friend)}</span>
                          {friend.streak > 0 && (
                            <span className={styles.igStreakPill}>
                              <i className="fas fa-fire" /> {friend.streak}d
                            </span>
                          )}
                        </div>
                        <p className={styles.igFriendSnippet}>
                          {friend.email}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* ── MAIN CHAT AREA ── */}
          {selectedFriend ? (
            <div className={`${styles.igChatWindow} ${!mobileChatView ? styles.igChatWindowHiddenMobile : ''}`}>

              {/* Chat Top Header */}
              <div className={styles.igChatHeader}>
                <div className={styles.igChatHeaderUser}>
                  {/* Mobile Back Button */}
                  <button
                    className="btn btn-sm d-md-none p-0 me-2 text-dark"
                    onClick={() => setMobileChatView(false)}
                    aria-label="Back to messages"
                  >
                    <i className="fas fa-arrow-left fs-5" />
                  </button>

                  <div className={styles.igAvatarWrap}>
                    <div className={styles.igStoryRing} style={{ padding: 1.5 }}>
                      <div
                        className={styles.igAvatar}
                        style={{
                          width: 38,
                          height: 38,
                          fontSize: 15,
                          background: AVATAR_GRADIENTS[
                            friends.findIndex(f => f.id === selectedFriend.id) % AVATAR_GRADIENTS.length
                          ]
                        }}
                      >
                        {displayName(selectedFriend)[0]?.toUpperCase()}
                      </div>
                    </div>
                    <span className={styles.igOnlineDot} style={{ width: 10, height: 10, bottom: 1, right: 1 }} />
                  </div>

                  <div className={styles.igChatHeaderInfo}>
                    <h3 className={styles.igChatHeaderName}>{displayName(selectedFriend)}</h3>
                    <p className={styles.igChatHeaderStatus}>
                      <span className={styles.igActiveIndicator} /> Active now
                    </p>
                  </div>
                </div>

                <div className={styles.igChatHeaderActions}>
                  {/* Streak pill */}
                  <div className={styles.igHeaderStreak}>
                    <i className="fas fa-fire" />
                    <span>{streak} day streak</span>
                  </div>

                  {/* Dummy call buttons */}
                  <button
                    className={styles.igHeaderActionBtn}
                    onClick={() => showSuccessToast('Voice calling coming soon!')}
                    title="Start audio call"
                  >
                    <i className="fa-solid fa-phone" />
                  </button>

                  <button
                    className={styles.igHeaderActionBtn}
                    onClick={() => showSuccessToast('Video calling coming soon!')}
                    title="Start video call"
                  >
                    <i className="fa-solid fa-video" />
                  </button>

                  {/* Toggle Details Drawer */}
                  <button
                    className={`${styles.igHeaderActionBtn} ${showDetails ? styles.igHeaderActionBtnActive : ''}`}
                    onClick={() => setShowDetails(prev => !prev)}
                    title="Conversation details & shared ideas"
                  >
                    <i className="fa-solid fa-circle-info" />
                  </button>
                </div>
              </div>

              {/* Chat Messages List */}
              <div className={styles.igMessagesArea}>

                {/* Conversation Intro Banner */}
                <div className={styles.igIntroBanner}>
                  <div className={styles.igIntroAvatarRing}>
                    <div
                      className={styles.igIntroAvatar}
                      style={{
                        background: AVATAR_GRADIENTS[
                          friends.findIndex(f => f.id === selectedFriend.id) % AVATAR_GRADIENTS.length
                        ]
                      }}
                    >
                      {displayName(selectedFriend)[0]?.toUpperCase()}
                    </div>
                  </div>
                  <h4 className={styles.igIntroName}>{displayName(selectedFriend)}</h4>
                  <p className={styles.igIntroHandle}>{selectedFriend.email}</p>
                  <div className={styles.igIntroStreak}>
                    <i className="fas fa-bolt me-1 text-primary" /> Idea Pulse Daily Streak · {streak} Days Active
                  </div>
                  <div className={styles.igIntroActions}>
                    <button className={styles.igIntroBtn} onClick={() => setShowPrompts(true)}>
                      <i className="fas fa-wand-magic-sparkles me-1 text-primary" /> Send Idea Snap
                    </button>
                    <Link to="/post-genie" className={styles.igIntroBtn}>
                      Open Post Genie
                    </Link>
                  </div>
                </div>

                {/* Date Divider */}
                <div className={styles.igDateDivider}>
                  <span>Today</span>
                </div>

                {/* Messages Body */}
                {messages.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px', color: '#8e8e8e' }}>
                    <i className="fa-regular fa-paper-plane" style={{ fontSize: 32, marginBottom: 10, display: 'block', color: '#cbd5e1' }} />
                    <p style={{ margin: 0, fontWeight: 600, color: '#262626' }}>No messages yet</p>
                    <p style={{ fontSize: 13, margin: '4px 0 0' }}>Send an idea snap to start building your streak!</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMine = msg.sender_email === user.email;
                    const reaction = reactions[msg.id];
                    const isHeart = msg.content === '❤️';

                    return (
                      <div
                        key={msg.id}
                        className={`${styles.igMessageRow} ${isMine ? styles.igMessageRowMine : styles.igMessageRowTheirs}`}
                        onDoubleClick={() => handleToggleReaction(msg.id, '❤️')}
                      >
                        {/* Mini Avatar for Received Messages */}
                        {!isMine && (
                          <div
                            className={styles.igMiniAvatar}
                            style={{
                              background: AVATAR_GRADIENTS[
                                friends.findIndex(f => f.id === selectedFriend.id) % AVATAR_GRADIENTS.length
                              ]
                            }}
                          >
                            {displayName(selectedFriend)[0]?.toUpperCase()}
                          </div>
                        )}

                        <div className={styles.igBubbleWrap}>
                          {/* Hover Actions Bar */}
                          <div className={styles.igHoverActions}>
                            <button
                              className={styles.igHoverActionBtn}
                              onClick={() => handleToggleReaction(msg.id, '❤️')}
                              title="React with Heart"
                            >
                              ❤️
                            </button>
                            <button
                              className={styles.igHoverActionBtn}
                              onClick={() => handleToggleReaction(msg.id, '🔥')}
                              title="React with Fire"
                            >
                              🔥
                            </button>
                            <button
                              className={styles.igHoverActionBtn}
                              onClick={() => handleToggleReaction(msg.id, '💡')}
                              title="React with Lightbulb"
                            >
                              💡
                            </button>
                            <button
                              className={styles.igHoverActionBtn}
                              onClick={() => handleToggleReaction(msg.id, '😂')}
                              title="React with Laugh"
                            >
                              😂
                            </button>
                            <button
                              className={styles.igHoverActionBtn}
                              onClick={() => handleCopyMessage(msg.content)}
                              title="Copy text"
                            >
                              <i className="far fa-copy" />
                            </button>
                            <button
                              className={styles.igHoverActionBtn}
                              onClick={() => handleUseInPostGenie(msg.content)}
                              title="Create Post with this idea"
                            >
                              <i className="fas fa-wand-magic-sparkles text-primary" />
                            </button>
                          </div>

                          {/* Message Bubble */}
                          {isHeart ? (
                            <div style={{ fontSize: 44, padding: '4px 8px', filter: 'drop-shadow(0 2px 8px rgba(239,68,68,0.3))' }}>
                              ❤️
                            </div>
                          ) : (
                            <div className={`${styles.igBubble} ${isMine ? styles.igBubbleMine : styles.igBubbleTheirs}`}>
                              <p className={styles.igBubbleText}>{msg.content}</p>

                              {/* If message is longer or looks like an idea, show quick action badge */}
                              {msg.content.length > 25 && (
                                <button
                                  type="button"
                                  className={styles.igIdeaActionBtn}
                                  onClick={() => handleUseInPostGenie(msg.content)}
                                >
                                  <i className="fas fa-wand-magic-sparkles" /> Use in Post Genie
                                </button>
                              )}

                              <span className={styles.igBubbleTime}>
                                {formatMessageTime(msg.created_at)}
                              </span>

                              {/* Attached Reaction Pill */}
                              {reaction && (
                                <span
                                  className={styles.igReactionBadge}
                                  onClick={() => handleToggleReaction(msg.id, reaction)}
                                >
                                  {reaction}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              {/* ── BOTTOM COMPOSER: Instagram Pill ── */}
              <div className={styles.igInputArea}>

                {/* AI Prompts / Hooks Popover */}
                {showPrompts && (
                  <div className={styles.igPromptsPopover}>
                    <div className={styles.igPromptsHeader}>
                      <h5 className={styles.igPromptsTitle}>
                        <i className="fas fa-wand-magic-sparkles text-primary" />
                        Quick Post Idea Inspiration
                      </h5>
                      <button
                        className="btn btn-sm text-muted p-0"
                        onClick={() => setShowPrompts(false)}
                      >
                        ✕
                      </button>
                    </div>
                    <div className={styles.igPromptsGrid}>
                      {QUICK_INSPIRATIONS.map((item, i) => (
                        <button
                          key={i}
                          type="button"
                          className={styles.igPromptItem}
                          onClick={() => {
                            setIdeaText(item.text);
                            setShowPrompts(false);
                            inputRef.current?.focus();
                          }}
                        >
                          <strong>{item.label}</strong>
                          <div>{item.text}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Emoji Popover */}
                {showEmojiPicker && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 'calc(100% + 8px)',
                      right: 20,
                      background: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: 14,
                      padding: '8px 12px',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                      display: 'flex',
                      gap: 8,
                      zIndex: 30
                    }}
                  >
                    {EMOJI_LIST.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        style={{
                          background: 'none',
                          border: 'none',
                          fontSize: 20,
                          cursor: 'pointer',
                          padding: '2px 4px',
                          transition: 'transform 0.15s'
                        }}
                        onClick={() => {
                          setIdeaText(prev => prev + emoji);
                          setShowEmojiPicker(false);
                          inputRef.current?.focus();
                        }}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}

                {/* Input Pill Container */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendIdea();
                  }}
                  className={styles.igInputContainer}
                >
                  {/* AI Ideas inspiration button */}
                  <button
                    type="button"
                    className={styles.igInspirationBtn}
                    onClick={() => setShowPrompts(prev => !prev)}
                    title="Instant AI Idea hooks"
                  >
                    <i className="fas fa-wand-magic-sparkles" />
                  </button>

                  <input
                    ref={inputRef}
                    type="text"
                    className={styles.igMessageInput}
                    placeholder="Message or share an idea..."
                    value={ideaText}
                    onChange={(e) => setIdeaText(e.target.value)}
                    disabled={sending}
                  />

                  <div className={styles.igInputActions}>
                    {/* Emoji toggle */}
                    <button
                      type="button"
                      className={styles.igEmojiBtn}
                      onClick={() => setShowEmojiPicker(prev => !prev)}
                      title="Insert emoji"
                    >
                      <i className="fa-regular fa-face-smile" />
                    </button>

                    {/* Quick Heart or Send Button */}
                    {!ideaText.trim() ? (
                      <button
                        type="button"
                        className={styles.igHeartBtn}
                        onClick={handleSendHeart}
                        disabled={sending}
                        title="Send quick heart"
                      >
                        <i className="fa-regular fa-heart" />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        className={styles.igSendBtn}
                        disabled={sending || !ideaText.trim()}
                      >
                        {sending ? '...' : 'Send'}
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          ) : (
            /* No conversation selected state */
            <div className={styles.igNoChatSelected}>
              <div className={styles.igNoChatIconWrap}>
                <i className="fa-regular fa-paper-plane" />
              </div>
              <h3 className={styles.igNoChatTitle}>Your Messages</h3>
              <p className={styles.igNoChatSub}>
                Send private photos and ideas to a friend or group to keep your streak alive.
              </p>
              <Link to="/add-friends" className={styles.igSendMessageBtn}>
                Find & Add Friends
              </Link>
            </div>
          )}

          {/* ── RIGHT DETAILS DRAWER (Toggleable) ── */}
          {selectedFriend && showDetails && (
            <div className={styles.igDetailsDrawer}>
              <div className={styles.igDrawerHeader}>
                <h4 className={styles.igDrawerTitle}>Details</h4>
                <button
                  className={styles.igDrawerClose}
                  onClick={() => setShowDetails(false)}
                  aria-label="Close details"
                >
                  ✕
                </button>
              </div>

              {/* Profile Card */}
              <div className={styles.igDrawerProfile}>
                <div
                  className={styles.igDrawerAvatar}
                  style={{
                    background: AVATAR_GRADIENTS[
                      friends.findIndex(f => f.id === selectedFriend.id) % AVATAR_GRADIENTS.length
                    ]
                  }}
                >
                  {displayName(selectedFriend)[0]?.toUpperCase()}
                </div>
                <h4 className={styles.igDrawerName}>{displayName(selectedFriend)}</h4>
                <p className={styles.igDrawerEmail}>{selectedFriend.email}</p>

                <div className={styles.igDrawerStats}>
                  <div className={styles.igStatCard}>
                    <p className={styles.igStatNum}>{streak} Days</p>
                    <p className={styles.igStatLabel}>Current Streak</p>
                  </div>
                  <div className={styles.igStatCard}>
                    <p className={styles.igStatNum}>{messages.length}</p>
                    <p className={styles.igStatLabel}>Ideas Exchanged</p>
                  </div>
                </div>
              </div>

              {/* Shared Ideas in this conversation */}
              <div className={styles.igDrawerSection}>
                <div className={styles.igDrawerSectionTitle}>
                  <span>Shared Ideas & Prompts</span>
                  <span className="badge bg-light text-dark">{messages.filter(m => m.content.length > 10).length}</span>
                </div>

                <div className={styles.igSharedIdeaList}>
                  {messages.filter(m => m.content.length > 10).length === 0 ? (
                    <p style={{ fontSize: 12, color: '#8e8e8e', textAlign: 'center', margin: '10px 0' }}>
                      No long ideas shared yet.
                    </p>
                  ) : (
                    messages
                      .filter(m => m.content.length > 10)
                      .slice(-6)
                      .reverse()
                      .map((m) => (
                        <div key={m.id} className={styles.igSharedIdeaItem}>
                          <p style={{ margin: 0, fontWeight: 500 }}>"{m.content}"</p>
                          <div className={styles.igSharedIdeaFooter}>
                            <button
                              type="button"
                              className={styles.igUseInGenieBtn}
                              onClick={() => handleUseInPostGenie(m.content)}
                            >
                              <i className="fas fa-wand-magic-sparkles" /> Create Post
                            </button>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>

              {/* Chat Controls */}
              <div className={styles.igDrawerSection}>
                <div className={styles.igDrawerSectionTitle}>
                  <span>Options</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <button
                    className="btn btn-sm btn-light text-start text-dark d-flex align-items-center justify-content-between p-2 rounded-3"
                    onClick={() => showSuccessToast('Notifications are on for this chat')}
                  >
                    <span><i className="fa-regular fa-bell me-2" /> Mute Messages</span>
                    <span className="badge bg-secondary">Off</span>
                  </button>
                  <button
                    className="btn btn-sm btn-light text-start text-dark d-flex align-items-center justify-content-between p-2 rounded-3"
                    onClick={() => {
                      const text = messages.map(m => `${m.sender_email}: ${m.content}`).join('\n');
                      if (navigator.clipboard) {
                        navigator.clipboard.writeText(text);
                        showSuccessToast('Conversation transcript copied!');
                      }
                    }}
                  >
                    <span><i className="fa-regular fa-copy me-2" /> Export Chat Ideas</span>
                    <i className="fas fa-chevron-right text-muted" style={{ fontSize: 11 }} />
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
