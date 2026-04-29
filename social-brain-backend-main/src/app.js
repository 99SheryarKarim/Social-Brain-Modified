// Load environment variables FIRST before any other requires
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const passport = require("./config/googleAuth");
const connectDB = require("./db");

// route imprts
const authRoutes = require("./routes/authRoutes");
const postRoutes = require('./routes/postRoutes');
const activityRoutes = require('./routes/activityRoutes');
const facebookRoutes = require('./routes/facebookRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const authMiddleware = require('./middlewares/auth');
const { generateIdeas, generatePostsWithMedia } = require('./controllers/aiGenerationController');
const app = express();
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"], // Vite default ports
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());
app.use(passport.initialize());

// AI Generation Routes (no authentication required)
app.post('/generate_ideas', generateIdeas);
app.post('/generate_posts_with_media', generatePostsWithMedia);

//  routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', authMiddleware, postRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/facebook', facebookRoutes);
app.use('/api/settings', settingsRoutes);

// Post library — fetch all saved posts for logged-in user
app.get('/api/library', authMiddleware, async (req, res) => {
  try {
    const { Post } = require('./models/databaseModels');
    const posts = await Post.findByUserId(req.user.id);
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a post from library
app.delete('/api/library/:id', authMiddleware, async (req, res) => {
  try {
    const { Post } = require('./models/databaseModels');
    await Post.delete(req.params.id);
    res.status(200).json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Schedule a post
app.patch('/api/library/:id/schedule', authMiddleware, (req, res) => {
  const { scheduled_at } = req.body;
  const userId = req.user.id;
  if (!scheduled_at) return res.status(400).json({ message: 'scheduled_at is required' });

  const db = require('../database/init');
  db.run(
    `UPDATE posts SET scheduled_at = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?`,
    [new Date(scheduled_at).toISOString(), req.params.id, userId],
    function (err) {
      if (err) return res.status(500).json({ message: err.message });
      if (this.changes === 0) return res.status(404).json({ message: 'Post not found' });
      res.status(200).json({ message: 'Post scheduled', scheduled_at });
    }
  );
});

// Cancel a scheduled post
app.patch('/api/library/:id/unschedule', authMiddleware, (req, res) => {
  const db = require('../database/init');
  db.run(
    `UPDATE posts SET scheduled_at = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?`,
    [req.params.id, req.user.id],
    function (err) {
      if (err) return res.status(500).json({ message: err.message });
      res.status(200).json({ message: 'Schedule cancelled' });
    }
  );
});

// Dashboard stats
app.get('/api/dashboard', authMiddleware, (req, res) => {
  const db = require('../database/init');
  const userId = req.user.id;
  const stats = {};

  db.get(`SELECT COUNT(*) as total FROM posts WHERE user_id = ?`, [userId], (err, row) => {
    stats.totalPosts = row?.total || 0;
    db.get(`SELECT COUNT(*) as total FROM posts WHERE user_id = ? AND scheduled_at IS NOT NULL AND posted_to_facebook = 0`, [userId], (err, row) => {
      stats.scheduled = row?.total || 0;
      db.get(`SELECT COUNT(*) as total FROM posts WHERE user_id = ? AND posted_to_facebook = 1`, [userId], (err, row) => {
        stats.published = row?.total || 0;
        db.get(`SELECT COUNT(*) as total FROM activity WHERE user_id = ?`, [userId], (err, row) => {
          stats.totalActivities = row?.total || 0;
          db.get(`SELECT COALESCE(SUM(likes),0) as likes, COALESCE(SUM(comments),0) as comments, COALESCE(SUM(shares),0) as shares FROM posts WHERE user_id = ? AND posted_to_facebook = 1`, [userId], (err, row) => {
            stats.totalLikes    = row?.likes    || 0;
            stats.totalComments = row?.comments || 0;
            stats.totalShares   = row?.shares   || 0;
            db.all(`SELECT * FROM activity WHERE user_id = ? ORDER BY created_at DESC LIMIT 5`, [userId], (err, rows) => {
              stats.recentActivity = rows || [];
              res.status(200).json(stats);
            });
          });
        });
      });
    });
  });
});


// Call the connectDB function to connect MongoDB
connectDB();

module.exports = app;
