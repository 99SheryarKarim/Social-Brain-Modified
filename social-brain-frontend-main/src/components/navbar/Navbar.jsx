import styles from './Navbar.module.css';

const Navbar = () => {
  return (
    <nav className="navbar navbar-light bg-white shadow-sm py-3">
      <div className="container d-flex justify-content-between align-items-center">

        {/* App Logo / Name */}
        <div className="d-flex align-items-center">
          <i className="fas fa-brain fs-4 me-2"></i>
          <span className="fw-bold fs-4 text-dark">Social Brain</span>
        </div>

        {/* Right Icons */}
        <div className="d-flex align-items-center gap-1">
          <a
            href="#notifications"
            className={`${styles.navLink} nav-link px-2 d-flex align-items-center text-muted`}
            title="Notifications"
          >
            <i className="fas fs-4 fa-bell"></i>
          </a>
          <a
            href="#profile"
            className={`${styles.navLink} nav-link px-2 d-flex align-items-center text-muted`}
            title="Profile"
          >
            <i className="fas fa-user-circle fs-4"></i>
          </a>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;