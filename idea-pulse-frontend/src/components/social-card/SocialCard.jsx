import React from 'react';
import styles from './SocialCard.module.css';

const SocialCard = ({ platform, logo, connected, onClick }) => {
  return (
    <div
      className={`card text-center p-4 ${styles.card}`}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <div className="card-body d-flex flex-column justify-content-center align-items-center">
        <img
          src={logo}
          alt={`${platform} logo`}
          className="mb-4"
          style={{ width: 50, height: 50, objectFit: 'contain' }}
        />
        <h5 className="card-title">{platform}</h5>
        <p className={`card-text ${connected ? 'text-success' : 'text-muted'}`}>
          {connected ? 'Connected' : 'Not Connected'}
        </p>
      </div>
    </div>
  );
};

export default SocialCard;
