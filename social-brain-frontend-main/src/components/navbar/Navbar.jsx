import { Link } from 'react-router-dom';

const Navbar = ({ user, onLogout }) => {
  return (
    <nav style={{
      background: '#fff',
      borderBottom: '1px solid #f1f5f9',
      padding: '0 24px',
      height: 56,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexShrink: 0,
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      {/* Left — page context */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <i className="fas fa-brain" style={{ color: '#6366f1', fontSize: 16 }} />
        <span style={{ fontWeight: 700, fontSize: 15, color: '#0f172a', letterSpacing: '-0.3px' }}>
          Social Brain
        </span>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {user ? (
          <>
            <span style={{ fontSize: 12, color: '#94a3b8', display: 'none' }} className="d-md-inline">
              {user.email}
            </span>

            <Link to="/profile" style={{ textDecoration: 'none' }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 700, fontSize: 13,
                boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
                cursor: 'pointer'
              }}>
                {user.email[0].toUpperCase()}
              </div>
            </Link>

            <button
              onClick={onLogout}
              style={{
                background: 'none', border: '1px solid #e2e8f0', borderRadius: 8,
                padding: '6px 12px', fontSize: 12, color: '#64748b',
                cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6,
                transition: 'all 0.15s'
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#fca5a5'; e.currentTarget.style.color = '#ef4444'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b'; }}
            >
              <i className="fas fa-sign-out-alt" style={{ fontSize: 11 }} />
              Logout
            </button>
          </>
        ) : (
          <Link to="/profile" style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: '#fff', borderRadius: 8, padding: '7px 16px',
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
