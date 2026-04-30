import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { fetchActivity } from '../../services/activityService';

const typeConfig = {
  ideas_generated: {
    icon: 'fas fa-lightbulb',
    label: 'Ideas Generated',
    color: '#6366f1',
    bg: '#eef2ff',
    description: (meta) => `Generated ${meta?.numPosts || ''} idea${meta?.numPosts > 1 ? 's' : ''} for "${meta?.prompt || 'a topic'}"`,
  },
  posts_generated: {
    icon: 'fas fa-pen-nib',
    label: 'Posts Generated',
    color: '#0ea5e9',
    bg: '#f0f9ff',
    description: (meta) => `Created ${meta?.count || ''} post${meta?.count > 1 ? 's' : ''} for "${meta?.prompt || 'a topic'}"`,
  },
  post_uploaded: {
    icon: 'fas fa-paper-plane',
    label: 'Post Published',
    color: '#10b981',
    bg: '#ecfdf5',
    description: () => 'Published a post to Facebook',
  },
};

const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
const formatTime = (d) => new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
const formatRelative = (d) => {
  const diff = (Date.now() - new Date(d)) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return formatDate(d);
};

const groupByDate = (activities) => {
  const groups = {};
  activities.forEach(item => {
    const key = formatDate(item.created_at);
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  });
  return groups;
};

