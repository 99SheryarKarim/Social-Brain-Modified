import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import styles from './Navbar.module.css';
import { slideDownVariants, staggerContainerVariants, staggerItemVariants } from '../../utils/animations';

const Navbar = ({ user, onLogout }) => {
  return (
    <motion.nav
      className="navbar navbar-light bg-white shadow-sm py-3"
      variants={slideDownVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="container d-flex justify-content-between align-items-center">

        {/* Logo */}
        <motion.div className="d-flex align-items-center" variants={staggerContainerVariants} initial="hidden" animate="visible">
          <motion.i className="fas fa-brain fs-4 me-2 text-primary" variants={staggerItemVariants}
            whileHover={{ rotate: 360, transition: { duration: 0.6 } }} />
          <Link to="/" className="text-decoration-none">
            <motion.span className="fw-bold fs-4 text-dark" variants={staggerItemVariants}>
              Social Brain
            </motion.span>
          </Link>
        </motion.div>

        {/* Right side */}
        <motion.div className="d-flex align-items-center gap-2" variants={staggerContainerVariants} initial="hidden" animate="visible">

          {user ? (
            <>
              {/* Avatar with email */}
              <motion.div variants={staggerItemVariants}>
                <Link to="/profile" className="text-decoration-none d-flex align-items-center gap-2">
                  <div style={{
                    width: 38, height: 38, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 700, fontSize: 16,
                    boxShadow: '0 2px 8px rgba(102,126,234,0.4)',
                    flexShrink: 0
                  }}>
                    {user.email[0].toUpperCase()}
                  </div>
                  <span className="text-muted small d-none d-md-inline">{user.email}</span>
                </Link>
              </motion.div>

              {/* Logout button */}
              <motion.button
                variants={staggerItemVariants}
                className="btn btn-sm btn-outline-danger rounded-pill"
                onClick={onLogout}
                title="Logout"
              >
                <i className="fas fa-sign-out-alt" />
              </motion.button>
            </>
          ) : (
            /* Not logged in — show plain icon linking to auth page */
            <motion.div variants={staggerItemVariants}>
              <Link to="/profile" className="nav-link px-2 text-muted" title="Login / Sign Up">
                <i className="fas fa-user-circle fs-4" />
              </Link>
            </motion.div>
          )}

        </motion.div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
