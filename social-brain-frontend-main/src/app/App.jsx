import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from '../components/sidebar/Sidebar';
import Navbar from '../components/navbar/Navbar';
import PostGeniePage from '../pages/post-genie/PostGeniePage';
import ConnectSocial from '../pages/connect-social/ConnectSocial';
import QueuePage from '../pages/queue/QueuePage';
import PostsPage from '../pages/posts/PostsPage';
import QuickPost from '../pages/quick-post/QuickPost';
import BillingPage from '../pages/billing/BillingPage';
function App() {
  return (
    <BrowserRouter>
      <div className="container-fluid">
        <div className="row vh-100">
          {/* Sidebar (left column) */}
          <div className="col-md-3 col-lg-2 bg-light p-0">
            <Sidebar />
          </div>

          {/* Main content area (right column) */}
          <div className="col-md-9 col-lg-10 d-flex flex-column p-0">
            {/* Navbar */}
            <Navbar />
            {/* Scrollable content */}
            <div className="flex-grow-1 overflow-auto p-4" style={{ backgroundColor: '#f8f9fa' }}>
              <Routes>
                <Route path="/" element={<PostGeniePage></PostGeniePage>} />
                <Route path="/user" element={<div>User Profile</div>} />
                <Route path="/notifications" element={<div>Notifications</div>} />
                <Route path="/quick-post" element={<QuickPost></QuickPost>} />
                <Route path="/connect-social" element={<ConnectSocial></ConnectSocial>} />
                <Route path="/queue" element={<QueuePage></QueuePage>} />
                <Route path="/queue" element={<QueuePage></QueuePage>} />
                <Route path="/posts" element={<PostsPage></PostsPage>} />
                <Route path="/billing" element={<BillingPage></BillingPage>} />

              </Routes>
            </div>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
