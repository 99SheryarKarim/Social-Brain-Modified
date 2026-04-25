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


// Call the connectDB function to connect MongoDB
connectDB();

module.exports = app;
