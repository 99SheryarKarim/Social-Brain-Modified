import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { fetchLibrary, deletePost, schedulePost, unschedulePost } from '../../features/posts/postsSlice';
import { showSuccessToast, showErrorToast } from '../../utils/toast';
import PostCard from '../../components/post-card/PostCard';

const BASE = 'http://localhost:3001/api/facebook';
const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

// Modal to show likers and comments
const EngagementModal = ({ post, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('reactions');

  useEffect(() => {
    axios.get(`${BASE}/post-details/${post.facebook_post_id}`, { headers: getHeaders() })
      .then(res => setData(res.data))
      .catch(err => setData({ error: err.response?.data?.message || 'Failed to load' }))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
    }} onClick={onClose}>
      <div style={{
        background: '#fff', borderRadius: 16, width: '100%', maxWidth: 480,
        maxHeight: '80vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ padding: '20px 24px 0', borderBottom: '1px solid #f1f5f9' }}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>Post Engagement</h6>
            <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#94a3b8' }}>✕</button>
          </div>
          <div className="d-flex gap-3">
            <button onClick={() => setTab('reactions')} style={{
              background: 'none', border: 'none', padding: '8px 0', cursor: 'pointer',
              fontWeight: 600, fontSize: 13, color: tab === 'reactions' ? '#6366f1' : '#94a3b8',
              borderBottom: tab === 'reactions' ? '2px solid #6366f1' : '2px solid transparent'
            }}>
              👍 Reactions {data && !data.error ? `(${data.reactions?.length || 0})` : ''}
            </button>
            <button onClick={() => setTab('comments')} style={{
              background: 'none', border: 'none', padding: '8px 0', cursor: 'pointer',
              fontWeight: 600, fontSize: 13, color: tab === 'comments' ? '#6366f1' : '#94a3b8',
              borderBottom: tab === 'comments' ? '2px solid #6366f1' : '2px solid transparent'
            }}>
              💬 Comments {data && !data.error ? `(${data.comments?.length || 0})` : ''}
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ overflowY: 'auto', padding: '16px 24px', flexGrow: 1 }}>
          {loading && <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Loading...</p>}
          {data?.error && <p style={{ textAlign: 'center', color: '#ef4444', fontSize: 13 }}>{data.error}</p>}

          {/* Reactions */}
          {!loading && !data?.error && tab === 'reactions' && (
            data.reactions.length === 0
              ? <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: 13, marginTop: 24 }}>No reactions yet</p>
              : data.reactions.map((r, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #f8fafc' }}>
                  <img src={r.pic_square || `https://ui-avatars.com/api/?name=${encodeURIComponent(r.name)}&size=36&background=6366f1&color=fff`}
                    style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
                    onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(r.name)}&size=36&background=6366f1&color=fff`; }}
                    alt={r.name} />
                  <span style={{ fontSize: 14, fontWeight: 500, color: '#1e293b' }}>{r.name}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 18 }}>👍</span>
                </div>
              ))
          )}

          {/* Comments */}
          {!loading && !data?.error && tab === 'comments' && (
            data.comments.length === 0
              ? <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: 13, marginTop: 24 }}>No comments yet</p>
              : data.comments.map((c, i) => (
                <div key={i} style={{ padding: '12px 0', borderBottom: '1px solid #f8fafc' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontWeight: 700, fontSize: 13, flexShrink: 0
                    }}>
                      {c.from?.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: '#1e293b' }}>{c.from?.name || 'Unknown'}</p>
                      <p style={{ margin: 0, fontSize: 11, color: '#94a3b8' }}>
                        {new Date(c.created_time).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: '#374151', paddingLeft: 42 }}>{c.message}</p>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
};

const PostsPage = ({ user }) => {
  const dispatch = useDispatch();
  const { posts, library, loading, libraryLoading } = useSelector((state) => state.posts);
  const [activeTab, setActiveTab] = useState('generated');
  const [publishing, setPublishing] = useState(null);
  const [schedulingId, setSchedulingId] = useState(null);
  const [scheduledTimes, setScheduledTimes] = useState({});
  const [syncing, setSyncing] = useState(false);
  const [engagementPost, setEngagementPost] = useState(null);

  useEffect(() => {
    if (user) dispatch(fetchLibrary());
  }, [user]);

  const handleSyncEngagement = async () => {
    setSyncing(true);
    try {
      await axios.get(`${BASE}/sync-engagement`, { headers: getHeaders() });
      dispatch(fetchLibrary());
      showSuccessToast('📊 Engagement stats updated!');
    } catch (err) {
      showErrorToast(err.response?.data?.message || 'Failed to sync engagement');
    } finally {
      setSyncing(false);
    }
  };

  const handleUpload = async (post, index) => {
    if (!localStorage.getItem('token')) return showErrorToast('Please log in to publish posts');
    setPublishing(index);
    try {
      await axios.post(`${BASE}/post`, {
        content: post.content,
        imageUrl: post.imageUrl || null,
        hashtags: post.hashtags || '',
        originalTopic: post.original_topic || post.originalTopic || '',
        postDbId: post.id || null,
      }, { headers: getHeaders() });
      showSuccessToast('🚀 Post published to Facebook!');
      if (user) dispatch(fetchLibrary()); // refresh to show published badge
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to publish';
      if (msg.includes('No Facebook page')) {
        showErrorToast('Please connect your Facebook page first in Connect Social');
      } else if (msg.toLowerCase().includes('session') || msg.toLowerCase().includes('expired') || msg.toLowerCase().includes('token')) {
        showErrorToast('Facebook session expired. Go to Connect page and reconnect your Facebook page.');
      } else {
        showErrorToast(msg);
      }
    } finally {
      setPublishing(null);
    }
  };

  const handleDelete = (postId) => {
    dispatch(deletePost(postId));
    showSuccessToast('Post deleted');
  };

  const handleSchedule = async (postId) => {
    const scheduledAt = scheduledTimes[postId];
    if (!scheduledAt) return showErrorToast('Please pick a date and time');
    if (new Date(scheduledAt) <= new Date()) return showErrorToast('Please pick a future date and time');

    const result = await dispatch(schedulePost({ postId, scheduledAt }));
    if (result.type.endsWith('fulfilled')) {
      showSuccessToast(`⏰ Post scheduled for ${new Date(scheduledAt).toLocaleString()}`);
      setSchedulingId(null);
    } else {
      showErrorToast('Failed to schedule post');
    }
  };

  const handleUnschedule = async (postId) => {
    const result = await dispatch(unschedulePost(postId));
    if (result.type.endsWith('fulfilled')) showSuccessToast('Schedule cancelled');
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const formatScheduled = (d) => new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  // Min datetime for picker = now
  const minDateTime = new Date(Date.now() + 60000).toISOString().slice(0, 16);

  return (
    <div className="container py-5">
      {engagementPost && <EngagementModal post={engagementPost} onClose={() => setEngagementPost(null)} />}
      <div className="mb-4 text-center">
        <h2 className="fw-bold">📚 My Posts</h2>
        <p className="text-muted">Your generated content library</p>
      </div>

      {/* Tabs */}
      <div className="d-flex gap-2 mb-4 justify-content-center">
        <button className={`btn rounded-pill px-4 ${activeTab === 'generated' ? 'btn-dark' : 'btn-outline-secondary'}`}
          onClick={() => setActiveTab('generated')}>
          ✨ Just Generated {posts.length > 0 && <span className="badge bg-primary ms-1">{posts.length}</span>}
        </button>
        <button className={`btn rounded-pill px-4 ${activeTab === 'library' ? 'btn-dark' : 'btn-outline-secondary'}`}
          onClick={() => setActiveTab('library')}>
          🗂️ Archive {library.length > 0 && <span className="badge bg-secondary ms-1">{library.length}</span>}
        </button>
      </div>

      {/* Generated Posts Tab */}
      {activeTab === 'generated' && (
        <>
          {loading && <p className="text-center text-muted">⏳ Generating posts...</p>}
          {posts.length === 0 && !loading && (
            <div className="text-center py-5">
              <i className="fas fa-magic-wand-sparkles fs-1 text-muted mb-3" />
              <p className="text-muted">No posts generated yet. Go to Post Genie to create some!</p>
            </div>
          )}
          <div className="row">
            {posts.map((post, index) => (
              <PostCard key={index} post={post} number={index + 1}
                onEdit={() => {}} onUpload={() => handleUpload(post, index)}
                uploading={publishing === index} />
            ))}
          </div>
        </>
      )}

      {/* Archive Tab */}
      {activeTab === 'library' && (
        <>
          {!user && (
            <div className="text-center py-5">
              <i className="fas fa-lock fs-1 text-muted mb-3" />
              <p className="text-muted">Please log in to view your post archive</p>
            </div>
          )}
          {user && libraryLoading && <p className="text-center text-muted">⏳ Loading archive...</p>}
          {user && !libraryLoading && library.length === 0 && (
            <div className="text-center py-5">
              <i className="fas fa-inbox fs-1 text-muted mb-3" />
              <p className="text-muted">No saved posts yet. Generate some posts to build your archive!</p>
            </div>
          )}
          {user && !libraryLoading && library.length > 0 && (
            <>
              {/* Sync engagement button */}
              <div className="d-flex justify-content-end mb-3">
                <button className="btn btn-sm btn-outline-primary rounded-pill"
                  onClick={handleSyncEngagement} disabled={syncing}>
                  {syncing
                    ? <><i className="fas fa-spinner fa-spin me-1" />Syncing...</>
                    : <><i className="fas fa-rotate me-1" />Sync Engagement</>}
                </button>
              </div>
              <div className="row g-4">
              {library.map((post) => (
                <div key={post.id} className="col-md-6 col-lg-4">
                  <div className="card border-0 shadow-sm rounded-4 h-100">
                    <LibraryImage post={post} />
                    <div className="card-body d-flex flex-column">

                      {/* Badges */}
                      <div className="d-flex gap-2 mb-2 flex-wrap">
                        {post.tone && <span className="badge rounded-pill bg-primary bg-opacity-10 text-primary">{post.tone}</span>}
                        {post.original_topic && <span className="badge rounded-pill bg-light text-dark">{post.original_topic}</span>}
                        {post.posted_to_facebook && <span className="badge rounded-pill bg-success">✓ Published</span>}
                        {post.scheduled_at && !post.posted_to_facebook && (
                          <span className="badge rounded-pill bg-warning text-dark">
                            ⏰ {formatScheduled(post.scheduled_at)}
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <p className="text-muted small flex-grow-1" style={{ overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical' }}>
                        {post.content}
                      </p>
                      {post.hashtags && <p className="text-primary small">{post.hashtags}</p>}
                      <p className="text-muted" style={{ fontSize: 11 }}>{formatDate(post.created_at)}</p>

                      {/* Schedule picker (shown when scheduling this card) */}
                      {schedulingId === post.id && (
                        <div className="mb-2 p-2 bg-light rounded-3">
                          <label className="form-label small fw-semibold mb-1">Pick date & time:</label>
                          <input type="datetime-local" className="form-control form-control-sm mb-2"
                            min={minDateTime}
                            value={scheduledTimes[post.id] || ''}
                            onChange={(e) => setScheduledTimes(prev => ({ ...prev, [post.id]: e.target.value }))} />
                          <div className="d-flex gap-1">
                            <button className="btn btn-sm btn-warning rounded-pill flex-grow-1"
                              onClick={() => handleSchedule(post.id)}>
                              Confirm Schedule
                            </button>
                            <button className="btn btn-sm btn-outline-secondary rounded-pill"
                              onClick={() => setSchedulingId(null)}>
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Action buttons */}
                      {!post.posted_to_facebook && (
                        <div className="d-flex gap-2 mt-2 flex-wrap">
                          <button className="btn btn-sm btn-dark rounded-pill flex-grow-1"
                            onClick={() => handleUpload(post, `lib-${post.id}`)}
                            disabled={publishing === `lib-${post.id}`}>
                            {publishing === `lib-${post.id}`
                              ? <><i className="fas fa-spinner fa-spin me-1" />Publishing...</>
                              : '🚀 Publish Now'}
                          </button>

                          {post.scheduled_at ? (
                            <button className="btn btn-sm btn-outline-warning rounded-pill"
                              onClick={() => handleUnschedule(post.id)} title="Cancel schedule">
                              <i className="fas fa-clock-rotate-left" />
                            </button>
                          ) : (
                            <button className="btn btn-sm btn-outline-warning rounded-pill"
                              onClick={() => setSchedulingId(schedulingId === post.id ? null : post.id)}
                              title="Schedule post">
                              <i className="fas fa-clock" />
                            </button>
                          )}

                          <button className="btn btn-sm btn-outline-danger rounded-pill"
                            onClick={() => handleDelete(post.id)}>
                            <i className="fas fa-trash" />
                          </button>
                        </div>
                      )}

                      {post.posted_to_facebook && (
                        <div className="mt-2">
                          <span className="text-success small d-block mb-2">
                            <i className="fas fa-check-circle me-1" />Published to Facebook
                          </span>
                          <div className="d-flex gap-3">
                            <button
                              onClick={() => setEngagementPost(post)}
                              style={{ background: '#eef2ff', border: 'none', borderRadius: 8, padding: '5px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}
                            >
                              <i className="fas fa-thumbs-up" style={{ color: '#6366f1', fontSize: 12 }} />
                              <span style={{ fontSize: 12, fontWeight: 600, color: '#6366f1' }}>{post.likes ?? 0} Likes</span>
                            </button>
                            <button
                              onClick={() => setEngagementPost(post)}
                              style={{ background: '#f0f9ff', border: 'none', borderRadius: 8, padding: '5px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}
                            >
                              <i className="fas fa-comment" style={{ color: '#0ea5e9', fontSize: 12 }} />
                              <span style={{ fontSize: 12, fontWeight: 600, color: '#0ea5e9' }}>{post.comments ?? 0} Comments</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

const LibraryImage = ({ post }) => {
  const [imgSrc, setImgSrc] = useState(null);

  useEffect(() => {
    const query = post.original_topic || post.image_prompt || 'social media';
    const searchQuery = post.tone ? `${query} ${post.tone}` : query;
    const apiKey = import.meta.env.VITE_PEXELS_API_KEY;

    fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(searchQuery)}&per_page=1`, {
      headers: { Authorization: apiKey }
    })
      .then(r => r.json())
      .then(data => {
        setImgSrc(data.photos?.length > 0
          ? data.photos[0].src.landscape
          : `https://picsum.photos/seed/${encodeURIComponent(query)}/400/200`);
      })
      .catch(() => setImgSrc('https://picsum.photos/400/200'));
  }, [post.original_topic, post.image_prompt, post.tone]);

  return (
    <img src={imgSrc || 'https://picsum.photos/400/200'} alt={post.original_topic || 'post'}
      className="card-img-top rounded-top-4"
      style={{ height: 180, objectFit: 'cover' }}
      onError={() => setImgSrc('https://picsum.photos/400/200')} />
  );
};

export default PostsPage;
