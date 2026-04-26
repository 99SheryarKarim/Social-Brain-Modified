import { useState } from 'react';
import axios from 'axios';
import { showSuccessToast, showErrorToast } from '../../utils/toast';
import './AuthPage.css';

const BASE = 'http://localhost:3001/api/auth';

export default function AuthPage({ onAuthSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [step, setStep] = useState(1); // 1 = form, 2 = otp
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const resetForm = () => { setStep(1); setOtp(''); setPassword(''); setConfirmPassword(''); };

  // SIGN UP - Step 1: send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email || !password) return showErrorToast('Please fill in all fields');
    if (password !== confirmPassword) return showErrorToast('Passwords do not match');
    if (password.length < 6) return showErrorToast('Password must be at least 6 characters');

    setLoading(true);
    try {
      await axios.post(`${BASE}/send-otp`, { email });
      showSuccessToast('OTP sent to your email!');
      setStep(2);
    } catch (err) {
      showErrorToast(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // SIGN UP - Step 2: verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp) return showErrorToast('Please enter the OTP');

    setLoading(true);
    try {
      const res = await axios.post(`${BASE}/verify-otp`, { email, password, otp });
      showSuccessToast('🎉 Account created! Welcome email sent.');
      onAuthSuccess({ token: res.data.token, email: res.data.email });
    } catch (err) {
      showErrorToast(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  // SIGN IN
  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!email || !password) return showErrorToast('Please fill in all fields');

    setLoading(true);
    try {
      const res = await axios.post(`${BASE}/signin`, { email, password });
      showSuccessToast('👋 Welcome back!');
      onAuthSuccess({ token: res.data.token, email: res.data.email });
    } catch (err) {
      showErrorToast(err.response?.data?.message || 'Invalid email or password');
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
            <button className={`auth-tab ${!isSignUp ? 'active' : ''}`}
              onClick={() => { setIsSignUp(false); resetForm(); }}>Sign In</button>
            <button className={`auth-tab ${isSignUp ? 'active' : ''}`}
              onClick={() => { setIsSignUp(true); resetForm(); }}>Sign Up</button>
          </div>

          {/* SIGN IN FORM */}
          {!isSignUp && (
            <form onSubmit={handleSignIn} className="auth-form">
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
              <button type="submit" className="auth-button" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          )}

          {/* SIGN UP - STEP 1: Email + Password */}
          {isSignUp && step === 1 && (
            <form onSubmit={handleSendOTP} className="auth-form">
              <div className="form-group">
                <label>Email</label>
                <input type="email" placeholder="Enter your email" value={email}
                  onChange={(e) => setEmail(e.target.value)} disabled={loading} />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" placeholder="Create a password" value={password}
                  onChange={(e) => setPassword(e.target.value)} disabled={loading} />
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <input type="password" placeholder="Confirm your password" value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)} disabled={loading} />
              </div>
              <button type="submit" className="auth-button" disabled={loading}>
                {loading ? 'Sending OTP...' : 'Send Verification Code'}
              </button>
            </form>
          )}

          {/* SIGN UP - STEP 2: OTP */}
          {isSignUp && step === 2 && (
            <form onSubmit={handleVerifyOTP} className="auth-form">
              <div className="otp-info">
                <p>📧 We sent a 6-digit code to</p>
                <strong>{email}</strong>
              </div>
              <div className="form-group">
                <label>Verification Code</label>
                <input type="text" placeholder="Enter 6-digit OTP" value={otp} maxLength={6}
                  onChange={(e) => setOtp(e.target.value)} disabled={loading}
                  style={{ letterSpacing: 8, fontSize: 22, textAlign: 'center' }} />
              </div>
              <button type="submit" className="auth-button" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify & Create Account'}
              </button>
              <button type="button" className="auth-button"
                style={{ background: 'transparent', color: '#667eea', border: '2px solid #667eea', marginTop: 10 }}
                onClick={() => handleSendOTP({ preventDefault: () => {} })} disabled={loading}>
                Resend OTP
              </button>
              <p className="auth-toggle" style={{ marginTop: 12 }}>
                Wrong email?
                <button type="button" className="auth-toggle-btn" onClick={() => setStep(1)}>Go back</button>
              </p>
            </form>
          )}

          <div className="auth-divider"><span>or</span></div>

          <button className="google-button" onClick={() => window.location.href = 'http://localhost:3001/api/auth/google'}>
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width="20" />
            Continue with Google
          </button>

          {!isSignUp && (
            <p className="auth-toggle">
              Don't have an account?
              <button type="button" onClick={() => { setIsSignUp(true); resetForm(); }} className="auth-toggle-btn">
                Sign Up
              </button>
            </p>
          )}
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
