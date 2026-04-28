import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { showSuccessToast, showErrorToast } from "../../utils/toast";
import SocialCard from "../../components/social-card/SocialCard";
import styles from './ConnectSocial.module.css';

const BASE = 'http://localhost:3001/api/facebook';

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

const ConnectSocial = () => {
  const fbReady = useRef(false);
  const [fbConnected, setFbConnected] = useState(false);
  const [fbPageName, setFbPageName] = useState('');
  const [loading, setLoading] = useState(false);

  // Check connection status on load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    axios.get(`${BASE}/status`, { headers: getHeaders() })
      .then(res => {
        if (res.data.connected) {
          setFbConnected(true);
          setFbPageName(res.data.pageName || '');
        }
      })
      .catch(console.error);
  }, []);

  // Load Facebook SDK
  useEffect(() => {
    const initFB = () => {
      if (window.FB) {
        window.FB.init({
          appId: '2127638911365428',
          cookie: true,
          xfbml: true,
          version: 'v19.0',
        });
        fbReady.current = true;
      }
    };

    if (window.FB) {
      // SDK already loaded
      initFB();
    } else {
      window.fbAsyncInit = initFB;

      if (!document.getElementById('facebook-jssdk')) {
        const js = document.createElement('script');
        js.id = 'facebook-jssdk';
        js.src = 'https://connect.facebook.net/en_US/sdk.js';
        js.async = true;
        js.defer = true;
        document.body.appendChild(js);
      }
    }
  }, []);

  const handleFacebookLogin = () => {
    if (!localStorage.getItem('token')) {
      showErrorToast('Please log in to Social Brain first');
      return;
    }

    // If SDK not ready yet, wait up to 5 seconds and retry
    if (!fbReady.current || !window.FB) {
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (window.FB) {
          window.FB.init({ appId: '2127638911365428', cookie: true, xfbml: true, version: 'v19.0' });
          fbReady.current = true;
          clearInterval(interval);
          triggerFBLogin();
        } else if (attempts >= 10) {
          clearInterval(interval);
          showErrorToast('Facebook SDK failed to load. Please refresh the page and try again.');
        }
      }, 500);
      return;
    }

    triggerFBLogin();
  };

  const triggerFBLogin = () => {
    window.FB.login((response) => {
      if (response.authResponse) {
        fetchAndSavePageToken(response.authResponse.accessToken);
      } else {
        showErrorToast('Facebook login cancelled');
      }
    }, { scope: 'pages_show_list,pages_read_engagement,pages_manage_posts' });
  };

  const fetchAndSavePageToken = (userToken) => {
    window.FB.api('/me/accounts', async (response) => {
      if (!response || response.error || !response.data?.length) {
        showErrorToast('No Facebook Pages found. Please make sure you manage a Facebook Page.');
        return;
      }

      // Use the first page
      const page = response.data[0];
      const pageAccessToken = page.access_token;
      const pageId = page.id;
      const pageName = page.name;

      setLoading(true);
      try {
        await axios.post(`${BASE}/save-token`,
          { accessToken: pageAccessToken, pageId, pageName },
          { headers: getHeaders() }
        );
        setFbConnected(true);
        setFbPageName(pageName);
        showSuccessToast(`✅ Connected to "${pageName}"`);
      } catch (err) {
        showErrorToast(err.response?.data?.message || 'Failed to save token');
      } finally {
        setLoading(false);
      }
    });
  };

  const handleDisconnect = async () => {
    try {
      await axios.post(`${BASE}/disconnect`, {}, { headers: getHeaders() });
      setFbConnected(false);
      setFbPageName('');
      showSuccessToast('Facebook disconnected');
    } catch (err) {
      showErrorToast('Failed to disconnect');
    }
  };

  const platforms = [
    { name: "Facebook", logo: "https://cdn-icons-png.flaticon.com/512/733/733547.png" },
    { name: "Instagram", logo: "https://cdn-icons-png.flaticon.com/512/174/174855.png" },
    { name: "Pinterest", logo: "https://cdn-icons-png.flaticon.com/512/145/145808.png" },
    { name: "LinkedIn", logo: "https://cdn-icons-png.flaticon.com/512/174/174857.png" },
    { name: "Twitter", logo: "https://cdn-icons-png.flaticon.com/512/733/733579.png" },
    { name: "YouTube", logo: "https://cdn-icons-png.flaticon.com/512/1384/1384060.png" },
  ];

  return (
    <div className={styles.wrapper}>
      <div className="container py-5">
        <h2 className={`text-center mb-2 ${styles.heading}`}>Connect Your Social Media</h2>
        <p className="text-center text-muted mb-5">Link your accounts for post automation</p>

        {fbConnected && fbPageName && (
          <div className="alert alert-success d-flex align-items-center justify-content-between mb-4 rounded-3">
            <span>✅ Connected to Facebook Page: <strong>{fbPageName}</strong></span>
            <button className="btn btn-sm btn-outline-danger rounded-pill" onClick={handleDisconnect}>
              Disconnect
            </button>
          </div>
        )}

        <div className={styles.cardGrid}>
          {platforms.map((p) => (
            <SocialCard
              key={p.name}
              platform={p.name}
              logo={p.logo}
              connected={p.name === 'Facebook' ? fbConnected : false}
              onClick={() => {
                if (p.name === 'Facebook') {
                  fbConnected ? handleDisconnect() : handleFacebookLogin();
                } else {
                  showErrorToast(`${p.name} integration coming soon!`);
                }
              }}
            />
          ))}
        </div>

        {loading && (
          <div className="text-center mt-4">
            <div className="spinner-border spinner-border-sm text-primary" />
            <span className="ms-2 text-muted">Saving connection...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectSocial;
