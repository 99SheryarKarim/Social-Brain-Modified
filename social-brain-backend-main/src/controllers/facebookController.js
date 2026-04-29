const axios = require("axios");
const db = require("../../database/init");

// Save Facebook page access token to user record
exports.saveToken = async (req, res) => {
  const { accessToken, pageId, pageName } = req.body;
  const userId = req.user?.id;

  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  if (!accessToken || !pageId) return res.status(400).json({ message: "accessToken and pageId are required" });

  try {
    // Exchange short-lived user token for long-lived page token (valid ~60 days)
    let longLivedToken = accessToken;
    try {
      const exchangeRes = await axios.get(
        `https://graph.facebook.com/v19.0/oauth/access_token`,
        {
          params: {
            grant_type: 'fb_exchange_token',
            client_id: process.env.FACEBOOK_APP_ID,
            client_secret: process.env.FACEBOOK_APP_SECRET,
            fb_exchange_token: accessToken,
          }
        }
      );
      longLivedToken = exchangeRes.data.access_token;
      console.log('✅ Exchanged for long-lived token');
    } catch (exchangeErr) {
      console.warn('⚠️ Could not exchange token, using original:', exchangeErr.response?.data?.error?.message);
    }

    const tokenData = JSON.stringify({ accessToken: longLivedToken, pageId, pageName });
    db.run(
      `UPDATE users SET facebook_token = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [tokenData, userId],
      (err) => {
        if (err) return res.status(500).json({ message: err.message });
        res.status(200).json({ message: "Facebook page connected successfully" });
      }
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Facebook connection status for logged in user
exports.getStatus = (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  db.get(`SELECT facebook_token FROM users WHERE id = ?`, [userId], (err, row) => {
    if (err) return res.status(500).json({ message: err.message });
    if (!row?.facebook_token) return res.status(200).json({ connected: false });

    try {
      const data = JSON.parse(row.facebook_token);
      res.status(200).json({ connected: true, pageId: data.pageId, pageName: data.pageName });
    } catch {
      res.status(200).json({ connected: false });
    }
  });
};

// Disconnect Facebook
exports.disconnect = (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  db.run(`UPDATE users SET facebook_token = NULL WHERE id = ?`, [userId], (err) => {
    if (err) return res.status(500).json({ message: err.message });
    res.status(200).json({ message: "Facebook disconnected" });
  });
};

// POST /api/facebook/post — publish a post to Facebook using stored token
exports.publishPost = async (req, res) => {
  const userId = req.user?.id;
  const { content, imageUrl, hashtags } = req.body;

  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  if (!content) return res.status(400).json({ message: "content is required" });

  // Get user's stored facebook token
  db.get(`SELECT facebook_token FROM users WHERE id = ?`, [userId], async (err, row) => {
    if (err) return res.status(500).json({ message: err.message });
    if (!row?.facebook_token) {
      return res.status(400).json({ message: "No Facebook page connected. Please connect your Facebook page first." });
    }

    let tokenData;
    try {
      tokenData = JSON.parse(row.facebook_token);
    } catch {
      return res.status(400).json({ message: "Invalid Facebook token. Please reconnect." });
    }

    const { accessToken, pageId } = tokenData;
    const fullMessage = hashtags ? `${content}\n\n${hashtags}` : content;

    try {
      let fbResponse;

      // Try to fetch a Pexels image using the post content as query
      let resolvedImageUrl = imageUrl || null;
      if (!resolvedImageUrl) {
        try {
          const topic = req.body.originalTopic || content.split(' ').slice(0, 4).join(' ');
          const pexelsRes = await axios.get(
            `https://api.pexels.com/v1/search?query=${encodeURIComponent(topic)}&per_page=1`,
            { headers: { Authorization: process.env.PEXELS_API_KEY } }
          );
          resolvedImageUrl = pexelsRes.data?.photos?.[0]?.src?.landscape || null;
        } catch {
          resolvedImageUrl = null;
        }
      }

      if (resolvedImageUrl) {
        fbResponse = await axios.post(
          `https://graph.facebook.com/v19.0/${pageId}/photos`,
          { url: resolvedImageUrl, caption: fullMessage, access_token: accessToken }
        );
      } else {
        fbResponse = await axios.post(
          `https://graph.facebook.com/v19.0/${pageId}/feed`,
          { message: fullMessage, access_token: accessToken }
        );
      }

      // Store full pageId_postId format for engagement fetching later
      const rawId = fbResponse.data.id;
      const fullPostId = rawId.includes('_') ? rawId : `${pageId}_${rawId}`;

      // Update posted_to_facebook flag in DB if post has an id
      if (req.body.postDbId) {
        db.run(`UPDATE posts SET posted_to_facebook = 1, facebook_post_id = ? WHERE id = ?`,
          [fullPostId, req.body.postDbId]);
      }

      res.status(200).json({ success: true, facebookPostId: fullPostId });
    } catch (fbErr) {
      const fbError = fbErr.response?.data?.error;
      res.status(500).json({
        message: fbError?.message || "Failed to post to Facebook",
        code: fbError?.code,
      });
    }
  });
};

