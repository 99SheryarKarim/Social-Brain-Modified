/**
 * ANIMATION COMPONENT TEMPLATE
 * 
 * This file demonstrates best practices for using:
 * - Framer Motion animations
 * - Toast notifications
 * - API integration
 * - Loading states
 * - Error handling
 * 
 * Copy and adapt this template for other components!
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  slideUpVariants, 
  staggerContainerVariants, 
  staggerItemVariants,
  cardHoverVariants,
  buttonHoverVariants,
} from '../utils/animations';
import { 
  showSuccessToast, 
  showErrorToast, 
  showLoadingToast, 
  dismissToast 
} from '../utils/toast';

/**
 * Example Component with Full Animation & API Integration
 */
const ExampleAnimatedComponent = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  // ============================================
  // EXAMPLE: API Call with Loading Toast
  // ============================================
  const handleFetchData = async () => {
    // Reset states
    setError(null);
    
    // Show loading toast
    const toastId = showLoadingToast('⏳ Fetching data...');
    setLoading(true);

    try {
      // Your API call here
      // const result = await someApiFunction();
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // On success
      dismissToast(toastId);
      showSuccessToast('✅ Data loaded successfully!');
      setData({ id: 1, title: 'Example Data' });
      
    } catch (err) {
      dismissToast(toastId);
      setError(err.message);
      showErrorToast(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="container py-5"
      variants={slideUpVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header with staggered animation */}
      <motion.div
        className="mb-5"
        variants={staggerContainerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1 
          className="display-5 fw-bold text-dark mb-2"
          variants={staggerItemVariants}
        >
          🎯 Animated Component Example
        </motion.h1>
        <motion.p 
          className="lead text-muted"
          variants={staggerItemVariants}
        >
          This component demonstrates animations, toasts, and API integration patterns.
        </motion.p>
      </motion.div>

      {/* Content Cards with Hover Animation */}
      <motion.div
        className="row g-4 mb-5"
        variants={staggerContainerVariants}
        initial="hidden"
        animate="visible"
      >
        {[1, 2, 3].map((item) => (
          <motion.div
            key={item}
            className="col-md-4"
            variants={staggerItemVariants}
          >
            <motion.div
              className="card h-100 shadow-sm rounded-lg"
              variants={cardHoverVariants}
              initial="initial"
              whileHover="hover"
              style={{ cursor: 'pointer' }}
            >
              <div className="card-body p-4">
                <motion.i
                  className="fas fa-sparkles fs-2 text-primary mb-3"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                ></motion.i>
                <h5 className="card-title">Feature {item}</h5>
                <p className="card-text text-muted">
                  This card has hover animations and smooth transitions.
                </p>
              </div>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>

      {/* Example Content Section */}
      {data && (
        <motion.div
          className="p-4 bg-light rounded-lg mb-5 fade-in-up"
          variants={slideUpVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h3 
            className="mb-3"
            variants={staggerItemVariants}
          >
            Loaded Data:
          </motion.h3>
          <motion.pre 
            className="bg-white p-3 rounded text-muted"
            variants={staggerItemVariants}
          >
            {JSON.stringify(data, null, 2)}
          </motion.pre>
        </motion.div>
      )}

      {/* Error State */}
      {error && (
        <motion.div
          className="alert alert-danger fade-in-up"
          role="alert"
          variants={slideUpVariants}
          initial="hidden"
          animate="visible"
        >
          <i className="fas fa-exclamation-circle me-2"></i>
          <strong>Error:</strong> {error}
        </motion.div>
      )}

      {/* Action Buttons with Hover Effects */}
      <motion.div
        className="d-flex gap-2 flex-wrap"
        variants={staggerContainerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.button
          className="btn btn-primary rounded-lg"
          onClick={handleFetchData}
          disabled={loading}
          variants={staggerItemVariants}
          whileHover="hover"
          whileTap="tap"
          initial="initial"
          custom={{ scale: 1, tapScale: 0.95 }}
        >
          {loading ? (
            <>
              <i className="fas fa-spinner fa-spin me-2"></i>
              Loading...
            </>
          ) : (
            <>
              <i className="fas fa-download me-2"></i>
              Load Data
            </>
          )}
        </motion.button>

        <motion.button
          className="btn btn-outline-primary rounded-lg"
          onClick={() => {
            setData(null);
            showSuccessToast('✅ Data cleared!');
          }}
          variants={staggerItemVariants}
          whileHover="hover"
          whileTap="tap"
          initial="initial"
        >
          <i className="fas fa-trash me-2"></i>
          Clear Data
        </motion.button>

        <motion.button
          className="btn btn-outline-secondary rounded-lg"
          onClick={() => navigate('/')}
          variants={staggerItemVariants}
          whileHover="hover"
          whileTap="tap"
          initial="initial"
        >
          <i className="fas fa-arrow-left me-2"></i>
          Go Back
        </motion.button>
      </motion.div>

      {/* Tips Section */}
      <motion.div
        className="mt-5 p-4 bg-info bg-opacity-10 rounded-lg border border-info border-opacity-25"
        variants={slideUpVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.5 }}
      >
        <h5 className="mb-3">
          <i className="fas fa-lightbulb me-2"></i>
          Implementation Tips
        </h5>
        <ul className="mb-0">
          <li>Use <code>variants</code> for consistent animations</li>
          <li>Always show/dismiss toasts for user feedback</li>
          <li>Set <code>disabled={loading}</code> on buttons during API calls</li>
          <li>Use <code>staggerContainerVariants</code> for list animations</li>
          <li>Combine <code>whileHover</code> and <code>whileTap</code> for interactivity</li>
          <li>Keep animations quick (&lt;500ms) for better UX</li>
        </ul>
      </motion.div>
    </motion.div>
  );
};

export default ExampleAnimatedComponent;

/**
 * QUICK REFERENCE: Common Patterns
 * 
 * === Page Container ===
 * <motion.div variants={slideUpVariants} initial="hidden" animate="visible">
 * 
 * === Staggered List ===
 * <motion.div variants={staggerContainerVariants} initial="hidden" animate="visible">
 *   {items.map((item) => (
 *     <motion.div key={item.id} variants={staggerItemVariants}>
 *       {item.name}
 *     </motion.div>
 *   ))}
 * </motion.div>
 * 
 * === Clickable Card ===
 * <motion.div variants={cardHoverVariants} initial="initial" whileHover="hover">
 *   Card content
 * </motion.div>
 * 
 * === Loading Toast + API ===
 * const toastId = showLoadingToast('Loading...');
 * try {
 *   const result = await apiCall();
 *   dismissToast(toastId);
 *   showSuccessToast('Success!');
 * } catch (err) {
 *   dismissToast(toastId);
 *   showErrorToast(err.message);
 * }
 * 
 * === Button with Hover ===
 * <motion.button
 *   whileHover="hover"
 *   whileTap="tap"
 *   variants={buttonHoverVariants}
 *   initial="initial"
 * >
 *   Click me
 * </motion.button>
 */
