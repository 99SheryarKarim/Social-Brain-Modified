// SQLite database initialization
// The database is initialized when we require the database/init.js file
const db = require('../database/init');
require("dotenv").config();

const connectDB = () => {
  try {
    // Database is already initialized in database/init.js
    // Just verify the connection works
    const result = db.prepare('SELECT 1 as test').get();
    if (result) {
      console.log("✅ Connected to SQLite database");
    }
  } catch (err) {
    console.error("❌ SQLite connection error:", err);
    process.exit(1);
  }
};

module.exports = connectDB;