// GET /api/facebook/engagement — fetch & sync engagement for all published posts
exports.syncEngagement = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  db.get(`SELECT facebook_token FROM users WHERE id = ?`, [userId], async (err, row) => {
    if (err) return res.status(500).json({ message: err.message });
    if (!row?.facebook_token) return res.status(400).json({ message: 'No Facebook page connected' });

    let tokenData;
    try { tokenData = JSON.parse(row.facebook_token); }
    catch { return res.status(400).json({ message: 'Invalid token. Please reconnect.' }); }

    const { accessToken, pageId } = tokenData;

    // Get all published posts with a facebook_post_id
    db.all(
      `SELECT id, facebook_post_id FROM posts WHERE user_id = ? AND posted_to_facebook = 1 AND facebook_post_id IS NOT NULL`,
      [userId],
      async (err, posts) => {
        if (err) return res.status(500).json({ message: err.message });
        if (!posts?.length) return res.status(200).json({ message: 'No published posts to sync', synced: 0 });

        const results = [];
        for (const post of posts) {
          try {
            // Construct full ID — Facebook needs pageId_postId format
            const fullPostId = post.facebook_post_id.includes('_')
              ? post.facebook_post_id
              : `${pageId}_${post.facebook_post_id}`;

            const fbRes = await axios.get(
              `https://graph.facebook.com/v19.0/${fullPostId}`,
              {
                params: {
                  fields: 'likes.summary(true),comments.summary(true),reactions.summary(true)',
                  access_token: accessToken,
                }
              }
            );
            const data = fbRes.data;
            const likes    = data.reactions?.summary?.total_count || data.likes?.summary?.total_count || 0;
            const comments = data.comments?.summary?.total_count || 0;

            // Also update the stored ID to full format
            db.run(
              `UPDATE posts SET likes = ?, comments = ?, facebook_post_id = ?, engagement_updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
              [likes, comments, fullPostId, post.id]
            );
            results.push({ id: post.id, likes, comments });
            console.log(`✅ Synced post ${post.id}: ${likes} likes, ${comments} comments`);
          } catch (fbErr) {
            console.error(`❌ Failed to sync post ${post.id}:`, fbErr.response?.data?.error?.message || fbErr.message);
          }
        }
        res.status(200).json({ synced: results.length, results });
      }
    );
  });
};

// GET /api/facebook/post-details/:fbPostId — fetch likers and comments for a post
exports.getPostDetails = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  db.get(`SELECT facebook_token FROM users WHERE id = ?`, [userId], async (err, row) => {
    if (err) return res.status(500).json({ message: err.message });
    if (!row?.facebook_token) return res.status(400).json({ message: 'No Facebook page connected' });

    let tokenData;
    try { tokenData = JSON.parse(row.facebook_token); }
    catch { return res.status(400).json({ message: 'Invalid token' }); }

    const { accessToken, pageId } = tokenData;
    const rawId = req.params.fbPostId;
    const fullPostId = rawId.includes('_') ? rawId : `${pageId}_${rawId}`;

    try {
      const fbRes = await axios.get(
        `https://graph.facebook.com/v19.0/${fullPostId}`,
        {
          params: {
            fields: 'reactions.summary(true){name,pic_square},comments{message,from,created_time}',
            access_token: accessToken,
          }
        }
      );

      const data = fbRes.data;
      res.status(200).json({
        reactions: data.reactions?.data || [],
        comments:  data.comments?.data  || [],
      });
    } catch (fbErr) {
      res.status(500).json({ message: fbErr.response?.data?.error?.message || fbErr.message });
    }
  });
};
