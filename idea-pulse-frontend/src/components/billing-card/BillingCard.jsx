import React from 'react';
import Styles from './BillingCard.module.css';
import PrimaryButton from '../primary-button/PrimaryButton';

const BillingCard = ({ title, price, features, isSelected, onSelect }) => {
  return (
    <div
      className={`card h-100 shadow-sm py-5 border-0 rounded-4 ${isSelected ? 'border border-teal' : ''} transition`}
      onClick={onSelect}
      style={{ cursor: 'pointer' }}
    >
      <div className="card-body text-center py-4">
        <h5 className="fw-bold text-dark mb-2">{title}</h5>
        <h3 className={`mb-3 ${Styles.color}`}>{price}</h3>

        <ul className="list-unstyled small text-muted mb-4">
          {features.map((feature, idx) => (
            <li key={idx} className="mb-2">
              {feature}
            </li>
          ))}
        </ul>

        <PrimaryButton className='rounded-pill'>Select</PrimaryButton>
      </div>
    </div>
  );
};

export default BillingCard;
