const { extractKeywordsWithTracking, generatePostPromptsWithTracking, generatePostContentWithTracking } = require("../services/geminiService");
const { Post } = require("../models/databaseModels");
const jwt = require("jsonwebtoken");
const db = require("../../database/init");

const getUserIdFromRequest = (req) => {
  try {
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) return null;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded?.id || null;
  } catch {
    return null;
  }
};

// Fetch brand settings for a user from DB
const getBrandSettings = (userId) => {
  return new Promise((resolve) => {
    if (!userId) return resolve({});
    db.get(`SELECT brand_description, target_audience FROM settings WHERE user_id = ?`, [userId], (err, row) => {
      resolve(err || !row ? {} : row);
    });
  });
};

exports.generateIdeas = async (req, res) => {
  try {
    const { prompt, num_posts = 3, tone = "casual" } = req.body;
    if (!prompt || prompt.trim().length === 0) return res.status(400).json({ error: "Prompt is required" });

    const userId = getUserIdFromRequest(req);
    const brandSettings = await getBrandSettings(userId);

    const { keywords } = await extractKeywordsWithTracking(prompt, 10);
    const { prompts: postPrompts, isMock } = await generatePostPromptsWithTracking(prompt, keywords, tone, num_posts, brandSettings);

    res.status(200).json({
      post_prompts: postPrompts.map((p) => ({ prompt: p, hashtags: "" })),
      isMockData: isMock,
      dataSource: isMock ? "mock" : "api",
    });
  } catch (error) {
    console.error("Error generating ideas:", error);
    res.status(500).json({ error: error.message || "Failed to generate ideas" });
  }
};

exports.generatePostsWithMedia = async (req, res) => {
  try {
    const { input, prompts } = req.body;
    if (!prompts || !Array.isArray(prompts) || prompts.length === 0) {
      return res.status(400).json({ error: "Prompts array is required" });
    }

    const originalTopic = input?.prompt || "";
    const tone = input?.tone || "casual";
    const numWords = input?.num_words || 150;
    const userId = getUserIdFromRequest(req);
    const brandSettings = await getBrandSettings(userId);

    const posts = [];
    let hasMockData = false;

    for (const prompt of prompts) {
      try {
        const result = await generatePostContentWithTracking(prompt, tone, numWords, originalTopic, brandSettings);
        if (result.isMock) hasMockData = true;

        const post = {
          prompt,
          content: result.content,
          hashtags: result.hashtags,
          imagePrompt: result.imagePrompt,
          originalTopic,
          tone,
        };

        if (userId) {
          try {
            const saved = await Post.create(userId, result.content, tone, result.hashtags || '', result.imagePrompt || '', originalTopic);
            post.id = saved.id;
          } catch (dbErr) {
            console.error("Failed to save post to DB:", dbErr.message);
          }
        }

        posts.push(post);
      } catch (err) {
        console.error(`Error generating post for prompt "${prompt}":`, err);
        posts.push({ prompt, content: "Failed to generate content", hashtags: "", imagePrompt: "" });
      }
    }

    res.status(200).json({ posts, isMockData: hasMockData, dataSource: hasMockData ? "mock" : "api" });
  } catch (error) {
    console.error("Error generating posts with media:", error);
    res.status(500).json({ error: error.message || "Failed to generate posts" });
  }
};
