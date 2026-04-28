import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const typeConfig = {
  ideas_generated:  { icon: '💡', color: '#667eea', label: 'Ideas Generated' },
  posts_generated:  { icon: '📝', color: '#2a9d8f', label: 'Posts Generated' },
  post_uploaded:    { icon: '🚀', color: '#e76f51', label: 'Post Uploaded' },
};

const MetricCard = ({ icon, label, value, color, sublabel }) => (
  <div className="col-6 col-lg-3">
    <div className="card border-0 shadow-sm rounded-4 p-4 h-100" style={{ borderLeft: `4px solid ${color}` }}>
      <div className="d-flex align-items-center justify-content-between mb-2">
        <span style={{ fontSize: 28 }}>{icon}</span>
        <span className="fw-bold" style={{ fontSize: 36, color }}>{value}</span>
      </div>
      <p className="fw-semibold mb-0 text-dark">{label}</p>
      {sublabel && <small className="text-muted">{sublabel}</small>}
    </div>
  </div>
);

const DashboardPage = ({ user }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    axios.get('http://localhost:3001/api/dashboard', { headers: getHeaders() })
      .then(res => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const formatTime = (d) => new Date(d).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="container-fluid py-4 px-4">

      {/* Header */}
      <div className="mb-5">
        <h1 className="fw-bold mb-1" style={{ fontSize: 28 }}>
          🧠 Social Brain
          {user && <span className="text-muted fw-normal fs-5 ms-2">— Welcome back, {user.email.split('@')[0]}</span>}
        </h1>
        <p className="text-muted mb-0">Your AI-powered social media command center</p>
      </div>

      {/* Guest CTA */}
      {!user && (
        <div className="card border-0 rounded-4 p-5 text-center mb-5"
          style={{ background: 'linear-gradient(135deg, #667eea22, #764ba222)' }}>
          <h3 className="fw-bold mb-2">Get Started with Social Brain</h3>
          <p className="text-muted mb-4">Log in to see your stats, manage posts, and automate your social media.</p>
          <div className="d-flex gap-3 justify-content-center">
            <Link to="/post-genie" className="btn btn-dark rounded-pill px-4">✨ Try Post Genie</Link>
            <Link to="/profile" className="btn btn-outline-dark rounded-pill px-4">Login / Sign Up</Link>
          </div>
        </div>
      )}

      {/* Metric Cards */}
      {user && (
        <>
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-grow spinner-grow-sm text-primary" />
              <p className="text-muted mt-2">Loading your stats...</p>
            </div>
          ) : (
            <>
              <div className="row g-3 mb-5">
                <MetricCard icon="📝" label="Total Posts" value={stats?.totalPosts ?? 0}
                  color="#667eea" sublabel="All generated posts" />
                <MetricCard icon="⏰" label="Scheduled" value={stats?.scheduled ?? 0}
                  color="#f4a261" sublabel="Pending auto-publish" />
                <MetricCard icon="🚀" label="Published" value={stats?.published ?? 0}
                  color="#2a9d8f" sublabel="Posted to Facebook" />
                <MetricCard icon="⚡" label="Activities" value={stats?.totalActivities ?? 0}
                  color="#764ba2" sublabel="Total actions logged" />
              </div>

              {/* Quick Actions */}
              <div className="row g-3 mb-5">
                {[
                  { to: '/post-genie', icon: '✨', label: 'Post Genie', desc: 'Generate AI posts', color: '#667eea' },
                  { to: '/posts', icon: '🗂️', label: 'My Archive', desc: 'View & schedule posts', color: '#2a9d8f' },
                  { to: '/connect-social', icon: '🔗', label: 'Connect', desc: 'Link Facebook page', color: '#e76f51' },
                  { to: '/settings', icon: '⚙️', label: 'Brand Voice', desc: 'Set your brand context', color: '#764ba2' },
                ].map(item => (
                  <div key={item.to} className="col-6 col-lg-3">
                    <Link to={item.to} className="text-decoration-none">
                      <div className="card border-0 shadow-sm rounded-4 p-3 h-100 text-center"
                        style={{ transition: 'transform 0.2s', cursor: 'pointer' }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                        <div className="mb-2" style={{ fontSize: 32 }}>{item.icon}</div>
                        <p className="fw-bold mb-0" style={{ color: item.color }}>{item.label}</p>
                        <small className="text-muted">{item.desc}</small>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>

              {/* Recent Activity Feed */}
              <div className="card border-0 shadow-sm rounded-4 p-4">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h5 className="fw-bold mb-0">⚡ Recent Activity</h5>
                  <Link to="/recent" className="btn btn-sm btn-outline-secondary rounded-pill">View All</Link>
                </div>

                {!stats?.recentActivity?.length ? (
                  <div className="text-center py-4">
                    <p className="text-muted mb-0">No activity yet. Start generating posts!</p>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {stats.recentActivity.map((item) => {
                      const config = typeConfig[item.type] || { icon: '📌', color: '#888', label: item.type };
                      const meta = item.meta ? JSON.parse(item.meta) : {};
                      return (
                        <div key={item.id} className="d-flex align-items-center gap-3 p-3 rounded-3"
                          style={{ background: '#f8f9fa' }}>
                          <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                            style={{ width: 40, height: 40, background: config.color + '20', fontSize: 18 }}>
                            {config.icon}
                          </div>
                          <div className="flex-grow-1">
                            <p className="mb-0 fw-semibold small">{item.description}</p>
                            <div className="d-flex gap-2 mt-1">
                              {meta.tone && <span className="badge rounded-pill" style={{ background: config.color + '20', color: config.color, fontSize: 10 }}>{meta.tone}</span>}
                              {meta.count && <span className="badge bg-light text-dark rounded-pill" style={{ fontSize: 10 }}>{meta.count} posts</span>}
                            </div>
                          </div>
                          <small className="text-muted flex-shrink-0" style={{ fontSize: 11 }}>
                            {formatTime(item.created_at)}
                          </small>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default DashboardPage;
