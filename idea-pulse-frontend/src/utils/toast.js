// src/utils/toast.js
import toast from "react-hot-toast";

/**
 * Show a success toast notification
 * @param {string} message - The message to display
 * @param {object} options - Optional configuration
 */
export const showSuccessToast = (message, options = {}) => {
  toast.success(message, {
    duration: 3000,
    position: "top-right",
    style: {
      background: "#10b981",
      color: "#fff",
      borderRadius: "8px",
      padding: "16px",
      boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
      fontSize: "14px",
      fontWeight: "500",
    },
    ...options,
  });
};

/**
 * Show an error toast notification
 * @param {string} message - The message to display
 * @param {object} options - Optional configuration
 */
export const showErrorToast = (message, options = {}) => {
  toast.error(message, {
    duration: 4000,
    position: "top-right",
    style: {
      background: "#ef4444",
      color: "#fff",
      borderRadius: "8px",
      padding: "16px",
      boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
      fontSize: "14px",
      fontWeight: "500",
    },
    ...options,
  });
};

/**
 * Show an info toast notification
 * @param {string} message - The message to display
 * @param {object} options - Optional configuration
 */
export const showInfoToast = (message, options = {}) => {
  toast(message, {
    duration: 3000,
    position: "top-right",
    icon: "ℹ️",
    style: {
      background: "#3b82f6",
      color: "#fff",
      borderRadius: "8px",
      padding: "16px",
      boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
      fontSize: "14px",
      fontWeight: "500",
    },
    ...options,
  });
};

/**
 * Show a warning toast notification
 * @param {string} message - The message to display
 * @param {object} options - Optional configuration
 */
export const showWarningToast = (message, options = {}) => {
  toast(message, {
    duration: 3500,
    position: "top-right",
    icon: "⚠️",
    style: {
      background: "#f59e0b",
      color: "#fff",
      borderRadius: "8px",
      padding: "16px",
      boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
      fontSize: "14px",
      fontWeight: "500",
    },
    ...options,
  });
};

/**
 * Show a loading toast notification
 * @param {string} message - The message to display
 * @returns {string} - Toast ID for dismissing
 */
export const showLoadingToast = (message) => {
  return toast.loading(message, {
    position: "top-right",
    style: {
      background: "#6b7280",
      color: "#fff",
      borderRadius: "8px",
      padding: "16px",
      boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
      fontSize: "14px",
      fontWeight: "500",
    },
  });
};

/**
 * Dismiss a specific toast
 * @param {string} toastId - The ID of the toast to dismiss
 */
export const dismissToast = (toastId) => {
  toast.dismiss(toastId);
};

/**
 * Update a toast (useful for changing from loading to success/error)
 * @param {string} toastId - The ID of the toast to update
 * @param {object} options - The options to update
 */
export const updateToast = (toastId, options) => {
  toast.success("Updated!", {
    id: toastId,
    ...options,
  });
};

/**
 * Show a promise-based toast (useful for async operations)
 * @param {Promise} promise - The promise to track
 * @param {object} messages - Object with loading, success, error messages
 */
export const showPromiseToast = (
  promise,
  messages = {
    loading: "Loading...",
    success: "Success!",
    error: "Error occurred",
  }
) => {
  return toast.promise(
    promise,
    {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
    },
    {
      position: "top-right",
      style: {
        borderRadius: "8px",
        padding: "16px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
        fontSize: "14px",
        fontWeight: "500",
      },
    }
  );
};
