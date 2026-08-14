import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { showSuccessToast, showErrorToast } from '../../utils/toast';

const BASE = 'http://localhost:3001/api/settings';
const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const Section = ({ icon, title, subtitle, accent = '#46a29f', children }) => (
  <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9', overflow: 'hidden', marginBottom: 16 }}>
    <div style={{ padding: '20px 24px', borderBottom: '1px solid #f8fafc', display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 38, height: 38, borderRadius: 10, background: accent + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <i className={icon} style={{ color: accent, fontSize: 15 }} />
      </div>
      <div>
        <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: '#1e293b' }}>{title}</p>
        <p style={{ margin: 0, fontSize: 12, color: '#94a3b8' }}>{subtitle}</p>
      </div>
    </div>
    <div style={{ padding: '20px 24px' }}>{children}</div>
  </div>
);

const Field = ({ label, children }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</label>
    {children}
  </div>
);

const Input = (props) => (
  <input {...props} style={{
    width: '100%', padding: '10px 14px', borderRadius: 10,
    border: '1px solid #e2e8f0', fontSize: 14, color: '#1e293b',
    outline: 'none', transition: 'border 0.15s', background: '#fff',
    ...props.style
  }}
    onFocus={e => e.target.style.borderColor = '#46a29f'}
    onBlur={e => e.target.style.borderColor = '#e2e8f0'}
  />
);

const Btn = ({ children, loading, danger, outline, ...props }) => (
  <button {...props} style={{
    padding: '10px 20px', borderRadius: 10, fontWeight: 600, fontSize: 13,
    cursor: props.disabled ? 'not-allowed' : 'pointer', transition: 'all 0.15s',
    border: danger ? '1px solid #fca5a5' : outline ? '1px solid #e2e8f0' : 'none',
    background: danger ? '#fff' : outline ? '#fff' : 'linear-gradient(135deg, #46a29f, #3b8c86)',
    color: danger ? '#ef4444' : outline ? '#64748b' : '#fff',
    opacity: props.disabled ? 0.6 : 1,
    ...props.style
  }}>
    {loading ? <><i className="fas fa-spinner fa-spin me-2" />Saving...</> : children}
  </button>
);

