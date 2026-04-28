import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';

const navItems = [
  { to: '/',               icon: 'fas fa-gauge-high',           label: 'Dashboard'   },
  { to: '/post-genie',     icon: 'fas fa-wand-magic-sparkles',  label: 'Post Genie'  },
  { to: '/posts',          icon: 'fas fa-layer-group',          label: 'My Posts'    },
  { to: '/recent',         icon: 'fas fa-clock-rotate-left',    label: 'Recent'      },
  { to: '/connect-social', icon: 'fas fa-plug',                 label: 'Connect'     },
  { to: '/settings',       icon: 'fas fa-sliders',              label: 'Settings'    },
];

const Sidebar = () => {
  return (
    <div
      className={`d-flex flex-column vh-100 ${styles.sidebarWrapper}`}
      style={{ width: '16.5%', position: 'fixed', left: 0, top: 0 }}
    >
      {/* Brand */}
      <div style={{ padding: '24px 16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="d-flex align-items-center gap-2">
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <i className="fas fa-brain" style={{ color: '#fff', fontSize: 13 }} />
          </div>
          <span className={styles.sidebarTitle}>Social Brain</span>
        </div>
      </div>

      {/* Nav */}
      <div style={{ padding: '12px 10px', flexGrow: 1 }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 8px', marginBottom: 8 }}>
          Menu
        </p>
        <ul className="nav flex-column gap-0" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {navItems.map(({ to, icon, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.active : ''}`
                }
              >
                <i className={`${icon} ${styles.navLinkIcon}`} />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer */}
      <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <p style={{ margin: 0, fontSize: 10, color: '#334155', textAlign: 'center' }}>
          © 2025 Social Brain
        </p>
      </div>
    </div>
  );
};

export default Sidebar;
