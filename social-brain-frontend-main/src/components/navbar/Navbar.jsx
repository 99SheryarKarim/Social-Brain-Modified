import { Link } from 'react-router-dom';

const Navbar = ({ user, onLogout, onMenuClick, isPremium }) => {
  const username = user?.email?.split('@')[0] || '';

  return (
    <nav style={{
      background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(99,102,241,0.1)',
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
          <i className="fas fa-brain" style={{ color: '#6366f1', fontSize: 16 }} />
          <span style={{ fontWeight: 700, fontSize: 15, color: '#0f172a', letterSpacing: '-0.3px' }}>
            Social Brain
          </span>
          {/* Premium badge — visible throughout app */}
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
            {/* Username only — no email */}
            <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }} className="d-none d-md-inline">
              {username}
            </span>

            <Link to="/profile" style={{ textDecoration: 'none', position: 'relative' }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                background: isPremium
                  ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                  : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 700, fontSize: 13,
                boxShadow: isPremium ? '0 2px 8px rgba(245,158,11,0.4)' : '0 2px 8px rgba(99,102,241,0.3)',
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
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: '#fff', borderRadius: 8, padding: '7px 14px',
            fontSize: 13, fontWeight: 600, textDecoration: 'none',
            boxShadow: '0 2px 8px rgba(99,102,241,0.3)'
          }}>Sign In</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
