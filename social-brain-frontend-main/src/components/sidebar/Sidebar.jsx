import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';

const navItems = [
  { to: '/',              icon: 'fas fa-gauge-high',          label: 'Dashboard'    },
  { to: '/post-genie',    icon: 'fas fa-magic-wand-sparkles', label: 'Post Genie'   },
  { to: '/posts',         icon: 'fas fa-layer-group',         label: 'My Posts'     },
  { to: '/recent',        icon: 'fas fa-clock',               label: 'Recent'       },
  { to: '/connect-social',icon: 'fas fa-link',                label: 'Connect'      },
  { to: '/settings',      icon: 'fas fa-cog',                 label: 'Settings'     },
];

const Sidebar = () => {
  return (
    <div
      className={`d-flex flex-column text-white vh-100 py-3 px-2 ${styles.sidebarWrapper}`}
      style={{ width: '16.5%', position: 'fixed', left: 0, top: 0 }}
    >
      <div className={styles.overlay} />

      {/* Brand */}
      <div className={`text-center py-3 mb-4 ${styles.sidebarTitle}`}>
        <div style={{ fontSize: 28, marginBottom: 4 }}>🧠</div>
        <div className="fw-bold" style={{ fontSize: 16, letterSpacing: 1 }}>Social Brain</div>
      </div>

      {/* Nav Links */}
      <ul className="nav flex-column mb-auto gap-1">
        {navItems.map(({ to, icon, label }) => (
          <li key={to} className="nav-item">
            <NavLink
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `nav-link text-white d-flex align-items-center px-3 py-2 ${styles.navLink} ${isActive ? styles.active : ''}`
              }
            >
              <i className={`${icon} me-3 ${styles.navLinkIcon}`} />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>

      <hr className="w-100 text-white opacity-25" />
      <div className="text-center">
        <small style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>© 2025 Social Brain</small>
      </div>
    </div>
  );
};

export default Sidebar;
