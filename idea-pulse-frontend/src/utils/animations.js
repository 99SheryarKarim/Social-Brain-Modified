// src/utils/animations.js
// Framer Motion animation variants for consistent animations throughout the app

export const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};

export const slideUpVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
  exit: { opacity: 0, y: 30, transition: { duration: 0.3 } },
};

export const slideDownVariants = {
  hidden: { opacity: 0, y: -30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
  exit: { opacity: 0, y: -30, transition: { duration: 0.3 } },
};

export const slideLeftVariants = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
  exit: { opacity: 0, x: -40, transition: { duration: 0.3 } },
};

export const slideRightVariants = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
  exit: { opacity: 0, x: 40, transition: { duration: 0.3 } },
};

export const scaleVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: "easeOut" },
  },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.3 } },
};

export const staggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export const staggerItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

export const rotateVariants = {
  initial: { rotate: 0 },
  animate: {
    rotate: 360,
    transition: { duration: 2, repeat: Infinity, ease: "linear" },
  },
};

export const pulseVariants = {
  animate: {
    opacity: [1, 0.5, 1],
    transition: { duration: 2, repeat: Infinity },
  },
};

export const bounceVariants = {
  animate: {
    y: [0, -10, 0],
    transition: { duration: 0.6, repeat: Infinity },
  },
};

export const cardHoverVariants = {
  initial: { y: 0, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" },
  hover: {
    y: -8,
    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

export const buttonHoverVariants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.05,
    transition: { duration: 0.2, ease: "easeOut" },
  },
  tap: { scale: 0.95 },
};

export const modalVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3, ease: "easeOut" },
  },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

export const modalContentVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
  exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.3 } },
};

export const pageTransitionVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4, ease: "easeOut" },
  },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};

export const loaderVariants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear",
    },
  },
};

export const successCheckmarkVariants = {
  hidden: { scale: 0, rotate: -180 },
  visible: {
    scale: 1,
    rotate: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export const errorShakeVariants = {
  animate: {
    x: [-5, 5, -5, 5, 0],
    transition: { duration: 0.5, ease: "easeInOut" },
  },
};

export const listItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (index) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: index * 0.05,
      duration: 0.4,
      ease: "easeOut",
    },
  }),
};

export const tabSwitchVariants = {
  enter: {
    opacity: 0,
    x: 100,
  },
  center: {
    zIndex: 1,
    opacity: 1,
    x: 0,
  },
  exit: {
    zIndex: 0,
    opacity: 0,
    x: -100,
  },
};

export const tooltipVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.2, ease: "easeOut" },
  },
};

export const sidebarToggleVariants = {
  initial: { x: -250 },
  animate: { x: 0, transition: { duration: 0.3, ease: "easeOut" } },
  exit: { x: -250, transition: { duration: 0.2 } },
};

// Ease functions for common patterns
export const easePatterns = {
  smooth: [0.4, 0, 0.2, 1],
  bounce: [0.34, 1.56, 0.64, 1],
  snap: [0.68, -0.55, 0.265, 1.55],
};

// Transition configurations
export const transitionConfigs = {
  fast: { duration: 0.2, ease: "easeOut" },
  normal: { duration: 0.3, ease: "easeOut" },
  smooth: { duration: 0.5, ease: "easeOut" },
  slow: { duration: 0.8, ease: "easeOut" },
};

// ============================================
// SMART CONTENT CALENDAR ANIMATIONS
// ============================================

// 3D Flip Card Animation
export const flip3DVariants = {
  initial: { rotateY: 0, opacity: 1 },
  hover: { rotateY: 10, opacity: 1 },
  tap: { scale: 0.98 },
};

// 3D Perspective Day Cell
export const dayCell3DVariants = {
  initial: { rotateX: 0, rotateY: 0, scale: 1 },
  hover: {
    rotateX: 5,
    rotateY: 5,
    scale: 1.02,
    transition: { duration: 0.3, ease: "easeOut" },
  },
  tap: { scale: 0.95 },
};

// Post Card with depth effect
export const postCardDepthVariants = {
  initial: { z: 0, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" },
  hover: {
    z: 20,
    boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
    y: -8,
    transition: { duration: 0.3, ease: "easeOut" },
  },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
};

// Drag and drop post animation
export const dragPostVariants = {
  initial: { opacity: 0.5, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  hover: { scale: 1.05, boxShadow: "0 10px 30px rgba(70, 162, 159, 0.3)" },
  drag: { scale: 1.1, opacity: 0.8, zIndex: 100 },
};

// Calendar grid stagger
export const calendarGridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

// Calendar day item stagger
export const calendarDayVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.8 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

// Floating post indicator
export const floatingIndicatorVariants = {
  animate: {
    y: [0, -8, 0],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
  },
};

// Pulse highlight for important dates
export const pulseHighlightVariants = {
  animate: {
    boxShadow: [
      "0 0 0 0 rgba(70, 162, 159, 0.7)",
      "0 0 0 10px rgba(70, 162, 159, 0)",
    ],
    transition: { duration: 1.5, repeat: Infinity },
  },
};

// Expand animation for sidebar/details
export const expandVariants = {
  initial: { width: 0, opacity: 0 },
  animate: { width: 300, opacity: 1 },
  exit: { width: 0, opacity: 0 },
  transition: { duration: 0.3, ease: "easeOut" },
};

// Staggered list for posts in a day
export const postListVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

// Status badge pop animation
export const statusBadgeVariants = {
  initial: { scale: 0, rotate: -180 },
  animate: {
    scale: 1,
    rotate: 0,
    transition: { duration: 0.4, ease: "easeOut", type: "spring", bounce: 0.5 },
  },
};

// Calendar month transition
export const monthTransitionVariants = {
  enter: { opacity: 0, x: 100 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -100 },
};

// Tooltip/popover entrance
export const popoverVariants = {
  hidden: { opacity: 0, scale: 0.8, y: -10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.2, ease: "easeOut" },
  },
  exit: { opacity: 0, scale: 0.8, y: -10 },
};

// Glowing effect for active posts
export const glowingVariants = {
  animate: {
    textShadow: [
      "0 0 5px rgba(70, 162, 159, 0)",
      "0 0 15px rgba(70, 162, 159, 0.5)",
      "0 0 5px rgba(70, 162, 159, 0)",
    ],
    transition: { duration: 3, repeat: Infinity },
  },
};
