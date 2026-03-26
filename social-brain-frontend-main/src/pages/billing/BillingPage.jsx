import React, { useState } from 'react';
import BillingCard from '../../components/billing-card/BillingCard';  

const BillingPage = () => {
  const [selectedPlan, setSelectedPlan] = useState('Standard');

  const plans = [
    {
      title: 'Standard',
      price: '$9.99/month',
      features: [
        '1 Social Account',
        '5000 Posts/month',
        'Basic Support',
      ],
    },
    {
      title: 'Pro',
      price: '$19.99/month',
      features: [
        '5 Social Accounts',
        '10,000 Posts/month',
        'Priority Support',
      ],
    },
    {
      title: 'Enterprise',
      price: '$49.99/month',
      features: [
        'Unlimited Social Accounts',
        'Unlimited Posts',
        'Dedicated Account Manager',
      ],
    },
  ];

  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <h2 className="fw-bold text-dark">Choose Your Billing Plan</h2>
        <p className="text-muted">Flexible pricing options for creators and businesses</p>
      </div>

      <div className="row row-cols-1 row-cols-md-3 g-4">
        {plans.map((plan, index) => (
          <div className="col" key={index}>
            <BillingCard
              title={plan.title}
              price={plan.price}
              features={plan.features}
              isSelected={selectedPlan === plan.title}
              onSelect={() => setSelectedPlan(plan.title)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default BillingPage;
