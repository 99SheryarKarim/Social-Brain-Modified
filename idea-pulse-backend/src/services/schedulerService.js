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
          let query = post.image_prompt || '';
          if (!query) {
            const rawText = post.original_topic || post.content || '';
            const stopWords = new Set(['ideas', 'idea', 'post', 'posts', 'for', 'the', 'a', 'an', 'and', 'or', 'in', 'on', 'at', 'to', 'with', 'beginners', 'beginner', 'casual', 'professional', 'creative', 'friendly', 'witty', 'how', 'what', 'why', 'top', 'best', 'guide', 'tips', 'tricks', 'about']);
            const words = rawText.replace(/[^\w\s]/gi, ' ').split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w.toLowerCase()));
            query = words.length > 0 ? words.slice(0, 3).join(' ') : 'social media';
          }

          let imageUrl = null;
          if (process.env.PEXELS_API_KEY) {
            try {
              const pexelsRes = await axios.get(
                `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`,
                { headers: { Authorization: process.env.PEXELS_API_KEY } }
              );
              imageUrl = pexelsRes.data?.photos?.[0]?.src?.landscape || null;
            } catch {
              imageUrl = null;
            }
          }

          if (!imageUrl) {
            imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(query)}?width=800&height=400&nologo=true`;
          }

          try {
            fbResponse = await axios.post(
              `https://graph.facebook.com/v19.0/${pageId}/photos`,
              { url: imageUrl, caption: fullMessage, access_token: accessToken }
            );
          } catch {
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
