const jwt = require('jsonwebtoken');
const db = require('../../database/init');
const { logActivity } = require('../utils/activityLogger');
const youtubeService = require('../services/youtubeService');

function signState(userId) {
  return jwt.sign({ id: userId, provider: 'youtube' }, process.env.JWT_SECRET, { expiresIn: '10m' });
}

exports.getAuthorizationUrl = (req, res) => {
  try { res.json({ authUrl: youtubeService.getAuthorizationUrl(signState(req.user.id)) }); }
  catch (error) { res.status(503).json({ message: error.message }); }
};

exports.handleCallback = async (req, res) => {
  try {
    const state = jwt.verify(req.query.state, process.env.JWT_SECRET);
    if (state.provider !== 'youtube' || !state.id || !req.query.code) throw new Error('Invalid YouTube OAuth callback');
    const result = await youtubeService.connectUser(state.id, req.query.code);
    await logActivity(state.id, 'youtube_connected', `Connected YouTube channel "${result.channelTitle}"`, { channelId: result.channelId });
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/#/connect?status=youtube_success`);
  } catch (error) {
    console.error('YouTube OAuth callback failed:', error.message);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/#/connect?status=youtube_failed`);
  }
};

exports.getStatus = (req, res) => {
  db.get(`SELECT youtube_access_token, youtube_channel_id, youtube_channel_title, youtube_connected_at, youtube_token FROM users WHERE id = ?`, [req.user.id], (error, row) => {
    if (error) return res.status(500).json({ message: error.message });
    let legacy = {};
    try { legacy = row?.youtube_token ? JSON.parse(row.youtube_token) : {}; } catch { legacy = {}; }
    const channelId = row?.youtube_channel_id || legacy.channelId;
    if (!row?.youtube_access_token && !legacy.accessToken) return res.json({ connected: false });
    res.json({ connected: true, channelId, channelTitle: row.youtube_channel_title || legacy.channelName, channelName: row.youtube_channel_title || legacy.channelName, connectedAt: row.youtube_connected_at });
  });
};

exports.disconnect = (req, res) => {
  db.run(`UPDATE users SET youtube_token = NULL, youtube_access_token = NULL, youtube_refresh_token = NULL,
    youtube_channel_id = NULL, youtube_channel_title = NULL, youtube_connected_at = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [req.user.id], async (error) => {
    if (error) return res.status(500).json({ message: error.message });
    await logActivity(req.user.id, 'youtube_disconnected', 'Disconnected YouTube');
    res.json({ message: 'YouTube disconnected' });
  });
};

exports.upload = async (req, res) => {
  try {
    const data = await youtubeService.uploadVideo(req.user.id, req.file, req.body);
    await logActivity(req.user.id, 'youtube_video_uploaded', `Uploaded YouTube video "${req.body.title || req.file?.originalname || 'video'}"`, { videoId: data.id });
    res.status(201).json({ video: data });
  } catch (error) { res.status(400).json({ message: error.message }); }
};

exports.stats = async (req, res) => {
  try { res.json(await youtubeService.getChannelStats(req.user.id)); }
  catch (error) { res.status(400).json({ message: error.message }); }
};
