import { Link } from 'react-router-dom';

const Navbar = ({ user, onLogout, onMenuClick }) => {
  return (
    <nav style={{
      background: 'rgba(255,255,255,0.85)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(99,102,241,0.1)',
      padding: '0 16px',
      height: 56,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexShrink: 0,
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      {/* Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Hamburger — mobile only */}
        <button onClick={onMenuClick} className="d-lg-none" style={{
          background: 'none', border: 'none', cursor: 'pointer',
          padding: 4, color: '#64748b', fontSize: 18,
          display: 'flex', alignItems: 'center'
        }}>
          <i className="fas fa-bars" />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <i className="fas fa-brain" style={{ color: '#6366f1', fontSize: 16 }} />
          <span style={{ fontWeight: 700, fontSize: 15, color: '#0f172a', letterSpacing: '-0.3px' }}>
            Social Brain
          </span>
        </div>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {user ? (
          <>
            <span style={{ fontSize: 12, color: '#94a3b8' }} className="d-none d-md-inline">
              {user.email}
            </span>

            <Link to="/profile" style={{ textDecoration: 'none' }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 700, fontSize: 13,
                boxShadow: '0 2px 8px rgba(99,102,241,0.3)', cursor: 'pointer'
              }}>
                {user.email[0].toUpperCase()}
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
          }}>
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
