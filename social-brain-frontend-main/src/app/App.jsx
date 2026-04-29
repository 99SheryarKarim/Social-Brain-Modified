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

function AuthHandler({ onAuthSuccess }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    if (token && email) {
      onAuthSuccess({ token, email });
      navigate('/profile', { replace: true });
    }
  }, []);

  return null;
}

function App() {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('userEmail');
    return token && email ? { token, email } : null;
  });

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
      <div className="container-fluid">
        <div className="row vh-100">
          <div className="col-md-3 col-lg-2 bg-light p-0">
            <Sidebar />
          </div>
          <div className="col-md-9 col-lg-10 d-flex flex-column p-0">
            <Navbar user={user} onLogout={handleLogout} />
            <div className="flex-grow-1 overflow-auto" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #e8eeff 50%, #ede9fe 100%)', minHeight: '100%' }}>
              <Routes>
                <Route path="/"             element={<DashboardPage user={user} />} />
                <Route path="/post-genie"   element={<PostGeniePage />} />
                <Route path="/posts"        element={<PostsPage user={user} />} />
                <Route path="/connect-social" element={<ConnectSocial />} />
                <Route path="/recent"       element={<RecentPage user={user} />} />
                <Route path="/settings"     element={<SettingsPage user={user} />} />
                <Route path="/profile"      element={
                  user
                    ? <ProfilePage user={user} onLogout={handleLogout} />
                    : <AuthPage onAuthSuccess={handleAuthSuccess} />
                } />
              </Routes>
            </div>
          </div>
        </div>
      </div>
    </HashRouter>
  );
}

export default App;
