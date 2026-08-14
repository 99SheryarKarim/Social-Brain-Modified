import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import './styles/theme.css'
import './styles/pages.css'
import './index.css'
import App from './app/App.jsx'
import { Provider } from 'react-redux';
import store from './app/store.js';

// Always use light / white theme
document.documentElement.classList.remove('dark');
localStorage.setItem('theme', 'light');

const LoadingScreen = ({ onDone }) => {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(0);

  const phases = [
    'Initializing AI Engine...',
    'Loading Brand Settings...',
    'Connecting Services...',
    'Almost Ready...',
  ];

  useEffect(() => {
    // Progress bar animation
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(interval); return 100; }
        return p + 1.7;
      });
    }, 60);

    // Phase text cycling
    const p1 = setTimeout(() => setPhase(1), 1000);
    const p2 = setTimeout(() => setPhase(2), 2000);
    const p3 = setTimeout(() => setPhase(3), 3000);
    const done = setTimeout(() => onDone(), 4000);

    return () => { clearInterval(interval); clearTimeout(p1); clearTimeout(p2); clearTimeout(p3); clearTimeout(done); };
  }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999,
      background: '#f8f9fa',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Inter', system-ui, sans-serif",
      animation: progress >= 100 ? 'fadeOut 0.5s ease forwards' : 'none',
    }}>
      <style>{`
        @keyframes fadeOut { to { opacity: 0; pointer-events: none; } }
        @keyframes pulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.7; transform:scale(0.95); } }
        @keyframes float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-8px); } }
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
      `}</style>

      {/* Glow circles */}
      <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(70,162,159,0.08) 0%, transparent 70%)', top: '10%', left: '10%' }} />
      <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(70,162,159,0.05) 0%, transparent 70%)', bottom: '10%', right: '10%' }} />

      {/* Logo */}
      <div style={{ animation: 'float 3s ease-in-out infinite', marginBottom: 32, textAlign: 'center' }}>
        <div style={{
          width: 80, height: 80, borderRadius: 20,
          background: 'linear-gradient(135deg, #46a29f, #3b8c86)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
          boxShadow: '0 8px 32px rgba(70,162,159,0.25)'
        }}>
          <i className="fas fa-lightbulb" style={{ color: '#fff', fontSize: 36 }} />
        </div>
        <h1 style={{
          margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: '-1px',
          color: '#1e293b'
        }}>Idea Pulse</h1>
        <p style={{ margin: '6px 0 0', color: '#94a3b8', fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          AI Social Media Manager
        </p>
      </div>

      {/* Spinner ring */}
      <div style={{
        width: 48, height: 48, borderRadius: '50%',
        border: '3px solid #e5e7eb',
        borderTopColor: '#46a29f',
        animation: 'spin 1s linear infinite',
        marginBottom: 32
      }} />

      {/* Progress bar */}
      <div style={{ width: 280, marginBottom: 16 }}>
        <div style={{ background: '#e5e7eb', borderRadius: 20, height: 4, overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 20,
            background: 'linear-gradient(90deg, #46a29f, #5bb8b4, #3b8c86)',
            backgroundSize: '200% auto',
            animation: 'shimmer 1.5s linear infinite',
            width: `${Math.min(100, progress)}%`,
            transition: 'width 0.1s linear',
            boxShadow: '0 0 8px rgba(70,162,159,0.4)'
          }} />
        </div>
      </div>

      {/* Phase text */}
      <p style={{
        color: '#64748b', fontSize: 13, margin: 0,
        letterSpacing: '0.02em', minHeight: 20,
        transition: 'opacity 0.3s'
      }}>
        {phases[phase]}
      </p>

      {/* Version */}
      <p style={{ position: 'absolute', bottom: 24, color: '#cbd5e1', fontSize: 11 }}>
        v1.0.0 &nbsp;·&nbsp; FYP 2025
      </p>
    </div>
  );
};

const Root = () => {
  const [loading, setLoading] = useState(true);

  return (
    <>
      {loading && <LoadingScreen onDone={() => setLoading(false)} />}
      {!loading && (
        <Provider store={store}>
          <App />
          <Toaster
            position="top-right"
            reverseOrder={false}
            gutter={8}
            toastOptions={{
              duration: 3000,
              style: {
                background: '#fff', color: '#333',
                borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              },
            }}
          />
        </Provider>
      )}
    </>
  );
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>
);
