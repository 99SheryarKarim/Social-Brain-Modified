import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchActivity } from '../../services/activityService';

const typeConfig = {
  ideas_generated: { icon: '💡', label: 'Ideas Generated', color: '#667eea' },
  posts_generated: { icon: '📝', label: 'Posts Generated', color: '#2a9d8f' },
  post_uploaded:   { icon: '🚀', label: 'Post Uploaded',   color: '#e76f51' },
};

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleString();
};

const RecentPage = ({ user }) => {
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    fetchActivity()
      .then(setActivity)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
        <i className="fas fa-lock fs-1 text-muted mb-3" />
        <h5 className="text-muted">Please log in to view your activity</h5>
        <button className="btn btn-dark rounded-pill mt-3" onClick={() => navigate('/profile')}>
          Login / Sign Up
        </button>
      </div>
    );
  }

  return (
    <div className="container py-5" style={{ maxWidth: 750 }}>
      <div className="text-center mb-5">
        <h2 className="fw-bold">🕐 Recent Activity</h2>
        <p className="text-muted">Everything you've done on Social Brain</p>
      </div>

      {loading && (
        <div className="text-center py-5">
          <div className="spinner-grow spinner-grow-sm text-dark" />
          <p className="text-muted mt-2">Loading activity...</p>
        </div>
      )}

      {!loading && activity.length === 0 && (
        <div className="text-center py-5">
          <i className="fas fa-inbox fs-1 text-muted mb-3" />
          <p className="text-muted">No activity yet. Start generating posts!</p>
          <button className="btn btn-dark rounded-pill mt-2" onClick={() => navigate('/')}>
            Go to Post Genie
          </button>
        </div>
      )}

      {!loading && activity.length > 0 && (
        <div className="d-flex flex-column gap-3">
          {activity.map((item) => {
            const config = typeConfig[item.type] || { icon: '📌', label: item.type, color: '#888' };
            return (
              <div key={item.id} className="card border-0 shadow-sm rounded-4 p-3 d-flex flex-row align-items-center gap-3">
                <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: 48, height: 48, background: config.color + '20', fontSize: 22 }}>
                  {config.icon}
                </div>
                <div className="flex-grow-1">
                  <div className="fw-semibold">{item.description}</div>
                  {item.meta && (
                    <div className="d-flex gap-2 mt-1 flex-wrap">
                      {item.meta.tone && <span className="badge rounded-pill" style={{ background: config.color + '20', color: config.color }}>{item.meta.tone}</span>}
                      {item.meta.count && <span className="badge bg-light text-dark rounded-pill">{item.meta.count} posts</span>}
                      {item.meta.numPosts && <span className="badge bg-light text-dark rounded-pill">{item.meta.numPosts} ideas</span>}
                    </div>
                  )}
                </div>
                <div className="text-muted small text-end flex-shrink-0">
                  {formatDate(item.created_at)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecentPage;
