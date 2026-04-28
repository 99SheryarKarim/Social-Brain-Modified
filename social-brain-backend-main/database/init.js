const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Get database path from env or use default
const dbPath = process.env.DB_PATH || path.join(__dirname, 'socialbrain.db');

// Ensure database directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Create/open database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
    process.exit(1);
  }
  console.log('✓ Database connection opened at:', dbPath);
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Initialize schema
function initializeDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Users table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          facebook_token TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('Error creating users table:', err);
          reject(err);
        }
      });

      // Posts table
      db.run(`
        CREATE TABLE IF NOT EXISTS posts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          content TEXT NOT NULL,
          tone TEXT,
          hashtags TEXT,
          image_prompt TEXT,
          original_topic TEXT,
          posted_to_facebook INTEGER DEFAULT 0,
          facebook_post_id TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `, (err) => {
        if (err) {
          console.error('Error creating posts table:', err);
          reject(err);
        }
      });

      // Activity table
      db.run(`
        CREATE TABLE IF NOT EXISTS activity (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          type TEXT NOT NULL,
          description TEXT NOT NULL,
          meta TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `, (err) => {
        if (err) console.error('Error creating activity table:', err);
      });

      db.run(`CREATE INDEX IF NOT EXISTS idx_activity_user_id ON activity(user_id)`, (err) => {
        if (err) console.error('Error creating activity index:', err);
      });

      // OTP table
      db.run(`
        CREATE TABLE IF NOT EXISTS otps (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT NOT NULL,
          otp TEXT NOT NULL,
          expires_at DATETIME NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) console.error('Error creating otps table:', err);
      });

      // Create indexes
      db.run(`CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id)`, (err) => {
        if (err) console.error('Error creating index:', err);
      });

      db.run(`CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at)`, (err) => {
        if (err) console.error('Error creating index:', err);
      });

      // Test connection
      db.get('SELECT 1', (err) => {
        if (err) {
          console.error('Error testing connection:', err);
          reject(err);
        } else {
          console.log('✓ Database initialized successfully');
          resolve();
        }
      });
    });
  });
}

// Initialize on load
initializeDatabase().catch((err) => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

module.exports = db;

