import { useState } from 'react';
import axios from 'axios';
import { showSuccessToast, showErrorToast } from '../../utils/toast';
import './AuthPage.css';

export default function AuthPage({ onAuthSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return showErrorToast('Please fill in all fields');
    if (isSignUp && password !== confirmPassword) return showErrorToast('Passwords do not match');

    setLoading(true);
    try {
      const endpoint = isSignUp ? '/api/auth/signup' : '/api/auth/signin';
      const response = await axios.post(`http://localhost:3001${endpoint}`, { email, password });

      if (response.data.token) {
        showSuccessToast(isSignUp ? '🎉 Account created successfully!' : '👋 Welcome back!');
        onAuthSuccess({ token: response.data.token, email: response.data.email });
      }
    } catch (error) {
      showErrorToast(error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>🧠 Social Brain</h1>
          <p>AI-Powered Social Media Post Generator</p>
        </div>

        <div className="auth-form-wrapper">
          <div className="auth-tabs">
            <button className={`auth-tab ${!isSignUp ? 'active' : ''}`} onClick={() => setIsSignUp(false)}>
              Sign In
            </button>
            <button className={`auth-tab ${isSignUp ? 'active' : ''}`} onClick={() => setIsSignUp(true)}>
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="Enter your email" value={email}
                onChange={(e) => setEmail(e.target.value)} disabled={loading} />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="Enter your password" value={password}
                onChange={(e) => setPassword(e.target.value)} disabled={loading} />
            </div>
            {isSignUp && (
              <div className="form-group">
                <label>Confirm Password</label>
                <input type="password" placeholder="Confirm your password" value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)} disabled={loading} />
              </div>
            )}
            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Loading...' : (isSignUp ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          <div className="auth-divider"><span>or</span></div>

          <button className="google-button" onClick={() => window.location.href = 'http://localhost:3001/api/auth/google'}>
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width="20" />
            Continue with Google
          </button>

          <p className="auth-toggle">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="auth-toggle-btn">
              {isSignUp ? ' Sign In' : ' Sign Up'}
            </button>
          </p>
        </div>

        <div className="auth-features">
          <div className="feature">✨ AI-Powered Posts</div>
          <div className="feature">🎯 Smart Tone Selection</div>
          <div className="feature">📱 Social Media Ready</div>
        </div>
      </div>
    </div>
  );
}
