import { motion } from 'framer-motion';
import styles from './Navbar.module.css';
import { slideDownVariants, staggerContainerVariants, staggerItemVariants } from '../../utils/animations';

const Navbar = () => {
  return (
    <motion.nav
      className="navbar navbar-light bg-white shadow-sm py-3"
      variants={slideDownVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="container d-flex justify-content-between align-items-center">
        {/* App Logo / Name */}
        <motion.div
          className="d-flex align-items-center"
          variants={staggerContainerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.i
            className="fas fa-brain fs-4 me-2 text-primary"
            variants={staggerItemVariants}
            whileHover={{ rotate: 360, transition: { duration: 0.6 } }}
          ></motion.i>
          <motion.span
            className="fw-bold fs-4 text-dark"
            variants={staggerItemVariants}
          >
            Social Brain
          </motion.span>
        </motion.div>

        {/* Right Icons */}
        <motion.div
          className="d-flex align-items-center gap-1"
          variants={staggerContainerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.a
            href="#notifications"
            className={`${styles.navLink} nav-link px-2 d-flex align-items-center text-muted`}
            title="Notifications"
            variants={staggerItemVariants}
            whileHover={{ scale: 1.2, color: '#46a29f' }}
            whileTap={{ scale: 0.9 }}
          >
            <i className="fas fs-4 fa-bell"></i>
          </motion.a>
          <motion.a
            href="#profile"
            className={`${styles.navLink} nav-link px-2 d-flex align-items-center text-muted`}
            title="Profile"
            variants={staggerItemVariants}
            whileHover={{ scale: 1.2, color: '#46a29f' }}
            whileTap={{ scale: 0.9 }}
          >
            <i className="fas fa-user-circle fs-4"></i>
          </motion.a>
        </motion.div>
      </div>
    </motion.nav>
  );
};

export default Navbar;