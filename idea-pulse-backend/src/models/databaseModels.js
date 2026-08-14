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
      db.run(sql, [userId], (err) => {
        if (err) reject(new Error(`Failed to delete user: ${err.message}`));
        else resolve(true);
      });
    });
  },

  /**
   * Search users by username or email
   */
  search(query, currentUserId) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT id, email, username FROM users 
        WHERE (username LIKE ? OR email LIKE ?) AND id != ?
        LIMIT 20
      `;
      const searchPattern = `%${query}%`;
      db.all(sql, [searchPattern, searchPattern, currentUserId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  listAll(currentUserId) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT id, email, username, created_at FROM users
        WHERE id != ?
        ORDER BY created_at DESC
      `;
      db.all(sql, [currentUserId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }
};

/**
 * Post Database Operations
 */
const Post = {
  /**
   * Create a new post
   */
  create(userId, content, tone, hashtags = '', imagePrompt = '', originalTopic = '', postedToFacebook = false, facebookPostId = null) {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO posts (user_id, content, tone, hashtags, image_prompt, original_topic, posted_to_facebook, facebook_post_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      db.run(sql, [userId, content, tone, hashtags, imagePrompt, originalTopic, postedToFacebook ? 1 : 0, facebookPostId], function(err) {
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
        SELECT id, user_id, content, tone, hashtags, image_prompt, original_topic,
               posted_to_facebook, facebook_post_id, scheduled_at, created_at, updated_at
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
  findByUserId(userId, limit = 100, offset = 0) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT id, user_id, content, tone, hashtags, image_prompt, original_topic,
               posted_to_facebook, facebook_post_id, scheduled_at, created_at, updated_at
        FROM posts 
        WHERE user_id = ? 
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `;
      db.all(sql, [userId, limit, offset], (err, rows) => {
        if (err) reject(new Error(`Failed to find posts: ${err.message}`));
        else {
          resolve((rows || []).map((post) => ({
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

/**
 * Friendship Database Operations
 */
const Friendship = {
  /**
   * Send friend request
   */
  request(userId, friendId) {
    return new Promise((resolve, reject) => {
      Friendship.getStatus(userId, friendId).then((status) => {
        if (status) return reject(new Error(status === 'accepted' ? 'Already friends' : 'Request already sent'));
        const sql = `INSERT INTO friendships (user_id, friend_id, status) VALUES (?, ?, 'pending')`;
        db.run(sql, [userId, friendId], function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        });
      }).catch(reject);
    });
  },

  /**
   * Accept friend request
   */
  accept(userId, friendId) {
    return new Promise((resolve, reject) => {
      const sql = `UPDATE friendships SET status = 'accepted', updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND friend_id = ? AND status = 'pending'`;
      db.run(sql, [friendId, userId], function(err) {
        if (err) reject(err);
        else resolve(this.changes > 0);
      });
    });
  },

  reject(userId, friendId) {
    return new Promise((resolve, reject) => {
      const sql = `DELETE FROM friendships WHERE user_id = ? AND friend_id = ? AND status = 'pending'`;
      db.run(sql, [friendId, userId], function(err) {
        if (err) reject(err);
        else resolve(this.changes > 0);
      });
    });
  },

  /**
   * Get friend list
   */
  getFriends(userId) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT u.id, u.email, u.username, f.status, f.created_at
        FROM users u
        JOIN friendships f ON (u.id = f.friend_id OR u.id = f.user_id)
        WHERE (f.user_id = ? OR f.friend_id = ?) AND u.id != ? AND f.status = 'accepted'
      `;
      db.all(sql, [userId, userId, userId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  /**
   * Get pending requests for user
   */
  getPendingRequests(userId) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT u.id, u.email, u.username, f.created_at
        FROM users u
        JOIN friendships f ON u.id = f.user_id
        WHERE f.friend_id = ? AND f.status = 'pending'
      `;
      db.all(sql, [userId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  /**
   * Check friendship status
   */
  getStatus(userId, friendId) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT status FROM friendships WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)`;
      db.get(sql, [userId, friendId, friendId, userId], (err, row) => {
        if (err) reject(err);
        else resolve(row ? row.status : null);
      });
    });
  }
};

/**
 * Notification Database Operations
 */
const Notification = {
  create(userId, type, content, link = null) {
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO notifications (user_id, type, content, link) VALUES (?, ?, ?, ?)`;
      db.run(sql, [userId, type, content, link], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  },

  getByUser(userId) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`;
      db.all(sql, [userId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  markAsRead(id) {
    return new Promise((resolve, reject) => {
      const sql = `UPDATE notifications SET is_read = 1 WHERE id = ?`;
      db.run(sql, [id], (err) => {
        if (err) reject(err);
        else resolve(true);
      });
    });
  },

  markAllAsRead(userId) {
    return new Promise((resolve, reject) => {
      const sql = `UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0`;
      db.run(sql, [userId], (err) => {
        if (err) reject(err);
        else resolve(true);
      });
    });
  },

  getUnreadCount(userId) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0`;
      db.get(sql, [userId], (err, row) => {
        if (err) reject(err);
        else resolve(row?.count || 0);
      });
    });
  }
};

/**
 * Message Database Operations
 */
const Message = {
  send(senderId, receiverId, content, type = 'idea') {
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO messages (sender_id, receiver_id, content, type) VALUES (?, ?, ?, ?)`;
      db.run(sql, [senderId, receiverId, content, type], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  },

  getConversation(userA, userB) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT m.*, u.email as sender_email, u.username as sender_username
        FROM messages m
        JOIN users u ON u.id = m.sender_id
        WHERE (m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?)
        ORDER BY m.created_at ASC
        LIMIT 100
      `;
      db.all(sql, [userA, userB, userB, userA], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  },

  getInbox(userId) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT m.*, u.email as sender_email, u.username as sender_username
        FROM messages m
        JOIN users u ON u.id = m.sender_id
        WHERE m.id IN (
          SELECT MAX(id) FROM messages
          WHERE receiver_id = ?
          GROUP BY sender_id
        )
        ORDER BY m.created_at DESC
      `;
      db.all(sql, [userId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }
};

/**
 * Streak Database Operations
 */
const Streak = {
  /**
   * Update or create streak
   */
  update(userA, userB) {
    const sorted = [userA, userB].sort();
    const uA = sorted[0];
    const uB = sorted[1];
    return new Promise((resolve, reject) => {
      // Check if streak exists
      const checkSql = `SELECT * FROM streaks WHERE user_a = ? AND user_b = ?`;
      db.get(checkSql, [uA, uB], (err, streak) => {
        if (err) return reject(err);
        
        if (!streak) {
          const insertSql = `INSERT INTO streaks (user_a, user_b, count, last_activity_at) VALUES (?, ?, 1, CURRENT_TIMESTAMP)`;
          db.run(insertSql, [uA, uB], function(err) {
            if (err) reject(err);
            else resolve({ count: 1 });
          });
        } else {
          // Check if last activity was today or yesterday
          const lastDate = new Date(streak.last_activity_at);
          const now = new Date();
          const diffInHours = (now - lastDate) / (1000 * 60 * 60);
          
          let newCount = streak.count;
          if (diffInHours < 24) {
            // Activity already happened today, don't increment but update timestamp
          } else if (diffInHours < 48) {
            newCount += 1;
          } else {
            newCount = 1;
          }
          
          const updateSql = `UPDATE streaks SET count = ?, last_activity_at = CURRENT_TIMESTAMP WHERE id = ?`;
          db.run(updateSql, [newCount, streak.id], (err) => {
            if (err) reject(err);
            else resolve({ count: newCount });
          });
        }
      });
    });
  },

  get(userA, userB) {
    const sorted = [userA, userB].sort();
    return new Promise((resolve, reject) => {
      db.get(`SELECT count FROM streaks WHERE user_a = ? AND user_b = ?`, [sorted[0], sorted[1]], (err, row) => {
        if (err) reject(err);
        else resolve(row ? row.count : 0);
      });
    });
  }
};

module.exports = { User, Post, Friendship, Notification, Streak, Message };