export default function SettingsPage({ user, onLogout, onUsernameChange }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState('account');

  // Account
  const [username, setUsername] = useState('');
  const [savingUsername, setSavingUsername] = useState(false);

  // Password
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [savingPw, setSavingPw] = useState(false);
  const [showPw, setShowPw] = useState(false);

  // Delete
  const [deletePw, setDeletePw] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Theme
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = (dark) => {
    // App uses light/white theme only
    setIsDark(false);
    localStorage.setItem('theme', 'light');
    document.documentElement.classList.remove('dark');
    showSuccessToast('☀️ Light mode enabled');
  };

  useEffect(() => {
    if (user) setUsername(user.email.split('@')[0]);
  }, [user]);

  if (!user) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <i className="fas fa-lock" style={{ fontSize: 32, color: '#94a3b8', marginBottom: 12 }} />
        <p style={{ color: '#94a3b8' }}>Please log in to access settings</p>
      </div>
    );
  }

  const handleSaveUsername = async (e) => {
    e.preventDefault();
    if (!username.trim()) return showErrorToast('Username cannot be empty');
    setSavingUsername(true);
    try {
      await axios.patch(`${BASE}/username`, { username }, { headers: getHeaders() });
      localStorage.setItem('userUsername', username.trim());
      onUsernameChange && onUsernameChange(username.trim());
      showSuccessToast('Display name updated!');
    } catch (err) {
      showErrorToast(err.response?.data?.message || 'Failed to update');
    } finally { setSavingUsername(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPw || !newPw || !confirmPw) return showErrorToast('Please fill all fields');
    if (newPw !== confirmPw) return showErrorToast('New passwords do not match');
    if (newPw.length < 6) return showErrorToast('Password must be at least 6 characters');
    setSavingPw(true);
    try {
      await axios.patch(`${BASE}/password`, { currentPassword: currentPw, newPassword: newPw }, { headers: getHeaders() });
      showSuccessToast('Password changed successfully!');
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
    } catch (err) {
      showErrorToast(err.response?.data?.message || 'Failed to change password');
    } finally { setSavingPw(false); }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    if (deleteConfirm !== 'DELETE') return showErrorToast('Please type DELETE to confirm');
    if (!deletePw) return showErrorToast('Password is required');
    setDeleting(true);
    try {
      await axios.delete(`${BASE}/account`, { data: { password: deletePw }, headers: getHeaders() });
      showSuccessToast('Account deleted.');
      onLogout && onLogout();
      navigate('/');
    } catch (err) {
      showErrorToast(err.response?.data?.message || 'Failed to delete account');
    } finally { setDeleting(false); }
  };

  const tabs = [
    { key: 'account',    icon: 'fas fa-user',                   label: 'Account'    },
    { key: 'appearance', icon: 'fas fa-palette',                 label: 'Appearance' },
    { key: 'security',   icon: 'fas fa-lock',                    label: 'Security'   },
    { key: 'danger',     icon: 'fas fa-triangle-exclamation',    label: 'Danger Zone'},
  ];

  return (
    <div className="app-page-settings" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', margin: '0 0 4px', letterSpacing: '-0.5px' }}>Settings</h1>
        <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>Manage your account details and preferences</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: '#f8fafc', borderRadius: 12, padding: 4, marginBottom: 24 }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            flex: 1, padding: '9px 0', border: 'none', borderRadius: 9, cursor: 'pointer',
            fontWeight: 600, fontSize: 12, transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            background: tab === t.key ? '#fff' : 'transparent',
            color: tab === t.key ? (t.key === 'danger' ? '#ef4444' : '#46a29f') : '#94a3b8',
            boxShadow: tab === t.key ? '0 1px 4px rgba(0,0,0,0.08)' : 'none'
          }}>
            <i className={t.icon} style={{ fontSize: 11 }} />{t.label}
          </button>
        ))}
      </div>

      {/* ── Account Tab ── */}
      {tab === 'account' && (
        <>
          <Section icon="fas fa-id-card" title="Profile Information" subtitle="Update your display name and account details">
            {/* Read-only email */}
            <Field label="Email Address">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#f8fafc', borderRadius: 10, border: '1px solid #f1f5f9' }}>
                <i className="fas fa-envelope" style={{ color: '#94a3b8', fontSize: 13 }} />
                <span style={{ fontSize: 14, color: '#64748b' }}>{user.email}</span>
                <span style={{ marginLeft: 'auto', fontSize: 10, background: '#f1f5f9', color: '#94a3b8', borderRadius: 20, padding: '2px 8px', fontWeight: 600 }}>CANNOT CHANGE</span>
              </div>
            </Field>

            <form onSubmit={handleSaveUsername}>
              <Field label="Display Name">
                <Input
                  type="text" value={username} placeholder="Your display name"
                  onChange={e => setUsername(e.target.value)}
                />
                <p style={{ margin: '6px 0 0', fontSize: 11, color: '#94a3b8' }}>This is how your name appears across the app</p>
              </Field>
              <Btn type="submit" loading={savingUsername} disabled={savingUsername}>
                Save Changes
              </Btn>
            </form>
          </Section>

          <Section icon="fas fa-crown" title="Subscription Plan" subtitle="Your current plan and billing" accent="#f59e0b">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#fffbeb', borderRadius: 10, border: '1px solid #fcd34d' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <i className="fas fa-crown" style={{ color: '#f59e0b' }} />
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: '#92400e' }}>
                    {localStorage.getItem('userPlan') === 'premium' ? 'Premium Plan' : 'Free Plan'}
                  </p>
                  <p style={{ margin: 0, fontSize: 12, color: '#b45309' }}>
                    {localStorage.getItem('userPlan') === 'premium' ? 'Unlimited access' : '10 generations/day'}
                  </p>
                </div>
              </div>
              {localStorage.getItem('userPlan') !== 'premium' && (
                <button onClick={() => navigate('/upgrade')} style={{
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff',
                  border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer'
                }}>Upgrade</button>
              )}
            </div>
          </Section>
        </>
      )}

      {/* ── Appearance Tab ── */}
      {tab === 'appearance' && (
        <Section icon="fas fa-palette" title="Appearance" subtitle="Customize how Idea Pulse looks for you" accent="#3b8c86">
          <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>Choose your preferred theme. Your selection is saved and applied every time you open the app.</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
            {/* Light Theme Card */}
            <div onClick={() => toggleTheme(false)} style={{
              borderRadius: 14, border: `2px solid ${!isDark ? '#46a29f' : '#e2e8f0'}`,
              padding: 16, cursor: 'pointer', transition: 'all 0.2s',
              background: !isDark ? '#e8f6f5' : '#fff'
            }}>
              <div style={{ background: '#f8fafc', borderRadius: 10, padding: 12, marginBottom: 12, border: '1px solid #e2e8f0' }}>
                <div style={{ height: 8, background: '#e2e8f0', borderRadius: 4, marginBottom: 6, width: '70%' }} />
                <div style={{ height: 6, background: '#f1f5f9', borderRadius: 4, marginBottom: 4, width: '90%' }} />
                <div style={{ height: 6, background: '#f1f5f9', borderRadius: 4, width: '60%' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${!isDark ? '#46a29f' : '#e2e8f0'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {!isDark && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#46a29f' }} />}
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: '#1e293b' }}>Light</p>
                  <p style={{ margin: 0, fontSize: 11, color: '#94a3b8' }}>Clean & bright</p>
                </div>
              </div>
            </div>

            {/* Dark Theme Card */}
            <div onClick={() => toggleTheme(true)} style={{
              borderRadius: 14, border: `2px solid ${isDark ? '#46a29f' : '#e2e8f0'}`,
              padding: 16, cursor: 'pointer', transition: 'all 0.2s',
              background: isDark ? '#e8f6f5' : '#fff'
            }}>
              <div style={{ background: '#1e293b', borderRadius: 10, padding: 12, marginBottom: 12, border: '1px solid #334155' }}>
                <div style={{ height: 8, background: '#334155', borderRadius: 4, marginBottom: 6, width: '70%' }} />
                <div style={{ height: 6, background: '#2d3748', borderRadius: 4, marginBottom: 4, width: '90%' }} />
                <div style={{ height: 6, background: '#2d3748', borderRadius: 4, width: '60%' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${isDark ? '#46a29f' : '#e2e8f0'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {isDark && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#46a29f' }} />}
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: '#1e293b' }}>Dark</p>
                  <p style={{ margin: 0, fontSize: 11, color: '#94a3b8' }}>Easy on the eyes</p>
                </div>
              </div>
            </div>
          </div>

          {/* Toggle switch */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: '#f8fafc', borderRadius: 12, border: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <i className={`fas fa-${isDark ? 'moon' : 'sun'}`} style={{ color: isDark ? '#46a29f' : '#f59e0b', fontSize: 16 }} />
              <div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: '#1e293b' }}>{isDark ? 'Dark Mode' : 'Light Mode'}</p>
                <p style={{ margin: 0, fontSize: 12, color: '#94a3b8' }}>{isDark ? 'Dark theme is active' : 'Light theme is active'}</p>
              </div>
            </div>
            <div onClick={() => toggleTheme(!isDark)} style={{
              width: 48, height: 26, borderRadius: 13, cursor: 'pointer', transition: 'background 0.3s',
              background: isDark ? '#46a29f' : '#e2e8f0', position: 'relative', flexShrink: 0
            }}>
              <div style={{
                width: 20, height: 20, borderRadius: '50%', background: '#fff',
                position: 'absolute', top: 3, transition: 'left 0.3s',
                left: isDark ? 24 : 4,
                boxShadow: '0 1px 4px rgba(0,0,0,0.2)'
              }} />
            </div>
          </div>
        </Section>
      )}

      {/* ── Security Tab ── */}
      {tab === 'security' && (
        <Section icon="fas fa-shield-halved" title="Change Password" subtitle="Update your password to keep your account secure" accent="#0ea5e9">
          <form onSubmit={handleChangePassword}>
            <Field label="Current Password">
              <div style={{ position: 'relative' }}>
                <Input type={showPw ? 'text' : 'password'} value={currentPw} placeholder="Enter current password" onChange={e => setCurrentPw(e.target.value)} style={{ paddingRight: 40 }} />
                <button type="button" onClick={() => setShowPw(s => !s)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                  <i className={`fas fa-eye${showPw ? '-slash' : ''}`} style={{ fontSize: 13 }} />
                </button>
              </div>
            </Field>
            <Field label="New Password">
              <Input type={showPw ? 'text' : 'password'} value={newPw} placeholder="At least 6 characters" onChange={e => setNewPw(e.target.value)} />
            </Field>
            <Field label="Confirm New Password">
              <Input type={showPw ? 'text' : 'password'} value={confirmPw} placeholder="Repeat new password" onChange={e => setConfirmPw(e.target.value)} />
              {newPw && confirmPw && newPw !== confirmPw && (
                <p style={{ margin: '6px 0 0', fontSize: 11, color: '#ef4444' }}>Passwords do not match</p>
              )}
            </Field>

            {/* Password strength */}
            {newPw && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                  {[1,2,3,4].map(i => (
                    <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: newPw.length >= i * 3 ? (newPw.length >= 10 ? '#10b981' : newPw.length >= 6 ? '#f59e0b' : '#ef4444') : '#f1f5f9' }} />
                  ))}
                </div>
                <p style={{ margin: 0, fontSize: 11, color: '#94a3b8' }}>
                  {newPw.length < 6 ? 'Too short' : newPw.length < 10 ? 'Fair' : 'Strong password'}
                </p>
              </div>
            )}

            <Btn type="submit" loading={savingPw} disabled={savingPw || (newPw && confirmPw && newPw !== confirmPw)}>
              Update Password
            </Btn>
          </form>
        </Section>
      )}

      {/* ── Danger Zone Tab ── */}
      {tab === 'danger' && (
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #fca5a5', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #fff1f2', background: '#fff1f2', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fas fa-triangle-exclamation" style={{ color: '#ef4444', fontSize: 15 }} />
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: '#991b1b' }}>Delete Account</p>
              <p style={{ margin: 0, fontSize: 12, color: '#f87171' }}>This action is permanent and cannot be undone</p>
            </div>
          </div>
          <div style={{ padding: '20px 24px' }}>
            <div style={{ background: '#fff1f2', borderRadius: 10, padding: '12px 16px', marginBottom: 20, border: '1px solid #fecaca' }}>
              <p style={{ margin: 0, fontSize: 13, color: '#991b1b', fontWeight: 500 }}>⚠️ Warning: Deleting your account will permanently remove:</p>
              <ul style={{ margin: '8px 0 0', paddingLeft: 20, fontSize: 13, color: '#b91c1c' }}>
                <li>All your generated posts and archive</li>
                <li>Your activity history</li>
                <li>Your brand voice settings</li>
                <li>Your Facebook connection</li>
              </ul>
            </div>

            <form onSubmit={handleDeleteAccount}>
              <Field label="Confirm with your password">
                <Input type="password" value={deletePw} placeholder="Enter your password" onChange={e => setDeletePw(e.target.value)} />
              </Field>
              <Field label='Type "DELETE" to confirm'>
                <Input type="text" value={deleteConfirm} placeholder='Type DELETE here' onChange={e => setDeleteConfirm(e.target.value)} />
              </Field>
              <Btn
                type="submit" danger
                loading={deleting}
                disabled={deleting || deleteConfirm !== 'DELETE' || !deletePw}
                style={{ width: '100%', marginTop: 4 }}
              >
                <i className="fas fa-trash me-2" />
                Permanently Delete My Account
              </Btn>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
