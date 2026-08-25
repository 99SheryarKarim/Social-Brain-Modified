const {
  extractKeywordsWithTracking,
  generatePostPromptsWithFallback,
  generatePostContentWithFallback,
  generateIdeaRecommendationWithFallback,
} = require("../services/modelRouter");
const { Post } = require("../models/databaseModels");
const jwt = require("jsonwebtoken");
const db = require("../../database/init");
const { logActivity } = require("../utils/activityLogger");
const { fetchTrends, matchTrendToNiche } = require('../services/trendService');

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
    const { prompt, num_posts = 3, tone = "casual", model = "gemini-2.5-flash", useTrends = false } = req.body;
    if (!prompt || prompt.trim().length === 0) return res.status(400).json({ error: "Prompt is required" });

    const userId = getUserIdFromRequest(req);
    const brandSettings = await getBrandSettings(userId);
    let matchedTrend = null;
    let generationTopic = prompt;
    if (useTrends) {
      const trends = await fetchTrends(brandSettings.target_audience || prompt);
      matchedTrend = matchTrendToNiche(trends, brandSettings.target_audience || prompt);
      if (matchedTrend?.trend?.topic) generationTopic = `${prompt} (Current relevant trend: ${matchedTrend.trend.topic})`;
    }

    const { keywords } = await extractKeywordsWithTracking(prompt, 10);
    const { prompts: postPrompts, isMock, provider } = await generatePostPromptsWithFallback(generationTopic, tone, num_posts, brandSettings, model);

    const recommendations = await Promise.all(
      postPrompts.map((idea) => generateIdeaRecommendationWithFallback(
        idea,
        prompt,
        tone,
        model,
        provider
      ))
    );

    if (userId) {
      await logActivity(userId, 'ideas_generated', `Generated ${num_posts} idea(s) for "${prompt}"`, {
        prompt, tone, numPosts: num_posts, model,
      });
    }

    res.status(200).json({
      post_prompts: postPrompts.map((idea, index) => ({
        prompt: idea,
        hashtags: "",
        recommendation: recommendations[index] || {
          platform: "Instagram",
          time: "Tue–Thu, 7:00–9:00 PM",
          reason: "This idea is best shared during the audience's peak evening browsing window.",
        },
      })),
      isMockData: isMock,
      dataSource: isMock ? "mock" : (provider || "api"),
      model: model,
      matchedTrend,
    });
  } catch (error) {
    console.error("Error generating ideas:", error);
    res.status(500).json({ error: error.message || "Failed to generate ideas" });
  }
};

exports.generatePostsWithMedia = async (req, res) => {
  try {
    const { input, prompts, model = "gemini-2.5-flash" } = req.body;
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
    let usedProvider = "";

    for (const prompt of prompts) {
      try {
        const result = await generatePostContentWithFallback(prompt, tone, numWords, originalTopic, brandSettings, model);
        if (result.isMock) hasMockData = true;
        if (result.provider) usedProvider = result.provider;

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

    if (userId) {
      await logActivity(userId, 'posts_generated', `Generated ${posts.length} post(s) for "${originalTopic}"`, {
        prompt: originalTopic, tone, count: posts.length, model,
      });
    }

    res.status(200).json({ 
      posts, 
      isMockData: hasMockData, 
      dataSource: hasMockData ? "mock" : (usedProvider || "api"),
      model: model,
    });
  } catch (error) {
    console.error("Error generating posts with media:", error);
    res.status(500).json({ error: error.message || "Failed to generate posts" });
  }
};
