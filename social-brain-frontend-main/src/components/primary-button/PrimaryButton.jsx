// src/components/PrimaryButton.js
import React from 'react';
import styles from './PrimaryButton.module.css'; // Import the CSS styles

const PrimaryButton = ({ children, onClick, className = '', disabled = false, ...props }) => {
  return (
    <button
      onClick={onClick}
      className={`${styles.button} ${className} ${disabled ? styles.disabled : ''}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default PrimaryButton;
