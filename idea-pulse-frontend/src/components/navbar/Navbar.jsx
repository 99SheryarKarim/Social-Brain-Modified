import { Link } from 'react-router-dom';

const Navbar = ({ user, onLogout, onMenuClick, isPremium, unreadNotifs = 0 }) => {
  const username = user?.username || user?.email?.split('@')[0] || '';

  return (
    <nav style={{
      background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)', borderBottom: '1px solid #e5e7eb',
      padding: '0 16px', height: 56, display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', flexShrink: 0, position: 'sticky', top: 0, zIndex: 100
    }}>
      {/* Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onMenuClick} className="d-lg-none" style={{
          background: 'none', border: 'none', cursor: 'pointer',
          padding: 4, color: '#64748b', fontSize: 18, display: 'flex', alignItems: 'center'
        }}>
          <i className="fas fa-bars" />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <i className="fas fa-lightbulb" style={{ color: '#46a29f', fontSize: 16 }} />
          <span style={{ fontWeight: 700, fontSize: 15, color: '#1e293b', letterSpacing: '-0.3px' }}>
            Idea Pulse
          </span>
          {isPremium && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: '#fff', borderRadius: 20, padding: '2px 10px',
              fontSize: 10, fontWeight: 700, letterSpacing: '0.05em'
            }}>
              <i className="fas fa-crown" style={{ fontSize: 9 }} /> PREMIUM
            </span>
          )}
        </div>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {user ? (
          <>
            <Link to="/notifications" style={{ position: 'relative', textDecoration: 'none', color: '#64748b', fontSize: 18, padding: 4 }}>
              <i className="fas fa-bell" />
              {unreadNotifs > 0 && (
                <span style={{
                  position: 'absolute', top: -2, right: -4,
                  background: '#ef4444', color: '#fff', borderRadius: '50%',
                  width: 16, height: 16, fontSize: 9, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {unreadNotifs > 9 ? '9+' : unreadNotifs}
                </span>
              )}
            </Link>

            <Link to="/profile" style={{ textDecoration: 'none' }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                background: isPremium
                  ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                  : 'linear-gradient(135deg, #46a29f, #3b8c86)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 700, fontSize: 13,
                boxShadow: isPremium ? '0 2px 8px rgba(245,158,11,0.3)' : '0 2px 8px rgba(70,162,159,0.25)',
                cursor: 'pointer'
              }}>
                {isPremium
                  ? <i className="fas fa-crown" style={{ fontSize: 13 }} />
                  : username[0]?.toUpperCase()}
              </div>
            </Link>

            <button onClick={onLogout} style={{
              background: 'none', border: '1px solid #e2e8f0', borderRadius: 8,
              padding: '6px 10px', fontSize: 12, color: '#64748b',
              cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 5,
              transition: 'all 0.15s'
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#fca5a5'; e.currentTarget.style.color = '#ef4444'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b'; }}
            >
              <i className="fas fa-sign-out-alt" style={{ fontSize: 11 }} />
              <span className="d-none d-sm-inline">Logout</span>
            </button>
          </>
        ) : (
          <Link to="/profile" style={{
            background: 'linear-gradient(135deg, #46a29f, #3b8c86)',
            color: '#fff', borderRadius: 8, padding: '7px 14px',
            fontSize: 13, fontWeight: 600, textDecoration: 'none',
            boxShadow: '0 2px 8px rgba(70,162,159,0.25)'
          }}>Sign In</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
