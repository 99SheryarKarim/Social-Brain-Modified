const cron = require('node-cron');
const axios = require('axios');
const db = require('../../database/init');

const publishDuePosts = async () => {
  const now = new Date().toISOString();

  // Find all posts that are scheduled, not yet posted, and due
  db.all(
    `SELECT p.id, p.content, p.hashtags, p.image_prompt, p.original_topic,
            u.facebook_token
     FROM posts p
     JOIN users u ON p.user_id = u.id
     WHERE p.scheduled_at IS NOT NULL
       AND p.scheduled_at <= ?
       AND p.posted_to_facebook = 0
       AND u.facebook_token IS NOT NULL`,
    [now],
    async (err, rows) => {
      if (err) return console.error('Scheduler DB error:', err.message);
      if (!rows || rows.length === 0) return;

      console.log(`⏰ Scheduler: found ${rows.length} post(s) due for publishing`);

      for (const post of rows) {
        try {
          const tokenData = JSON.parse(post.facebook_token);
          const { accessToken, pageId } = tokenData;
          const fullMessage = post.hashtags ? `${post.content}\n\n${post.hashtags}` : post.content;

          let fbResponse;
          if (post.image_prompt) {
            // Try to get a Pexels image for the post
            try {
              const pexelsRes = await axios.get(
                `https://api.pexels.com/v1/search?query=${encodeURIComponent(post.original_topic || post.image_prompt)}&per_page=1`,
                { headers: { Authorization: process.env.PEXELS_API_KEY } }
              );
              const imageUrl = pexelsRes.data?.photos?.[0]?.src?.landscape;

              if (imageUrl) {
                fbResponse = await axios.post(
                  `https://graph.facebook.com/v19.0/${pageId}/photos`,
                  { url: imageUrl, caption: fullMessage, access_token: accessToken }
                );
              } else {
                throw new Error('No image found');
              }
            } catch {
              // Fall back to text post if image fails
              fbResponse = await axios.post(
                `https://graph.facebook.com/v19.0/${pageId}/feed`,
                { message: fullMessage, access_token: accessToken }
              );
            }
          } else {
            fbResponse = await axios.post(
              `https://graph.facebook.com/v19.0/${pageId}/feed`,
              { message: fullMessage, access_token: accessToken }
            );
          }

          // Mark as posted
          db.run(
            `UPDATE posts SET posted_to_facebook = 1, facebook_post_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
            [fbResponse.data.id, post.id]
          );

          console.log(`✅ Scheduler: published post ${post.id} → FB id ${fbResponse.data.id}`);
        } catch (fbErr) {
          console.error(`❌ Scheduler: failed to publish post ${post.id}:`, fbErr.response?.data?.error?.message || fbErr.message);
        }
      }
    }
  );
};

const startScheduler = () => {
  // Run every minute
  cron.schedule('* * * * *', () => {
    publishDuePosts();
  });
  console.log('⏰ Post scheduler started — checking every minute for due posts');
};

module.exports = { startScheduler };
