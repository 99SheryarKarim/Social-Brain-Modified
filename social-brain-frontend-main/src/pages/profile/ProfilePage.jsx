import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { showSuccessToast } from '../../utils/toast';

const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const ProfilePage = ({ user, onLogout, isPremium }) => {
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:3001/api/subscription/plan', { headers: getHeaders() })
      .then(res => setPlan(res.data))
      .catch(console.error);
  }, []);

  const handleLogout = () => {
    onLogout();
    showSuccessToast('Logged out successfully');
    navigate('/');
  };

  const username = user.email.split('@')[0];
  const joinDate = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '40px 20px', fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Profile Card */}
      <div style={{
        background: '#fff', borderRadius: 20, overflow: 'hidden',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid #f1f5f9'
      }}>

        {/* Header Banner */}
        <div style={{
          background: isPremium
            ? 'linear-gradient(135deg, #1e1b4b, #312e81, #4c1d95)'
            : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          padding: '32px 28px 60px', position: 'relative'
        }}>
          {isPremium && (
            <div style={{
              position: 'absolute', top: 16, right: 16,
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(245,158,11,0.2)', border: '1px solid rgba(245,158,11,0.4)',
              borderRadius: 20, padding: '4px 12px'
            }}>
              <i className="fas fa-crown" style={{ color: '#fbbf24', fontSize: 11 }} />
              <span style={{ color: '#fbbf24', fontSize: 11, fontWeight: 700 }}>PREMIUM MEMBER</span>
            </div>
          )}
        </div>

        {/* Avatar — overlapping banner */}
        <div style={{ padding: '0 28px', marginTop: -40 }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: isPremium
              ? 'linear-gradient(135deg, #f59e0b, #d97706)'
              : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: 28,
            border: '4px solid #fff',
            boxShadow: isPremium ? '0 4px 16px rgba(245,158,11,0.4)' : '0 4px 16px rgba(99,102,241,0.3)'
          }}>
            {isPremium ? <i className="fas fa-crown" style={{ fontSize: 28 }} /> : username[0]?.toUpperCase()}
          </div>
        </div>

        {/* Info */}
        <div style={{ padding: '16px 28px 28px' }}>
          <h2 style={{ margin: '0 0 4px', fontWeight: 700, fontSize: 22, color: '#0f172a' }}>{username}</h2>
          <p style={{ margin: '0 0 20px', fontSize: 13, color: '#94a3b8' }}>{user.email}</p>

          {/* Plan Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: isPremium ? '#fffbeb' : '#f8fafc',
            border: `1px solid ${isPremium ? '#fcd34d' : '#e2e8f0'}`,
            borderRadius: 10, padding: '10px 16px', marginBottom: 24, width: '100%'
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: isPremium ? 'linear-gradient(135deg, #f59e0b, #d97706)' : '#f1f5f9',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <i className={isPremium ? 'fas fa-crown' : 'fas fa-user'}
                style={{ color: isPremium ? '#fff' : '#94a3b8', fontSize: 13 }} />
            </div>
            <div style={{ flexGrow: 1 }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: '#0f172a' }}>
                {isPremium ? 'Premium Plan' : 'Free Plan'}
              </p>
              <p style={{ margin: 0, fontSize: 11, color: '#94a3b8' }}>
                {isPremium ? 'Unlimited access to all features' : `${plan?.remaining ?? 10} generations remaining today`}
              </p>
            </div>
            {!isPremium && (
              <Link to="/upgrade" style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#fff', borderRadius: 8, padding: '6px 14px',
                fontSize: 12, fontWeight: 600, textDecoration: 'none', flexShrink: 0
              }}>Upgrade</Link>
            )}
          </div>

          {/* Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#f8fafc', borderRadius: 10 }}>
              <i className="fas fa-envelope" style={{ color: '#6366f1', fontSize: 14, width: 16 }} />
              <div>
                <p style={{ margin: 0, fontSize: 11, color: '#94a3b8' }}>Email Address</p>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: '#1e293b' }}>{user.email}</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#f8fafc', borderRadius: 10 }}>
              <i className="fas fa-calendar" style={{ color: '#6366f1', fontSize: 14, width: 16 }} />
              <div>
                <p style={{ margin: 0, fontSize: 11, color: '#94a3b8' }}>Member Since</p>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: '#1e293b' }}>{joinDate}</p>
              </div>
            </div>
            {plan && !isPremium && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#f8fafc', borderRadius: 10 }}>
                <i className="fas fa-chart-bar" style={{ color: '#6366f1', fontSize: 14, width: 16 }} />
                <div style={{ flexGrow: 1 }}>
                  <p style={{ margin: 0, fontSize: 11, color: '#94a3b8' }}>Daily Usage</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <div style={{ flexGrow: 1, background: '#e2e8f0', borderRadius: 20, height: 6, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: 20,
                        background: plan.daily_usage >= plan.limit ? '#ef4444' : '#6366f1',
                        width: `${Math.min(100, (plan.daily_usage / plan.limit) * 100)}%`
                      }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>{plan.daily_usage}/{plan.limit}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Logout */}
          <button onClick={handleLogout} style={{
            width: '100%', padding: '12px', borderRadius: 12, border: '1px solid #fca5a5',
            background: '#fff', color: '#ef4444', fontWeight: 600, fontSize: 14,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'all 0.15s'
          }}
            onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
          >
            <i className="fas fa-sign-out-alt" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
