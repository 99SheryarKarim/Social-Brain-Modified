const db = require('../../database/init');
const { rankHistoricalRows } = require('../utils/postTimeUtils');

const DEFAULTS = {
  linkedin: { recommendedTime: 'Tuesday at 09:00', confidence: 0.55 },
  instagram: { recommendedTime: 'Wednesday at 18:00', confidence: 0.5 },
  facebook: { recommendedTime: 'Wednesday at 18:00', confidence: 0.5 },
  youtube: { recommendedTime: 'Saturday at 18:00', confidence: 0.5 },
  twitter: { recommendedTime: 'Tuesday at 09:00', confidence: 0.5 },
  'x / twitter': { recommendedTime: 'Tuesday at 09:00', confidence: 0.5 },
};

function getHistoricalBestTime(userId, platform) {
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT CAST(strftime('%w', COALESCE(posted_at, created_at)) AS INTEGER) AS day_of_week,
             CAST(strftime('%H', COALESCE(posted_at, created_at)) AS INTEGER) AS hour,
             COUNT(*) AS post_count,
             COALESCE(SUM(likes), 0) + COALESCE(SUM(comments), 0) + COALESCE(SUM(shares), 0) AS engagement
      FROM posts
      WHERE user_id = ? AND posted_to_facebook = 1 AND LOWER(COALESCE(platform, 'facebook')) = LOWER(?)
      GROUP BY day_of_week, hour
      ORDER BY engagement DESC, post_count DESC
    `, [userId, platform], (error, rows) => error ? reject(error) : resolve(rows || []));
  });
}

async function getRecommendedTime(userId, platform = 'facebook') {
  const rows = await getHistoricalBestTime(userId, platform);
  if (rows.length < 1 || rows.reduce((total, row) => total + row.post_count, 0) < 10) {
    return { ...((DEFAULTS[String(platform).toLowerCase()] || DEFAULTS.facebook)), basis: 'default' };
  }
  const best = rankHistoricalRows(rows)[0];
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const hour = String(best.hour).padStart(2, '0');
  const confidence = Math.min(0.99, 0.5 + (best.engagement / Math.max(1, rows.reduce((sum, row) => sum + row.engagement, 0))) / 2);
  return { recommendedTime: `${dayNames[best.day_of_week]} at ${hour}:00`, basis: 'historical', confidence: Number(confidence.toFixed(2)) };
}

module.exports = { getHistoricalBestTime, getRecommendedTime, DEFAULTS, rankHistoricalRows };