const db = require('../init');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS trends (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic TEXT NOT NULL,
    niche TEXT NOT NULL,
    source TEXT NOT NULL,
    popularity_score REAL DEFAULT 0,
    fetched_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  db.run('ALTER TABLE posts ADD COLUMN recommended_time_basis TEXT', (error) => {
    if (error && !error.message.includes('duplicate column')) console.warn('Migration warning:', error.message);
  });
  db.run('ALTER TABLE posts ADD COLUMN posted_at DATETIME', (error) => {
    if (error && !error.message.includes('duplicate column')) console.warn('Migration warning:', error.message);
  });
});

module.exports = db;