export default function RecentPage({ user }) {
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    fetchActivity().then(data => {
      const parsed = data.map(item => ({
        ...item,
        meta: item.meta ? (typeof item.meta === 'string' ? JSON.parse(item.meta) : item.meta) : {}
      }));
      setActivity(parsed);
    }).catch(console.error).finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: 24 }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <i className="fas fa-lock" style={{ color: '#94a3b8', fontSize: 24 }} />
        </div>
        <h5 style={{ fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Sign in to view activity</h5>
        <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 20 }}>Your activity log is private and requires authentication.</p>
        <button onClick={() => navigate('/profile')} style={{
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff',
          border: 'none', borderRadius: 10, padding: '10px 24px', fontWeight: 600, cursor: 'pointer'
        }}>Sign In</button>
      </div>
    );
  }

  const filtered = filter === 'all' ? activity : activity.filter(a => a.type === filter);
  const grouped = groupByDate(filtered);

  // Stats
  const totalIdeas = activity.filter(a => a.type === 'ideas_generated').reduce((s, a) => s + (a.meta?.numPosts || 1), 0);
  const totalPosts = activity.filter(a => a.type === 'posts_generated').reduce((s, a) => s + (a.meta?.count || 1), 0);
  const totalPublished = activity.filter(a => a.type === 'post_uploaded').length;

  return (
    <div style={{ maxWidth: 780, margin: '0 auto', padding: '32px 20px', fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 4px', letterSpacing: '-0.5px' }}>
          Activity Log
        </h1>
        <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>A complete history of everything you've done on Social Brain</p>
      </div>

      {/* Stats Row */}
      {!loading && activity.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 28 }}>
          {[
            { icon: 'fas fa-lightbulb', label: 'Ideas Generated', value: totalIdeas, color: '#6366f1', bg: '#eef2ff' },
            { icon: 'fas fa-pen-nib',   label: 'Posts Created',   value: totalPosts, color: '#0ea5e9', bg: '#f0f9ff' },
            { icon: 'fas fa-paper-plane', label: 'Published',     value: totalPublished, color: '#10b981', bg: '#ecfdf5' },
          ].map(s => (
            <div key={s.label} style={{
              background: '#fff', borderRadius: 14, padding: '16px 20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className={s.icon} style={{ color: s.color, fontSize: 14 }} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{s.value}</p>
                  <p style={{ margin: 0, fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{s.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filter Tabs */}
      {!loading && activity.length > 0 && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 24, background: '#f8fafc', borderRadius: 10, padding: 4 }}>
          {[
            { key: 'all', label: 'All Activity' },
            { key: 'ideas_generated', label: 'Ideas' },
            { key: 'posts_generated', label: 'Posts' },
            { key: 'post_uploaded', label: 'Published' },
          ].map(tab => (
            <button key={tab.key} onClick={() => setFilter(tab.key)} style={{
              flex: 1, padding: '7px 0', border: 'none', borderRadius: 8, cursor: 'pointer',
              fontWeight: 600, fontSize: 12, transition: 'all 0.15s',
              background: filter === tab.key ? '#fff' : 'transparent',
              color: filter === tab.key ? '#6366f1' : '#94a3b8',
              boxShadow: filter === tab.key ? '0 1px 4px rgba(0,0,0,0.08)' : 'none'
            }}>{tab.label}</button>
          ))}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid #e2e8f0', borderTopColor: '#6366f1', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: '#94a3b8', fontSize: 13 }}>Loading your activity...</p>
        </div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <i className="fas fa-inbox" style={{ color: '#cbd5e1', fontSize: 24 }} />
          </div>
          <p style={{ fontWeight: 600, color: '#64748b', margin: '0 0 4px' }}>No activity yet</p>
          <p style={{ color: '#94a3b8', fontSize: 13, margin: '0 0 20px' }}>Start generating posts to see your history here</p>
          <Link to="/post-genie" style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff',
            borderRadius: 10, padding: '10px 24px', fontWeight: 600, fontSize: 13, textDecoration: 'none'
          }}>Go to Post Genie</Link>
        </div>
      )}

      {/* Timeline grouped by date */}
      {!loading && filtered.length > 0 && (
        <div>
          {Object.entries(grouped).map(([date, items]) => (
            <div key={date} style={{ marginBottom: 32 }}>
              {/* Date header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                  {date}
                </span>
                <div style={{ flex: 1, height: 1, background: '#f1f5f9' }} />
                <span style={{ fontSize: 11, color: '#cbd5e1', whiteSpace: 'nowrap' }}>{items.length} event{items.length > 1 ? 's' : ''}</span>
              </div>

              {/* Activity items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {items.map((item, idx) => {
                  const cfg = typeConfig[item.type] || { icon: 'fas fa-circle', label: item.type, color: '#64748b', bg: '#f8fafc', description: () => item.description };
                  const isLast = idx === items.length - 1;

                  return (
                    <div key={item.id} style={{ display: 'flex', gap: 14 }}>
                      {/* Timeline line */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 4 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `2px solid ${cfg.color}20` }}>
                          <i className={cfg.icon} style={{ color: cfg.color, fontSize: 13 }} />
                        </div>
                        {!isLast && <div style={{ width: 2, flex: 1, background: '#f1f5f9', marginTop: 4, minHeight: 16 }} />}
                      </div>

                      {/* Card */}
                      <div style={{
                        flex: 1, background: '#fff', borderRadius: 12, padding: '14px 16px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9',
                        marginBottom: isLast ? 0 : 4
                      }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                          <div style={{ flexGrow: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                              <span style={{ fontSize: 11, fontWeight: 700, color: cfg.color, background: cfg.bg, borderRadius: 20, padding: '2px 8px' }}>
                                {cfg.label}
                              </span>
                            </div>
                            <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: '#1e293b' }}>
                              {item.description}
                            </p>
                            {/* Meta tags */}
                            {item.meta && Object.keys(item.meta).length > 0 && (
                              <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                                {item.meta.tone && (
                                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: '#f1f5f9', color: '#64748b', fontWeight: 500 }}>
                                    Tone: {item.meta.tone}
                                  </span>
                                )}
                                {item.meta.prompt && (
                                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: '#f1f5f9', color: '#64748b', fontWeight: 500 }}>
                                    Topic: {item.meta.prompt}
                                  </span>
                                )}
                                {item.meta.count && (
                                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: cfg.bg, color: cfg.color, fontWeight: 600 }}>
                                    {item.meta.count} posts
                                  </span>
                                )}
                                {item.meta.numPosts && (
                                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: cfg.bg, color: cfg.color, fontWeight: 600 }}>
                                    {item.meta.numPosts} ideas
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#64748b' }}>{formatTime(item.created_at)}</p>
                            <p style={{ margin: 0, fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{formatRelative(item.created_at)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
