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
    setLoading(true);

    try {
      const endpoint = isSignUp ? '/api/auth/signup' : '/api/auth/signin';
      
      // Validate
      if (!email || !password) {
        showErrorToast('Please fill in all fields');
        setLoading(false);
        return;
      }

      if (isSignUp && password !== confirmPassword) {
        showErrorToast('Passwords do not match');
        setLoading(false);
        return;
      }

      // Make request
      const response = await axios.post(`http://localhost:3001${endpoint}`, {
        email,
        password
      });

      // Save token
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userID', response.data.userID);
        showSuccessToast(`${isSignUp ? 'Account created' : 'Login successful'}!`);
        onAuthSuccess();
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      showErrorToast(errorMsg);
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
            <button 
              className={`auth-tab ${!isSignUp ? 'active' : ''}`}
              onClick={() => setIsSignUp(false)}
            >
              Sign In
            </button>
            <button 
              className={`auth-tab ${isSignUp ? 'active' : ''}`}
              onClick={() => setIsSignUp(true)}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            {isSignUp && (
              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            )}

            <button 
              type="submit" 
              className="auth-button"
              disabled={loading}
            >
              {loading ? 'Loading...' : (isSignUp ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          <p className="auth-toggle">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"} 
            <button 
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="auth-toggle-btn"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
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
