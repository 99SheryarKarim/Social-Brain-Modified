import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';

const navItems = [
  { to: '/',               icon: 'fas fa-gauge-high',           label: 'Dashboard'   },
  { to: '/post-genie',     icon: 'fas fa-wand-magic-sparkles',  label: 'Idea Pulse'  },
  { to: '/posts',          icon: 'fas fa-layer-group',          label: 'My Posts'    },
  { to: '/calendar',       icon: 'fas fa-calendar-days',        label: 'Calendar'    },
  { to: '/recent',         icon: 'fas fa-clock-rotate-left',    label: 'Recent'      },
  { to: '/friends',       icon: 'fas fa-user-group',           label: 'Friends'       },
  { to: '/add-friends',   icon: 'fas fa-user-plus',            label: 'Add Friends'   },
  { to: '/notifications', icon: 'fas fa-bell',                 label: 'Notifications' },
  { to: '/streak',         icon: 'fas fa-fire',                  label: 'Streak'       },
  { to: '/connect-social', icon: 'fas fa-plug',                 label: 'Connect'     },
  { to: '/settings',       icon: 'fas fa-sliders',              label: 'Settings'    },
  { to: '/upgrade',        icon: 'fas fa-crown',                label: 'Upgrade',    highlight: true },
];

const Sidebar = ({ open, onClose }) => {
  return (
    <div
      className={`d-flex flex-column vh-100 ${styles.sidebarWrapper}`}
      style={{
        width: 220,
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 300,
        transform: open ? 'translateX(0)' : undefined,
        transition: 'transform 0.3s ease',
      }}
    >
      {/* Brand */}
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="d-flex align-items-center gap-2">
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: 'linear-gradient(135deg, #46a29f, #3b8c86)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <i className="fas fa-lightbulb" style={{ color: '#fff', fontSize: 13 }} />
          </div>
          <span className={styles.sidebarTitle}>Idea Pulse</span>
        </div>
        {/* Close button — mobile only */}
        <button onClick={onClose} className="d-lg-none" style={{
          background: 'none', border: 'none', color: '#94a3b8',
          fontSize: 18, cursor: 'pointer', padding: 0, lineHeight: 1
        }}>✕</button>
      </div>

      {/* Nav */}
      <div style={{ padding: '12px 10px', flexGrow: 1 }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 8px', marginBottom: 8 }}>
          Menu
        </p>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {navItems.map(({ to, icon, label, highlight }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                onClick={onClose}
                className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''} ${highlight ? styles.highlight : ''}`}
              >
                <i className={`${icon} ${styles.navLinkIcon}`} style={highlight ? { color: '#fbbf24' } : {}} />
                {label}
                {highlight && <span style={{ marginLeft: 'auto', fontSize: 9, background: '#fbbf24', color: '#000', borderRadius: 10, padding: '2px 6px', fontWeight: 700 }}>PRO</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer */}
      <div style={{ padding: '16px', borderTop: '1px solid #e5e7eb' }}>
        <p style={{ margin: 0, fontSize: 10, color: '#94a3b8', textAlign: 'center' }}>© 2025 Idea Pulse</p>
      </div>

      <style>{`
        @media (max-width: 991px) {
          .${styles.sidebarWrapper} {
            transform: ${open ? 'translateX(0)' : 'translateX(-100%)'} !important;
          }
        }
        @media (min-width: 992px) {
          .${styles.sidebarWrapper} {
            transform: translateX(0) !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Sidebar;
