import { HashRouter, Routes, Route, useSearchParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Sidebar from '../components/sidebar/Sidebar';
import Navbar from '../components/navbar/Navbar';
import PostGeniePage from '../pages/post-genie/PostGeniePage';
import ConnectSocial from '../pages/connect-social/ConnectSocial';
import PostsPage from '../pages/posts/PostsPage';
import QuickPost from '../pages/quick-post/QuickPost';
import AuthPage from '../pages/auth/AuthPage';
import ProfilePage from '../pages/profile/ProfilePage';
import RecentPage from '../pages/recent/RecentPage';

// Handles Google OAuth redirect — reads token from URL before deciding what to render
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
            <div className="flex-grow-1 overflow-auto p-4" style={{ backgroundColor: '#f8f9fa' }}>
              <Routes>
                <Route path="/" element={<PostGeniePage />} />
                <Route path="/quick-post" element={<QuickPost />} />
                <Route path="/connect-social" element={<ConnectSocial />} />
                <Route path="/posts" element={<PostsPage user={user} />} />
                <Route path="/recent" element={<RecentPage user={user} />} />
                <Route path="/profile" element={
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
