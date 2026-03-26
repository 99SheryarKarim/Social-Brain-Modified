import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';

const Sidebar = () => {
  return (
    <div
      className={`d-flex flex-column text-white vh-100 py-3 px-2 sidebarWrapper ${styles.sidebarWrapper}`}
      style={{
        width: '16.5%',
        position: 'fixed',
        left: 0,
        top: 0,
      }}
    >
      <div className={styles.overlay}></div>

      <h3 className={`text-center py-3 mb-5 pb-5 ${styles.sidebarTitle}`}>
        Social Brain
      </h3>

      <ul className="nav flex-column mb-auto">
        <li className="nav-item">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `nav-link text-white d-flex align-items-center px-4 ${styles.navLink} ${isActive ? styles.active : ''}`
            }
          >
            <i className={`fas fa-magic-wand-sparkles me-3 ${styles.navLinkIcon}`}></i>
            Post Genie
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink
            to="/quick-post"
            className={({ isActive }) =>
              `nav-link text-white d-flex align-items-center px-4 ${styles.navLink} ${isActive ? styles.active : ''}`
            }
          >
            <i className={`fas fa-bolt me-3 ${styles.navLinkIcon}`}></i>
            Quick Post
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink
            to="/queue"
            className={({ isActive }) =>
              `nav-link text-white d-flex align-items-center px-4 ${styles.navLink} ${isActive ? styles.active : ''}`
            }
          >
            <i className={`fas fa-list-check me-3 ${styles.navLinkIcon}`}></i>
            Queue
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink
            to="/notifications"
            className={({ isActive }) =>
              `nav-link text-white d-flex align-items-center px-4 ${styles.navLink} ${isActive ? styles.active : ''}`
            }
          >
            <i className={`fas fa-chart-column me-3 ${styles.navLinkIcon}`}></i>
            Analytics
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink
            to="/recent"
            className={({ isActive }) =>
              `nav-link text-white d-flex align-items-center px-4 ${styles.navLink} ${isActive ? styles.active : ''}`
            }
          >
            <i className={`fas fa-clock me-3 ${styles.navLinkIcon}`}></i>
            Recent
          </NavLink>
        </li>
        
        <li className="nav-item">
          <NavLink
            to="/connect-social"
            className={({ isActive }) =>
              `nav-link text-white d-flex align-items-center px-4 ${styles.navLink} ${isActive ? styles.active : ''}`
            }
          >
            <i className={`fas fa-link me-3 ${styles.navLinkIcon}`}></i>
            Connect
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink
            to="/billing"
            className={({ isActive }) =>
              `nav-link text-white d-flex align-items-center px-4 ${styles.navLink} ${isActive ? styles.active : ''}`
            }
          >
            <i className={`fas fa-credit-card me-3 ${styles.navLinkIcon}`}></i>
            Billing
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink
            to="/setting"
            className={({ isActive }) =>
              `nav-link text-white d-flex align-items-center px-4 ${styles.navLink} ${isActive ? styles.active : ''}`
            }
          >
            <i className={`fas fa-cog me-3 ${styles.navLinkIcon}`}></i>
            Setting
          </NavLink>
        </li>
      </ul>

      <hr className="w-100 text-white" />
      <div className="text-white text-center">
        <small className="text-white">© 2025 SocialBrain</small>
      </div>
    </div>
  );
};

export default Sidebar;
