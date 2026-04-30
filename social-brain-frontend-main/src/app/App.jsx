import { HashRouter, Routes, Route, useSearchParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Sidebar from '../components/sidebar/Sidebar';
import Navbar from '../components/navbar/Navbar';
import DashboardPage from '../pages/dashboard/DashboardPage';
import PostGeniePage from '../pages/post-genie/PostGeniePage';
import ConnectSocial from '../pages/connect-social/ConnectSocial';
import PostsPage from '../pages/posts/PostsPage';
import AuthPage from '../pages/auth/AuthPage';
import ProfilePage from '../pages/profile/ProfilePage';
import RecentPage from '../pages/recent/RecentPage';
import SettingsPage from '../pages/settings/SettingsPage';
import UpgradePage from '../pages/upgrade/UpgradePage';

function AuthHandler({ onAuthSuccess }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  useEffect(() => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    if (token && email) { onAuthSuccess({ token, email }); navigate('/profile', { replace: true }); }
  }, []);
  return null;
}

function App() {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('userEmail');
    return token && email ? { token, email } : null;
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userPlan, setUserPlan] = useState('free');

  useEffect(() => {
    if (!user) return;
    fetch('http://localhost:3001/api/subscription/plan', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(r => r.json()).then(d => setUserPlan(d.plan || 'free')).catch(() => {});
  }, [user]);

  const handleAuthSuccess = (userData) => {
    localStorage.setItem('token', userData.token);
    localStorage.setItem('userEmail', userData.email);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    setUser(null);
  };

  return (
    <HashRouter>
      <AuthHandler onAuthSuccess={handleAuthSuccess} />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          zIndex: 200, display: 'block'
        }} className="d-lg-none" />
      )}

      <div style={{ display: 'flex', minHeight: '100vh' }}>
        {/* Sidebar */}
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          marginLeft: 0, transition: 'margin-left 0.3s'
        }} className="main-content">
          <Navbar user={user} onLogout={handleLogout} onMenuClick={() => setSidebarOpen(o => !o)} />
          <div style={{ flex: 1, overflow: 'auto', background: 'linear-gradient(135deg, #f0f4ff 0%, #e8eeff 50%, #ede9fe 100%)' }}>
            <Routes>
              <Route path="/"              element={
                user && userPlan === 'free'
                  ? <UpgradePage user={user} />
                  : <DashboardPage user={user} />
              } />
              <Route path="/post-genie"    element={<PostGeniePage />} />
              <Route path="/posts"         element={<PostsPage user={user} />} />
              <Route path="/connect-social" element={<ConnectSocial />} />
              <Route path="/recent"        element={<RecentPage user={user} />} />
              <Route path="/settings"      element={<SettingsPage user={user} />} />
              <Route path="/upgrade"       element={<UpgradePage user={user} />} />
              <Route path="/profile"       element={
                user
                  ? <ProfilePage user={user} onLogout={handleLogout} />
                  : <AuthPage onAuthSuccess={handleAuthSuccess} />
              } />
            </Routes>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 992px) {
          .main-content { margin-left: 220px !important; }
          .sidebar-mobile-overlay { display: none !important; }
        }
        @media (max-width: 991px) {
          .main-content { margin-left: 0 !important; }
        }
      `}</style>
    </HashRouter>
  );
}

export default App;
