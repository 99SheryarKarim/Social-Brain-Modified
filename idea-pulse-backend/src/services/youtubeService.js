const { google } = require('googleapis');
const fs = require('fs');
const db = require('../../database/init');

const SCOPES = [
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/userinfo.profile',
];

function createOAuthClient() {
  const clientId = process.env.YOUTUBE_CLIENT_ID;
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;
  const callbackUrl = process.env.YOUTUBE_CALLBACK_URL;
  if (!clientId || !clientSecret || !callbackUrl) {
    throw new Error('YouTube OAuth environment variables are not configured');
  }
  return new google.auth.OAuth2(clientId, clientSecret, callbackUrl);
}

function getAuthorizationUrl(state) {
  return createOAuthClient().generateAuthUrl({ access_type: 'offline', prompt: 'consent', scope: SCOPES, state });
}

function getUserCredentials(userId) {
  return new Promise((resolve, reject) => db.get(`
    SELECT youtube_access_token, youtube_refresh_token, youtube_channel_id, youtube_channel_title, youtube_token
    FROM users WHERE id = ?
  `, [userId], (error, row) => {
    if (error) return reject(error);
    if (!row) return reject(new Error('User not found'));
    let legacy = {};
    try { legacy = row.youtube_token ? JSON.parse(row.youtube_token) : {}; } catch { legacy = {}; }
    resolve({
      accessToken: row.youtube_access_token || legacy.accessToken,
      refreshToken: row.youtube_refresh_token || legacy.refreshToken,
      channelId: row.youtube_channel_id || legacy.channelId,
      channelTitle: row.youtube_channel_title || legacy.channelName,
    });
  }));
}

async function getYouTubeClient(userId) {
  const credentials = await getUserCredentials(userId);
  if (!credentials.refreshToken && !credentials.accessToken) throw new Error('YouTube is not connected');
  const oauth2Client = createOAuthClient();
  oauth2Client.setCredentials({ access_token: credentials.accessToken, refresh_token: credentials.refreshToken });
  oauth2Client.on('tokens', (tokens) => {
    db.run(`UPDATE users SET youtube_access_token = ?, youtube_refresh_token = COALESCE(?, youtube_refresh_token), updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [tokens.access_token || credentials.accessToken, tokens.refresh_token || null, userId]);
  });
  return google.youtube({ version: 'v3', auth: oauth2Client });
}

async function connectUser(userId, code) {
  const oauth2Client = createOAuthClient();
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
  const response = await youtube.channels.list({ part: ['snippet', 'statistics'], mine: true });
  const channel = response.data.items?.[0];
  if (!channel) throw new Error('No YouTube channel was found for this Google account');
  await new Promise((resolve, reject) => db.run(`
    UPDATE users SET youtube_access_token = ?, youtube_refresh_token = COALESCE(?, youtube_refresh_token),
      youtube_channel_id = ?, youtube_channel_title = ?, youtube_connected_at = CURRENT_TIMESTAMP,
      youtube_token = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
  `, [tokens.access_token, tokens.refresh_token || null, channel.id, channel.snippet?.title || '',
    JSON.stringify({ accessToken: tokens.access_token, refreshToken: tokens.refresh_token, channelId: channel.id, channelName: channel.snippet?.title || '' }), userId],
  (error) => error ? reject(error) : resolve()));
  return { channelId: channel.id, channelTitle: channel.snippet?.title || '', tokens };
}

async function uploadVideo(userId, file, { title, description = '', privacyStatus = 'private', tags = [] }) {
  if (!file) throw new Error('A video file is required');
  const youtube = await getYouTubeClient(userId);
  const response = await youtube.videos.insert({
    part: ['snippet', 'status'],
    requestBody: { snippet: { title: title || file.originalname, description, tags }, status: { privacyStatus } },
    media: { body: fs.createReadStream(file.path) },
  });
  return response.data;
}

async function getChannelStats(userId) {
  const youtube = await getYouTubeClient(userId);
  const response = await youtube.channels.list({ part: ['snippet', 'statistics'], mine: true });
  const channel = response.data.items?.[0];
  return channel ? { channelId: channel.id, title: channel.snippet?.title, statistics: channel.statistics } : null;
}

module.exports = { SCOPES, getAuthorizationUrl, connectUser, getYouTubeClient, uploadVideo, getChannelStats };