import { useState, useEffect } from 'react';
import axios from 'axios';
import { showSuccessToast, showErrorToast } from '../../utils/toast';

const BASE = 'http://localhost:3001/api/settings';
const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const SettingsPage = ({ user }) => {
  const [brandDescription, setBrandDescription] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!user) { setFetching(false); return; }
    axios.get(BASE, { headers: getHeaders() })
      .then(res => {
        setBrandDescription(res.data.brand_description || '');
        setTargetAudience(res.data.target_audience || '');
      })
      .catch(console.error)
      .finally(() => setFetching(false));
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user) return showErrorToast('Please log in to save settings');
    setLoading(true);
    try {
      await axios.post(BASE, { brand_description: brandDescription, target_audience: targetAudience }, { headers: getHeaders() });
      showSuccessToast('✅ Brand settings saved! AI will now use these for all posts.');
    } catch (err) {
      showErrorToast(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
        <i className="fas fa-lock fs-1 text-muted mb-3" />
        <p className="text-muted">Please log in to configure your brand settings</p>
      </div>
    );
  }

  return (
    <div className="container py-5" style={{ maxWidth: 680 }}>
      <div className="text-center mb-5">
        <h2 className="fw-bold">⚙️ Brand Voice Settings</h2>
        <p className="text-muted">Tell the AI about your brand so it generates perfectly tailored content every time</p>
      </div>

      {fetching ? (
        <div className="text-center py-4">
          <div className="spinner-grow spinner-grow-sm text-dark" />
        </div>
      ) : (
        <form onSubmit={handleSave}>
          {/* Brand Description */}
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <div className="rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
                <i className="fas fa-building text-white" />
              </div>
              <div>
                <h5 className="mb-0 fw-bold">Brand Description</h5>
                <small className="text-muted">What is your business or personal brand about?</small>
              </div>
            </div>
            <textarea
              className="form-control rounded-3"
              rows={4}
              placeholder="e.g. Eco-friendly trekking tours in Hunza Valley, Pakistan. We offer sustainable adventure experiences in the Karakoram mountains for nature lovers."
              value={brandDescription}
              onChange={(e) => setBrandDescription(e.target.value)}
            />
            <small className="text-muted mt-2 d-block">
              💡 The more specific you are, the more tailored your AI posts will be.
            </small>
          </div>

          {/* Target Audience */}
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <div className="rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #2a9d8f, #264653)' }}>
                <i className="fas fa-users text-white" />
              </div>
              <div>
                <h5 className="mb-0 fw-bold">Target Audience</h5>
                <small className="text-muted">Who are you trying to reach with your content?</small>
              </div>
            </div>
            <textarea
              className="form-control rounded-3"
              rows={3}
              placeholder="e.g. Adventure travelers aged 25-45, nature enthusiasts, eco-conscious tourists interested in Pakistan's northern areas."
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
            />
          </div>

          {/* Preview */}
          {(brandDescription || targetAudience) && (
            <div className="card border-0 rounded-4 p-4 mb-4" style={{ background: '#f0f4ff' }}>
              <h6 className="fw-bold mb-2">🤖 AI Prompt Preview</h6>
              <p className="text-muted small mb-0" style={{ fontStyle: 'italic' }}>
                "You are an AI Social Media Manager
                {brandDescription ? ` for: ${brandDescription}` : ''}.
                {targetAudience ? ` Write for: ${targetAudience}.` : ''}
                Write a post on the topic of [User Topic]."
              </p>
            </div>
          )}

          <button type="submit" className="btn btn-dark rounded-pill w-100 py-3 fw-semibold" disabled={loading}>
            {loading ? <><i className="fas fa-spinner fa-spin me-2" />Saving...</> : '💾 Save Brand Settings'}
          </button>
        </form>
      )}
    </div>
  );
};

export default SettingsPage;
