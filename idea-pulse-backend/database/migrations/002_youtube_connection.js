const db = require('../init');

db.run('ALTER TABLE users ADD COLUMN youtube_token TEXT', (error) => {
  if (error && !error.message.includes('duplicate column')) {
    console.warn('Migration warning:', error.message);
  }
});

[
  'youtube_access_token TEXT', 'youtube_refresh_token TEXT', 'youtube_channel_id TEXT',
  'youtube_channel_title TEXT', 'youtube_connected_at DATETIME',
].forEach((column) => db.run(`ALTER TABLE users ADD COLUMN ${column}`, (error) => {
  if (error && !error.message.includes('duplicate column')) console.warn('Migration warning:', error.message);
}));

module.exports = db;
