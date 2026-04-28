const axios = require("axios");
const db = require("../../database/init");

// Save Facebook page access token to user record
exports.saveToken = async (req, res) => {
  const { accessToken, pageId, pageName } = req.body;
  const userId = req.user?.id;

  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  if (!accessToken || !pageId) return res.status(400).json({ message: "accessToken and pageId are required" });

  // Exchange user token for long-lived page token
  try {
    const tokenData = JSON.stringify({ accessToken, pageId, pageName });
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

      if (imageUrl) {
        // Post with image URL
        fbResponse = await axios.post(
          `https://graph.facebook.com/v19.0/${pageId}/photos`,
          {
            url: imageUrl,
            caption: fullMessage,
            access_token: accessToken,
          }
        );
      } else {
        // Text only post
        fbResponse = await axios.post(
          `https://graph.facebook.com/v19.0/${pageId}/feed`,
          {
            message: fullMessage,
            access_token: accessToken,
          }
        );
      }

      res.status(200).json({ success: true, facebookPostId: fbResponse.data.id });
    } catch (fbErr) {
      const fbError = fbErr.response?.data?.error;
      res.status(500).json({
        message: fbError?.message || "Failed to post to Facebook",
        code: fbError?.code,
      });
    }
  });
};
