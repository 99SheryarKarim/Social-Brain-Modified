const db = require('../../database/init');
const bcrypt = require('bcryptjs');

/**
 * User Database Operations
 */
const User = {
  /**
   * Create a new user
   */
  create(email, passwordHash, facebookToken = null) {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO users (email, password_hash, facebook_token)
        VALUES (?, ?, ?)
      `;
      db.run(sql, [email, passwordHash, facebookToken], function(err) {
        if (err) reject(new Error(`Failed to create user: ${err.message}`));
        else User.findById(this.lastID).then(resolve).catch(reject);
      });
    });
  },

  /**
   * Find user by ID
   */
  findById(id) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT id, email, facebook_token, created_at, updated_at
        FROM users WHERE id = ?
      `;
      db.get(sql, [id], (err, row) => {
        if (err) reject(new Error(`Failed to find user: ${err.message}`));
        else resolve(row || null);
      });
    });
  },

  /**
   * Find user by email
   */
  findByEmail(email) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM users WHERE email = ?`;
      db.get(sql, [email], (err, row) => {
        if (err) reject(new Error(`Failed to find user: ${err.message}`));
        else resolve(row || null);
      });
    });
  },

  /**
   * Verify user password
   */
  verifyPassword(email, password) {
    return new Promise((resolve, reject) => {
      User.findByEmail(email)
        .then((user) => {
          if (!user) {
            resolve(null);
          } else {
            const sql = `SELECT password_hash FROM users WHERE email = ?`;
            db.get(sql, [email], (err, row) => {
              if (err) {
                reject(new Error(`Failed to verify password: ${err.message}`));
              } else if (row && bcrypt.compareSync(password, row.password_hash)) {
                resolve(user);
              } else {
                resolve(null);
              }
            });
          }
        })
        .catch(reject);
    });
  },

  /**
   * Update user Facebook token
   */
  updateFacebookToken(userId, facebookToken) {
    return new Promise((resolve, reject) => {
      const sql = `
        UPDATE users SET facebook_token = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      db.run(sql, [facebookToken, userId], (err) => {
        if (err) reject(new Error(`Failed to update Facebook token: ${err.message}`));
        else User.findById(userId).then(resolve).catch(reject);
      });
    });
  },

  /**
   * Delete user
   */
  delete(userId) {
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM users WHERE id = ?';
      db.run(sql, [userId], function(err) {
        if (err) reject(new Error(`Failed to delete user: ${err.message}`));
        else resolve(this.changes > 0);
      });
    });
  },
};

/**
 * Post Database Operations
 */
const Post = {
  /**
   * Create a new post
   */
  create(userId, content, tone, postedToFacebook = false, facebookPostId = null) {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO posts (user_id, content, tone, posted_to_facebook, facebook_post_id)
        VALUES (?, ?, ?, ?, ?)
      `;
      db.run(sql, [userId, content, tone, postedToFacebook ? 1 : 0, facebookPostId], function(err) {
        if (err) reject(new Error(`Failed to create post: ${err.message}`));
        else Post.findById(this.lastID).then(resolve).catch(reject);
      });
    });
  },

  /**
   * Find post by ID
   */
  findById(id) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT id, user_id, content, tone, posted_to_facebook, facebook_post_id, 
               created_at, updated_at
        FROM posts WHERE id = ?
      `;
      db.get(sql, [id], (err, row) => {
        if (err) reject(new Error(`Failed to find post: ${err.message}`));
        else {
          if (row) row.posted_to_facebook = Boolean(row.posted_to_facebook);
          resolve(row || null);
        }
      });
    });
  },

  /**
   * Find all posts by user ID
   */
  findByUserId(userId, limit = 50, offset = 0) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT id, user_id, content, tone, posted_to_facebook, facebook_post_id, 
               created_at, updated_at
        FROM posts 
        WHERE user_id = ? 
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `;
      db.all(sql, [userId, limit, offset], (err, rows) => {
        if (err) reject(new Error(`Failed to find posts: ${err.message}`));
        else {
          const posts = rows || [];
          resolve(posts.map((post) => ({
            ...post,
            posted_to_facebook: Boolean(post.posted_to_facebook),
          })));
        }
      });
    });
  },

  /**
   * Update post
   */
  update(postId, updates) {
    return new Promise((resolve, reject) => {
      const allowedFields = ['content', 'tone', 'posted_to_facebook', 'facebook_post_id'];
      const updateFields = [];
      const values = [];

      for (const [key, value] of Object.entries(updates)) {
        if (allowedFields.includes(key)) {
          updateFields.push(`${key} = ?`);
          values.push(key === 'posted_to_facebook' ? (value ? 1 : 0) : value);
        }
      }

      if (updateFields.length === 0) {
        Post.findById(postId).then(resolve).catch(reject);
      } else {
        values.push(postId);
        const query = `
          UPDATE posts 
          SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `;
        db.run(query, values, (err) => {
          if (err) reject(new Error(`Failed to update post: ${err.message}`));
          else Post.findById(postId).then(resolve).catch(reject);
        });
      }
    });
  },

  /**
   * Delete post
   */
  delete(postId) {
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM posts WHERE id = ?';
      db.run(sql, [postId], function(err) {
        if (err) reject(new Error(`Failed to delete post: ${err.message}`));
        else resolve(this.changes > 0);
      });
    });
  },

  /**
   * Count posts by user
   */
  countByUserId(userId) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT COUNT(*) as count FROM posts WHERE user_id = ?';
      db.get(sql, [userId], (err, result) => {
        if (err) reject(new Error(`Failed to count posts: ${err.message}`));
        else resolve(result?.count || 0);
      });
    });
  },

  /**
   * Get statistics for a user
   */
  getStats(userId) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          COUNT(*) as total_posts,
          SUM(CASE WHEN posted_to_facebook = 1 THEN 1 ELSE 0 END) as posted_to_facebook
        FROM posts 
        WHERE user_id = ?
      `;
      db.get(sql, [userId], (err, result) => {
        if (err) reject(new Error(`Failed to get stats: ${err.message}`));
        else {
          resolve({
            totalPosts: result?.total_posts || 0,
            postedToFacebook: result?.posted_to_facebook || 0,
          });
        }
      });
    });
  },
};

module.exports = {
  User,
  Post,
};

