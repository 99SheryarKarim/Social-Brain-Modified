const db = require('../../database/init');

function logActivity(userId, type, description, meta = null) {
  if (!userId) return Promise.resolve();
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO activity (user_id, type, description, meta) VALUES (?, ?, ?, ?)`,
      [userId, type, description, meta ? JSON.stringify(meta) : null],
      (err) => (err ? reject(err) : resolve())
    );
  });
}

module.exports = { logActivity };
