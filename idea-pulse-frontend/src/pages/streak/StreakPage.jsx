import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getActivityCalendar, getStreakStats, recordDailyActivity } from '../../utils/streak';

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const FlameIcon = ({ streak = 0 }) => {
  const intensity = Math.min(1, Math.max(0.45, streak / 10));
  const glow = `rgba(249, 115, 22, ${0.3 + intensity * 0.35})`;
  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 56, height: 56, marginRight: 10 }}>
      <div style={{ position: 'absolute', width: 46, height: 46, borderRadius: '50%', background: `radial-gradient(circle, ${glow} 0%, transparent 70%)`, filter: 'blur(8px)', animation: 'streakGlow 1.6s ease-in-out infinite alternate' }} />
      <i className="fas fa-fire" style={{ fontSize: 30, color: streak > 0 ? '#fb923c' : '#cbd5e1', textShadow: `0 0 16px ${glow}`, animation: 'streakFlicker 1.2s ease-in-out infinite alternate', transform: `scale(${0.95 + intensity * 0.08})` }} />
    </div>
  );
};

const StatCard = ({ label, value, hint }) => (
  <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
    <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
    <p style={{ margin: '8px 0 0', fontSize: 28, fontWeight: 800, color: '#0f172a' }}>{value}</p>
    {hint && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>{hint}</p>}
  </div>
);

export default function StreakPage() {
  const [stats, setStats] = useState(() => getStreakStats(localStorage.getItem('userEmail') || ''));
  const [monthOffset, setMonthOffset] = useState(0);

  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail') || '';
    const nextStats = recordDailyActivity(userEmail);
    setStats(nextStats);
  }, []);

  const calendarCells = useMemo(() => getActivityCalendar(stats.activeDates || [], monthOffset), [stats.activeDates, monthOffset]);

  const currentMonth = useMemo(() => {
    const base = new Date();
    base.setMonth(base.getMonth() + monthOffset);
    return `${monthNames[base.getMonth()]} ${base.getFullYear()}`;
  }, [monthOffset]);

  return (
    <div className="app-page" style={{ padding: '24px 20px 40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
          <FlameIcon streak={stats.currentStreak || 0} />
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#0f172a' }}>Streak</h1>
            <p style={{ margin: '6px 0 0', color: '#64748b' }}>Your consistency journey with Idea Pulse.</p>
          </div>
        </div>
        <Link to="/post-genie" style={{ textDecoration: 'none', background: 'linear-gradient(135deg, #46a29f, #3b8c86)', color: '#fff', borderRadius: 999, padding: '10px 16px', fontWeight: 700 }}>
          Open Idea Pulse
        </Link>
      </div>

      <style>{`
        @keyframes streakFlicker {
          0% { transform: scale(0.95) rotate(-2deg); opacity: 0.95; }
          50% { transform: scale(1.06) rotate(1deg); opacity: 1; }
          100% { transform: scale(0.98) rotate(-1deg); opacity: 0.92; }
        }
        @keyframes streakGlow {
          0% { opacity: 0.45; transform: scale(0.9); }
          100% { opacity: 0.8; transform: scale(1.08); }
        }
      `}</style>

      <div className="row g-3 mb-4">
        <div className="col-12 col-md-6 col-xl-3">
          <StatCard label="Current streak" value={stats.currentStreak || 0} hint="Consecutive active days" />
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <StatCard label="Longest streak" value={stats.longestStreak || 0} hint="Best run so far" />
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <StatCard label="Active days" value={stats.totalActiveDays || 0} hint="Days you used the app" />
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <StatCard label="Last active" value={stats.lastActiveDate ? stats.lastActiveDate : '—'} hint="Most recent activity" />
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 20, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0f172a' }}>Activity history</h2>
            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 13 }}>Your daily activity calendar.</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" onClick={() => setMonthOffset((v) => v - 1)} style={{ border: '1px solid #dbeafe', background: '#fff', borderRadius: 999, padding: '8px 10px', cursor: 'pointer' }} aria-label="Previous month">←</button>
            <button type="button" onClick={() => setMonthOffset(0)} style={{ border: '1px solid #dbeafe', background: '#fff', borderRadius: 999, padding: '8px 10px', cursor: 'pointer' }}>Today</button>
            <button type="button" onClick={() => setMonthOffset((v) => v + 1)} style={{ border: '1px solid #dbeafe', background: '#fff', borderRadius: 999, padding: '8px 10px', cursor: 'pointer' }} aria-label="Next month">→</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 8, marginBottom: 10 }}>
          {weekdayLabels.map((label) => (
            <div key={label} style={{ textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>{label}</div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 8 }}>
          {calendarCells.map((cell, index) => (
            <div key={`${cell?.iso || index}-${index}`} style={{ minHeight: 42, borderRadius: 10, border: '1px solid #f1f5f9', background: cell ? (cell.active ? '#46a29f' : '#f8fafc') : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: cell?.active ? '#fff' : '#64748b', fontWeight: 700, fontSize: 13 }}>
              {cell ? cell.date.getDate() : ''}
            </div>
          ))}
        </div>

        <p style={{ margin: '14px 0 0', color: '#64748b', fontSize: 13 }}>Green days show activity. Keep the streak alive by visiting Idea Pulse each day.</p>
      </div>
    </div>
  );
}
