import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });
const FB_BASE = 'http://localhost:3001/api/facebook';

const activityConfig = {
  ideas_generated: { label: 'Ideas Generated', color: '#6366f1', bg: '#eef2ff' },
  posts_generated: { label: 'Posts Generated', color: '#0ea5e9', bg: '#f0f9ff' },
  post_uploaded:   { label: 'Post Published',  color: '#10b981', bg: '#ecfdf5' },
};

const quickActions = [
  { to: '/post-genie',     icon: 'fas fa-wand-magic-sparkles', label: 'Post Genie',   desc: 'Generate AI content',    accent: '#6366f1', bg: '#eef2ff' },
  { to: '/posts',          icon: 'fas fa-layer-group',          label: 'My Archive',   desc: 'View & schedule posts',  accent: '#10b981', bg: '#ecfdf5' },
  { to: '/connect-social', icon: 'fas fa-plug',                 label: 'Connect',      desc: 'Link Facebook page',     accent: '#f43f5e', bg: '#fff1f2' },
  { to: '/settings',       icon: 'fas fa-sliders',              label: 'Brand Voice',  desc: 'Set your brand context', accent: '#8b5cf6', bg: '#f5f3ff' },
];

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const formatTime = (d) => new Date(d).toLocaleString('en-US', {
  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
});

