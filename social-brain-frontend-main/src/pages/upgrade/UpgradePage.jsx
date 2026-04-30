import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { showSuccessToast, showErrorToast } from '../../utils/toast';

const BASE = 'http://localhost:3001/api';
const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const features = [
  { label: 'AI Post Generation',     free: '10 / day', premium: 'Unlimited' },
  { label: 'Post Archive',           free: true,        premium: true        },
  { label: 'Facebook Publishing',    free: true,        premium: true        },
  { label: 'Post Scheduling',        free: true,        premium: true        },
  { label: 'Personal Dashboard',     free: false,       premium: true        },
  { label: 'Engagement Analytics',   free: false,       premium: true        },
  { label: 'Brand Voice Settings',   free: false,       premium: true        },
  { label: 'Priority AI Generation', free: false,       premium: true        },
];

const FeatureRow = ({ label, free, premium }) => (
  <div style={{ display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
    <span style={{ flex: 1, fontSize: 14, color: '#374151' }}>{label}</span>
    <span style={{ width: 120, textAlign: 'center', fontSize: 13 }}>
      {free === false ? <i className="fas fa-times" style={{ color: '#e2e8f0' }} /> :
       free === true  ? <i className="fas fa-check" style={{ color: '#10b981' }} /> :
       <span style={{ color: '#94a3b8', fontWeight: 500 }}>{free}</span>}
    </span>
    <span style={{ width: 120, textAlign: 'center', fontSize: 13 }}>
      {premium === true ? <i className="fas fa-check" style={{ color: '#6366f1' }} /> :
       <span style={{ color: '#6366f1', fontWeight: 600 }}>{premium}</span>}
    </span>
  </div>
);

export default function UpgradePage({ user, isPremium, onPlanChange }) {
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [upgrading, setUpgrading] = useState(false);
  const [searchParams] = useSearchParams();

  const refreshPlan = () => {
    if (!user) return;
    axios.get(`${BASE}/subscription/plan`, { headers: getHeaders() })
      .then(res => setPlan(res.data)).catch(console.error);
  };

  useEffect(() => {
    refreshPlan();
    if (searchParams.get('payment') === 'success') {
      showSuccessToast('Payment successful! Premium unlocked.');
      onPlanChange && onPlanChange();
      setTimeout(refreshPlan, 3000);
    }
    if (searchParams.get('payment') === 'cancelled') {
      showErrorToast('Payment cancelled.');
    }
  }, [user]);

  const alreadyPremium = isPremium || plan?.plan === 'premium';

  const handleUpgrade = async () => {
    if (!user) { navigate('/profile'); return; }
    setUpgrading(true);
    try {
      const res = await axios.post(`${BASE}/payment/create-checkout`, {}, { headers: getHeaders() });
      window.location.href = res.data.url;
    } catch (err) {
      showErrorToast(err.response?.data?.message || 'Failed to start checkout');
      setUpgrading(false);
    }
  };

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 20px', fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#eef2ff', borderRadius: 20, padding: '6px 16px', marginBottom: 16 }}>
          <i className="fas fa-crown" style={{ color: '#6366f1', fontSize: 13 }} />
          <span style={{ color: '#6366f1', fontSize: 12, fontWeight: 700 }}>SOCIAL BRAIN PREMIUM</span>
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: '#0f172a', margin: '0 0 12px', letterSpacing: '-1px' }}>
          {alreadyPremium ? 'You have Premium Access' : 'Unlock the Full Power of AI'}
        </h1>
        <p style={{ color: '#64748b', fontSize: 16, margin: 0 }}>
          {alreadyPremium
            ? 'Enjoy unlimited access to all Social Brain features.'
            : 'Upgrade to Premium for unlimited content generation and advanced analytics.'}
        </p>
      </div>

      {/* Premium active banner */}
      {alreadyPremium && (
        <div style={{
          background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
          borderRadius: 16, padding: '24px 28px', marginBottom: 40,
          display: 'flex', alignItems: 'center', gap: 16
        }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="fas fa-crown" style={{ color: '#fbbf24', fontSize: 20 }} />
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 700, color: '#fff', fontSize: 16 }}>Premium Active</p>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>All features unlocked. Thank you for your support!</p>
          </div>
        </div>
      )}

      {/* Usage Banner for free users */}
      {user && plan && !alreadyPremium && (
        <div style={{
          background: 'linear-gradient(135deg, #fff7ed, #fef3c7)',
          border: '1px solid #fcd34d', borderRadius: 12, padding: '16px 20px',
          marginBottom: 32, display: 'flex', alignItems: 'center', gap: 12
        }}>
          <i className="fas fa-exclamation-triangle" style={{ color: '#f59e0b', fontSize: 18 }} />
          <div style={{ flexGrow: 1 }}>
            <p style={{ margin: 0, fontWeight: 600, color: '#92400e', fontSize: 14 }}>
              You have used {plan.daily_usage} of {plan.limit} free generations today
            </p>
            <div style={{ background: '#e5e7eb', borderRadius: 20, height: 6, marginTop: 6, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 20,
                background: plan.daily_usage >= plan.limit ? '#ef4444' : '#f59e0b',
                width: `${Math.min(100, (plan.daily_usage / plan.limit) * 100)}%`
              }} />
            </div>
          </div>
          <span style={{ fontSize: 13, color: '#92400e', fontWeight: 600 }}>{plan.remaining} left</span>
        </div>
      )}

      {/* Pricing Cards — hide if already premium */}
      {!alreadyPremium && (
        <div className="row g-4 mb-5">
          <div className="col-md-6">
            <div style={{ background: '#fff', borderRadius: 20, padding: '32px', border: '1px solid #e2e8f0', height: '100%' }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>Free</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 24 }}>
                <span style={{ fontSize: 40, fontWeight: 800, color: '#0f172a' }}>$0</span>
                <span style={{ color: '#94a3b8', fontSize: 14 }}>/month</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px' }}>
                {['10 AI generations per day', 'Facebook publishing', 'Post scheduling', 'Post archive'].map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, fontSize: 14, color: '#374151' }}>
                    <i className="fas fa-check" style={{ color: '#10b981', fontSize: 12 }} />{f}
                  </li>
                ))}
                {['Personal Dashboard', 'Engagement Analytics', 'Brand Voice'].map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, fontSize: 14, color: '#cbd5e1' }}>
                    <i className="fas fa-times" style={{ fontSize: 12 }} />{f}
                  </li>
                ))}
              </ul>
              <div style={{ background: '#f8fafc', borderRadius: 10, padding: '12px 16px', textAlign: 'center', fontSize: 14, color: '#94a3b8', fontWeight: 500 }}>
                Current Plan
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81)', borderRadius: 20, padding: '32px', height: '100%', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: '4px 12px', marginBottom: 8 }}>
                <i className="fas fa-crown" style={{ color: '#fbbf24', fontSize: 11 }} />
                <span style={{ color: '#fbbf24', fontSize: 11, fontWeight: 700 }}>MOST POPULAR</span>
              </div>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>Premium</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 24 }}>
                <span style={{ fontSize: 40, fontWeight: 800, color: '#fff' }}>$9</span>
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>/month</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px' }}>
                {['Unlimited AI generations', 'Everything in Free', 'Personal Dashboard', 'Engagement Analytics', 'Brand Voice Settings', 'Priority support'].map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, fontSize: 14, color: 'rgba(255,255,255,0.9)' }}>
                    <i className="fas fa-check" style={{ color: '#a5b4fc', fontSize: 12 }} />{f}
                  </li>
                ))}
              </ul>
              <button onClick={handleUpgrade} disabled={upgrading} style={{
                width: '100%', padding: '14px', borderRadius: 12, border: 'none',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(99,102,241,0.4)', opacity: upgrading ? 0.7 : 1
              }}>
                {upgrading ? 'Redirecting to payment...' : 'Upgrade to Premium — $9/mo'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feature Comparison Table */}
      <div style={{ background: '#fff', borderRadius: 20, padding: '32px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: '0 0 24px' }}>Full Feature Comparison</h3>
        <div style={{ display: 'flex', padding: '0 0 12px', borderBottom: '2px solid #f1f5f9' }}>
          <span style={{ flex: 1, fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Feature</span>
          <span style={{ width: 120, textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Free</span>
          <span style={{ width: 120, textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#6366f1', textTransform: 'uppercase' }}>Premium</span>
        </div>
        {features.map(f => <FeatureRow key={f.label} {...f} />)}
      </div>
    </div>
  );
}
