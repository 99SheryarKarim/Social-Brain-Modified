// models/ScheduledPost.js - SQLite version
const db = require('../../database/init');

const ScheduledPost = {
  /**
   * Create a new scheduled post
   */
  create(userId, content, scheduledTime, platform = 'facebook', media = []) {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO posts (user_id, content, scheduled_at, platform)
        VALUES (?, ?, ?, ?)
      `;
      db.run(sql, [userId, content, scheduledTime, platform], function(err) {
        if (err) reject(new Error(`Failed to create scheduled post: ${err.message}`));
        else ScheduledPost.findById(this.lastID).then(resolve).catch(reject);
      });
    });
  },

  /**
   * Find scheduled post by ID
   */
  findById(id) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT id, user_id as userId, content, scheduled_at as scheduledTime, 
               platform, posted_to_facebook as postedToFacebook, 
               facebook_post_id as facebookPostId, created_at as createdAt
        FROM posts WHERE id = ?
      `;
      db.get(sql, [id], (err, row) => {
        if (err) reject(new Error(`Failed to find scheduled post: ${err.message}`));
        else resolve(row || null);
      });
    });
  },

  /**
   * Get all scheduled posts for a user
   */
  findByUserId(userId) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT id, user_id as userId, content, scheduled_at as scheduledTime,
               platform, posted_to_facebook as postedToFacebook,
               facebook_post_id as facebookPostId, created_at as createdAt
        FROM posts WHERE user_id = ? AND scheduled_at IS NOT NULL
        ORDER BY scheduled_at DESC
      `;
      db.all(sql, [userId], (err, rows) => {
        if (err) reject(new Error(`Failed to fetch scheduled posts: ${err.message}`));
        else resolve(rows || []);
      });
    });
  },

  /**
   * Update scheduled post
   */
  update(postId, updates) {
    return new Promise((resolve, reject) => {
      const allowedFields = ['content', 'scheduled_at', 'platform', 'posted_to_facebook', 'facebook_post_id'];
      const fields = [];
      const values = [];

      Object.keys(updates).forEach(key => {
        if (allowedFields.includes(key)) {
          fields.push(`${key} = ?`);
          values.push(updates[key]);
        }
      });

      if (fields.length === 0) {
        resolve(null);
        return;
      }

      values.push(postId);
      const sql = `UPDATE posts SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
      
      db.run(sql, values, (err) => {
        if (err) reject(new Error(`Failed to update scheduled post: ${err.message}`));
        else ScheduledPost.findById(postId).then(resolve).catch(reject);
      });
    });
  },

  /**
   * Delete scheduled post
   */
  delete(postId) {
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM posts WHERE id = ?';
      db.run(sql, [postId], function(err) {
        if (err) reject(new Error(`Failed to delete scheduled post: ${err.message}`));
        else resolve({ deletedId: postId });
      });
    });
  },
};

module.exports = ScheduledPost;
