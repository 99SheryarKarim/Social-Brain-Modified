import { useNavigate } from 'react-router-dom';
import { showSuccessToast } from '../../utils/toast';

const ProfilePage = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    showSuccessToast('Logged out successfully');
    navigate('/');
  };

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
      <div className="card shadow border-0 rounded-4 p-5 text-center" style={{ width: 380 }}>

        <div className="mx-auto mb-3 rounded-circle d-flex align-items-center justify-content-center"
          style={{
            width: 80, height: 80,
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            fontSize: 32, color: 'white', fontWeight: 700
          }}>
          {user.email[0].toUpperCase()}
        </div>

        <h5 className="fw-bold mb-1">{user.email}</h5>
        <span className="badge bg-success mb-4">● Active</span>

        <div className="bg-light rounded-3 p-3 mb-4 text-start">
          <small className="text-muted d-block mb-1">Email</small>
          <span className="fw-semibold">{user.email}</span>
        </div>

        <button className="btn btn-danger rounded-pill w-100" onClick={handleLogout}>
          <i className="fas fa-sign-out-alt me-2" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
