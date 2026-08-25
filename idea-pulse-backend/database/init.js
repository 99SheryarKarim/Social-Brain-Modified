const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Get database path from env or use default
const dbPath = process.env.DB_PATH || path.join(__dirname, 'ideapulse.db');

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
      `, (err) => { if (err) { console.error('Error creating users table:', err); reject(err); } });

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
          recommended_time_basis TEXT,
          posted_at DATETIME,
          scheduled_at DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `, (err) => { if (err) { console.error('Error creating posts table:', err); reject(err); } });

      // Migrate existing posts table — add missing columns if they don't exist
      const migrations = [
        `ALTER TABLE posts ADD COLUMN hashtags TEXT`,
        `ALTER TABLE posts ADD COLUMN image_prompt TEXT`,
        `ALTER TABLE posts ADD COLUMN original_topic TEXT`,
        `ALTER TABLE posts ADD COLUMN scheduled_at DATETIME`,
        `ALTER TABLE posts ADD COLUMN likes INTEGER DEFAULT 0`,
        `ALTER TABLE posts ADD COLUMN comments INTEGER DEFAULT 0`,
        `ALTER TABLE posts ADD COLUMN shares INTEGER DEFAULT 0`,
        `ALTER TABLE posts ADD COLUMN reach INTEGER DEFAULT 0`,
        `ALTER TABLE posts ADD COLUMN engagement_updated_at DATETIME`,
        `ALTER TABLE posts ADD COLUMN platform TEXT DEFAULT 'facebook'`,
        `ALTER TABLE posts ADD COLUMN recommended_time_basis TEXT`,
        `ALTER TABLE posts ADD COLUMN posted_at DATETIME`,
        `ALTER TABLE users ADD COLUMN plan TEXT DEFAULT 'free'`,
        `ALTER TABLE users ADD COLUMN daily_usage INTEGER DEFAULT 0`,
        `ALTER TABLE users ADD COLUMN usage_reset_at TEXT`,
        `ALTER TABLE users ADD COLUMN stripe_customer_id TEXT`,
        `ALTER TABLE users ADD COLUMN stripe_subscription_id TEXT`,
        `ALTER TABLE users ADD COLUMN username TEXT`,
      ];
      migrations.forEach(sql => {
        db.run(sql, (err) => {
          if (err && !err.message.includes('duplicate column')) {
            console.warn('Migration warning:', err.message);
          }
        });
      });

      db.run(`CREATE TABLE IF NOT EXISTS trends (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        topic TEXT NOT NULL,
        niche TEXT NOT NULL,
        source TEXT NOT NULL,
        popularity_score REAL DEFAULT 0,
        fetched_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`, (err) => { if (err) console.error('Error creating trends table:', err); });

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

      // Settings table
      db.run(`
        CREATE TABLE IF NOT EXISTS settings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER UNIQUE NOT NULL,
          brand_description TEXT DEFAULT '',
          target_audience TEXT DEFAULT '',
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `, (err) => {
        if (err) console.error('Error creating settings table:', err);
      });

      // Friendships table
      db.run(`
        CREATE TABLE IF NOT EXISTS friendships (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          friend_id INTEGER NOT NULL,
          status TEXT DEFAULT 'pending',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, friend_id),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `, (err) => {
        if (err) console.error('Error creating friendships table:', err);
      });

      // Notifications table
      db.run(`
        CREATE TABLE IF NOT EXISTS notifications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          type TEXT NOT NULL,
          content TEXT NOT NULL,
          link TEXT,
          is_read INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `, (err) => {
        if (err) console.error('Error creating notifications table:', err);
      });

      // Messages table
      db.run(`
        CREATE TABLE IF NOT EXISTS messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          sender_id INTEGER NOT NULL,
          receiver_id INTEGER NOT NULL,
          content TEXT NOT NULL,
          type TEXT DEFAULT 'text',
          content_id INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `, (err) => {
        if (err) console.error('Error creating messages table:', err);
      });

      // Streaks table
      db.run(`
        CREATE TABLE IF NOT EXISTS streaks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_a INTEGER NOT NULL,
          user_b INTEGER NOT NULL,
          count INTEGER DEFAULT 0,
          last_activity_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_a, user_b),
          FOREIGN KEY (user_a) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (user_b) REFERENCES users(id) ON DELETE CASCADE
        )
      `, (err) => {
        if (err) console.error('Error creating streaks table:', err);
      });

      // Create indexes
      db.run(`CREATE INDEX IF NOT EXISTS idx_friendships_user_id ON friendships(user_id)`, (err) => {
        if (err) console.error('Error creating index:', err);
      });
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