// ── Engagement Modal ──────────────────────────────────────────────
const EngagementModal = ({ type, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(type); // 'reactions' or 'comments'

  useEffect(() => {
    // Fetch all published posts then aggregate their engagement details
    axios.get('http://localhost:3001/api/library', { headers: getHeaders() })
      .then(async (res) => {
        const published = res.data.filter(p => p.posted_to_facebook && p.facebook_post_id);
        const allReactions = [];
        const allComments = [];

        await Promise.all(published.map(async (post) => {
          try {
            const r = await axios.get(`${FB_BASE}/post-details/${post.facebook_post_id}`, { headers: getHeaders() });
            r.data.reactions?.forEach(rx => allReactions.push({ ...rx, postTopic: post.original_topic || 'Post' }));
            r.data.comments?.forEach(c => allComments.push({ ...c, postTopic: post.original_topic || 'Post' }));
          } catch { /* skip failed posts */ }
        }));

        setData({ reactions: allReactions, comments: allComments });
      })
      .catch(() => setData({ error: 'Failed to load engagement data' }))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)',
      zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16, backdropFilter: 'blur(4px)'
    }} onClick={onClose}>
      <div style={{
        background: '#fff', borderRadius: 20, width: '100%', maxWidth: 520,
        maxHeight: '85vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 25px 80px rgba(0,0,0,0.25)',
        animation: 'modalIn 0.2s ease-out'
      }} onClick={e => e.stopPropagation()}>
        <style>{`@keyframes modalIn { from { opacity:0; transform:scale(0.95) translateY(10px); } to { opacity:1; transform:scale(1) translateY(0); } }`}</style>

        {/* Header */}
        <div style={{ padding: '24px 28px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h5 style={{ margin: 0, fontWeight: 700, color: '#0f172a', fontSize: 17 }}>Engagement Details</h5>
              <p style={{ margin: '3px 0 0', fontSize: 12, color: '#94a3b8' }}>Across all your published posts</p>
            </div>
            <button onClick={onClose} style={{
              width: 32, height: 32, borderRadius: '50%', border: 'none',
              background: '#f1f5f9', cursor: 'pointer', fontSize: 14, color: '#64748b',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>✕</button>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, background: '#f8fafc', borderRadius: 10, padding: 4 }}>
            {['reactions', 'comments'].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                flex: 1, padding: '8px 0', border: 'none', borderRadius: 8, cursor: 'pointer',
                fontWeight: 600, fontSize: 13, transition: 'all 0.15s',
                background: tab === t ? '#fff' : 'transparent',
                color: tab === t ? '#6366f1' : '#94a3b8',
                boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.08)' : 'none'
              }}>
                {t === 'reactions' ? '👍' : '💬'} {t.charAt(0).toUpperCase() + t.slice(1)}
                {data && !data.error && (
                  <span style={{
                    marginLeft: 6, fontSize: 11, background: tab === t ? '#eef2ff' : '#f1f5f9',
                    color: tab === t ? '#6366f1' : '#94a3b8', borderRadius: 20, padding: '1px 7px'
                  }}>
                    {t === 'reactions' ? data.reactions?.length : data.comments?.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div style={{ overflowY: 'auto', padding: '16px 28px 24px', flexGrow: 1 }}>
          {loading && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                border: '3px solid #e2e8f0', borderTopColor: '#6366f1',
                animation: 'spin 0.8s linear infinite', margin: '0 auto 12px'
              }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <p style={{ color: '#94a3b8', fontSize: 13, margin: 0 }}>Fetching from Facebook...</p>
            </div>
          )}

          {data?.error && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <i className="fas fa-exclamation-circle" style={{ color: '#f43f5e', fontSize: 28, marginBottom: 12, display: 'block' }} />
              <p style={{ color: '#64748b', fontSize: 13 }}>{data.error}</p>
            </div>
          )}

          {/* Reactions List */}
          {!loading && !data?.error && tab === 'reactions' && (
            data.reactions.length === 0
              ? <EmptyState icon="👍" text="No reactions yet" sub="Share your posts to get likes!" />
              : data.reactions.map((r, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 0', borderBottom: i < data.reactions.length - 1 ? '1px solid #f8fafc' : 'none'
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 700, fontSize: 15
                  }}>
                    {r.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div style={{ flexGrow: 1 }}>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: '#1e293b' }}>{r.name}</p>
                    <p style={{ margin: 0, fontSize: 11, color: '#94a3b8' }}>Liked: {r.postTopic}</p>
                  </div>
                  <span style={{ fontSize: 20 }}>👍</span>
                </div>
              ))
          )}

          {/* Comments List */}
          {!loading && !data?.error && tab === 'comments' && (
            data.comments.length === 0
              ? <EmptyState icon="💬" text="No comments yet" sub="Engage your audience to get comments!" />
              : data.comments.map((c, i) => (
                <div key={i} style={{
                  padding: '14px 0', borderBottom: i < data.comments.length - 1 ? '1px solid #f8fafc' : 'none'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                      background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontWeight: 700, fontSize: 14
                    }}>
                      {c.from?.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div style={{ flexGrow: 1 }}>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: '#1e293b' }}>{c.from?.name || 'Unknown'}</p>
                      <p style={{ margin: 0, fontSize: 11, color: '#94a3b8' }}>
                        on "{c.postTopic}" · {formatTime(c.created_time)}
                      </p>
                    </div>
                  </div>
                  <div style={{
                    background: '#f8fafc', borderRadius: 10, padding: '10px 14px',
                    marginLeft: 46, fontSize: 13, color: '#374151', lineHeight: 1.5
                  }}>
                    {c.message}
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ icon, text, sub }) => (
  <div style={{ textAlign: 'center', padding: '40px 0' }}>
    <div style={{ fontSize: 36, marginBottom: 12 }}>{icon}</div>
    <p style={{ margin: 0, fontWeight: 600, color: '#64748b', fontSize: 14 }}>{text}</p>
    <p style={{ margin: '4px 0 0', fontSize: 12, color: '#94a3b8' }}>{sub}</p>
  </div>
);

// ── Metric Card ───────────────────────────────────────────────────
const MetricCard = ({ icon, label, value, accent, bg, sublabel, onClick }) => (
  <div className="col-6 col-xl-3">
    <div style={{
      background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(8px)',
      borderRadius: 16, padding: '24px',
      boxShadow: '0 1px 3px rgba(99,102,241,0.08)',
      border: '1px solid rgba(255,255,255,0.9)', height: '100%',
      transition: 'box-shadow 0.2s, transform 0.2s',
      cursor: onClick ? 'pointer' : 'default'
    }}
      onClick={onClick}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(99,102,241,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div style={{ width: 42, height: 42, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <i className={icon} style={{ color: accent, fontSize: 16 }} />
        </div>
        <span style={{ fontSize: 32, fontWeight: 800, color: '#0f172a', letterSpacing: '-1.5px', lineHeight: 1 }}>{value}</span>
      </div>
      <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: '#334155' }}>{label}</p>
      <p style={{ margin: '3px 0 0', fontSize: 11, color: '#94a3b8' }}>
        {sublabel} {onClick && <span style={{ color: accent, fontSize: 10 }}>· click to view</span>}
      </p>
    </div>
  </div>
);

// ── Dashboard Page ────────────────────────────────────────────────
export default function DashboardPage({ user }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [engagementModal, setEngagementModal] = useState(null); // 'reactions' | 'comments' | null

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    axios.get('http://localhost:3001/api/dashboard', { headers: getHeaders() })
      .then(res => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 50%, #ede9fe 100%)', minHeight: '100vh', padding: '32px 28px', fontFamily: "'Inter', system-ui, sans-serif" }}>

      {engagementModal && <EngagementModal type={engagementModal} onClose={() => setEngagementModal(null)} />}

      {/* Header */}
      <div className="d-flex align-items-start justify-content-between mb-4 flex-wrap gap-3">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: 0, letterSpacing: '-0.5px' }}>
            {user ? `${greeting()}, ${user.email.split('@')[0]} 👋` : 'Dashboard'}
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: '#64748b' }}>
            {user ? "Here's your content overview for today." : 'Your AI-powered social media command center.'}
          </p>
        </div>
        {user && (
          <Link to="/post-genie" style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff',
            borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 600,
            textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8,
            boxShadow: '0 4px 14px rgba(99,102,241,0.35)'
          }}>
            <i className="fas fa-plus" style={{ fontSize: 11 }} /> Create New Post
          </Link>
        )}
      </div>

      {/* Guest Hero */}
      {!user && (
        <div style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)',
          borderRadius: 20, padding: '56px 40px', textAlign: 'center', marginBottom: 32,
          position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
          <div style={{ position: 'absolute', bottom: -40, left: -40, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 20, padding: '6px 14px', marginBottom: 20 }}>
            <i className="fas fa-brain" style={{ color: '#a5b4fc', fontSize: 12 }} />
            <span style={{ color: '#a5b4fc', fontSize: 12, fontWeight: 600 }}>AI-Powered Platform</span>
          </div>
          <h2 style={{ color: '#fff', fontWeight: 800, fontSize: 32, marginBottom: 12, letterSpacing: '-1px' }}>Welcome to Social Brain</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15, maxWidth: 480, margin: '0 auto 32px' }}>
            Generate, schedule, and publish AI-crafted social media posts — all from one intelligent dashboard.
          </p>
          <div className="d-flex gap-3 justify-content-center flex-wrap">
            <Link to="/post-genie" style={{ background: '#fff', color: '#4f46e5', borderRadius: 10, padding: '12px 28px', fontWeight: 700, fontSize: 14, textDecoration: 'none', boxShadow: '0 4px 14px rgba(0,0,0,0.2)' }}>Get Started Free</Link>
            <Link to="/profile" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: 10, padding: '12px 28px', fontWeight: 600, fontSize: 14, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.2)' }}>Sign In</Link>
          </div>
        </div>
      )}

      {/* Loading */}
      {user && loading && (
        <div className="text-center py-5">
          <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid #e2e8f0', borderTopColor: '#6366f1', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 16 }}>Loading your dashboard...</p>
        </div>
      )}

      {/* Logged-in Content */}
      {user && !loading && (
        <>
          {/* Metric Cards */}
          <div className="row g-3 mb-4">
            <MetricCard icon="fas fa-pen-nib"     label="Total Posts"    value={stats?.totalPosts ?? 0}      accent="#6366f1" bg="#eef2ff" sublabel="All generated posts" />
            <MetricCard icon="fas fa-clock"        label="Scheduled"      value={stats?.scheduled ?? 0}        accent="#f59e0b" bg="#fffbeb" sublabel="Pending auto-publish" />
            <MetricCard icon="fas fa-paper-plane"  label="Published"      value={stats?.published ?? 0}        accent="#10b981" bg="#ecfdf5" sublabel="Posted to Facebook" />
            <MetricCard icon="fas fa-chart-line"   label="Activities"     value={stats?.totalActivities ?? 0}  accent="#f43f5e" bg="#fff1f2" sublabel="Total actions logged" />
            <MetricCard icon="fas fa-thumbs-up"    label="Total Likes"    value={stats?.totalLikes ?? 0}       accent="#3b82f6" bg="#eff6ff" sublabel="Across all posts"
              onClick={() => setEngagementModal('reactions')} />
            <MetricCard icon="fas fa-comment"      label="Total Comments" value={stats?.totalComments ?? 0}    accent="#8b5cf6" bg="#f5f3ff" sublabel="Across all posts"
              onClick={() => setEngagementModal('comments')} />
          </div>

          {/* Bottom Row */}
          <div className="row g-3">
            {/* Quick Actions */}
            <div className="col-lg-5">
              <div style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(8px)', borderRadius: 16, padding: '24px', boxShadow: '0 1px 3px rgba(99,102,241,0.08)', border: '1px solid rgba(255,255,255,0.9)', height: '100%' }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Quick Actions</p>
                <div className="row g-2">
                  {quickActions.map((a) => (
                    <div key={a.to} className="col-6">
                      <Link to={a.to} className="text-decoration-none">
                        <div style={{ background: 'rgba(255,255,255,0.6)', borderRadius: 12, padding: '16px', border: '1px solid rgba(255,255,255,0.8)', transition: 'all 0.2s', cursor: 'pointer' }}
                          onMouseEnter={e => { e.currentTarget.style.background = a.bg; e.currentTarget.style.borderColor = a.accent + '30'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.6)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.8)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                          <div style={{ width: 32, height: 32, borderRadius: 8, background: a.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                            <i className={a.icon} style={{ color: a.accent, fontSize: 13 }} />
                          </div>
                          <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: '#1e293b' }}>{a.label}</p>
                          <p style={{ margin: '2px 0 0', fontSize: 11, color: '#94a3b8' }}>{a.desc}</p>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Activity Feed */}
            <div className="col-lg-7">
              <div style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(8px)', borderRadius: 16, padding: '24px', boxShadow: '0 1px 3px rgba(99,102,241,0.08)', border: '1px solid rgba(255,255,255,0.9)', height: '100%' }}>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Recent Activity</p>
                  <Link to="/recent" style={{ fontSize: 12, color: '#6366f1', textDecoration: 'none', fontWeight: 600 }}>View all →</Link>
                </div>
                {!stats?.recentActivity?.length ? (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                      <i className="fas fa-inbox" style={{ color: '#cbd5e1', fontSize: 20 }} />
                    </div>
                    <p style={{ color: '#94a3b8', fontSize: 13, margin: 0, fontWeight: 500 }}>No activity yet</p>
                    <p style={{ color: '#cbd5e1', fontSize: 12, margin: '4px 0 0' }}>Start generating posts to see your activity here</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {stats.recentActivity.map((item, idx) => {
                      const cfg = activityConfig[item.type] || { label: item.type, color: '#64748b', bg: '#f8fafc' };
                      const meta = item.meta ? JSON.parse(item.meta) : {};
                      const isLast = idx === stats.recentActivity.length - 1;
                      return (
                        <div key={item.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0', borderBottom: isLast ? 'none' : '1px solid #f1f5f9' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 3 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />
                            {!isLast && <div style={{ width: 1, flexGrow: 1, background: '#f1f5f9', marginTop: 4, minHeight: 20 }} />}
                          </div>
                          <div style={{ flexGrow: 1, minWidth: 0 }}>
                            <p style={{ margin: 0, fontSize: 13, color: '#1e293b', fontWeight: 500 }}>{item.description}</p>
                            <div style={{ display: 'flex', gap: 6, marginTop: 5, flexWrap: 'wrap' }}>
                              {meta.tone && <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: cfg.bg, color: cfg.color, fontWeight: 600 }}>{meta.tone}</span>}
                              {meta.count && <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: '#f1f5f9', color: '#64748b', fontWeight: 600 }}>{meta.count} posts</span>}
                              {meta.numPosts && <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: '#f1f5f9', color: '#64748b', fontWeight: 600 }}>{meta.numPosts} ideas</span>}
                            </div>
                          </div>
                          <span style={{ fontSize: 11, color: '#94a3b8', flexShrink: 0, paddingTop: 2 }}>{formatTime(item.created_at)}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
