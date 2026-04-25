const { extractKeywordsWithTracking, generatePostPromptsWithTracking, generatePostContentWithTracking } = require("../services/geminiService");



/**
 * Generate post ideas (prompts) from user input
 * POST /generate_ideas
 * Body: { prompt, num_posts, tone, num_words, generate_image }
 */
exports.generateIdeas = async (req, res) => {
  try {
    const { prompt, num_posts = 3, tone = "casual", num_words = 100, generate_image = false } = req.body;

    if (!prompt || prompt.trim().length === 0) {
      return res.status(400).json({
        error: "Prompt is required",
      });
    }

    console.log(`🚀 Generating ${num_posts} ideas with tone "${tone}" for prompt: "${prompt}"`);

    // Extract keywords from the prompt
    const { keywords, isMock: keywordsMock } = await extractKeywordsWithTracking(prompt, 10);
    console.log("Extracted keywords:", keywords);

    // Generate post prompts based on keywords and tone
    const { prompts: postPrompts, isMock: promptsMock } = await generatePostPromptsWithTracking(prompt, keywords, tone, num_posts);
    console.log("Generated prompts:", postPrompts);

    // Format response to match frontend expectations
    const formattedPrompts = postPrompts.map((p) => ({
      prompt: p,
      hashtags: "",
    }));

    // Track if ANY of the data is mock
    const isMockData = keywordsMock || promptsMock;

    res.status(200).json({
      post_prompts: formattedPrompts,
      isMockData: isMockData,
      dataSource: isMockData ? "mock" : "api",
    });
  } catch (error) {
    console.error("Error generating ideas:", error);
    res.status(500).json({
      error: error.message || "Failed to generate ideas",
    });
  }
};

/**
 * Generate actual posts from selected ideas/prompts
 * POST /generate_posts_with_media
 * Body: { input, prompts }
 */
exports.generatePostsWithMedia = async (req, res) => {
  try {
    const { input, prompts } = req.body;

    if (!prompts || !Array.isArray(prompts) || prompts.length === 0) {
      return res.status(400).json({
        error: "Prompts array is required",
      });
    }

    console.log(`🚀 Generating posts from ${prompts.length} prompts...`);

    // Generate post content for each prompt
    const posts = [];
    let hasMockData = false;

    const originalTopic = input?.prompt || "";

    for (const prompt of prompts) {
      try {
        const result = await generatePostContentWithTracking(prompt, input?.tone || "casual", input?.num_words || 150, originalTopic);
        if (result.isMock) hasMockData = true;

        posts.push({
          prompt: prompt,
          content: result.content,
          hashtags: result.hashtags,
          imagePrompt: result.imagePrompt,
          originalTopic: originalTopic,
          tone: input?.tone || 'casual',
        });
      } catch (err) {
        console.error(`Error generating post for prompt "${prompt}":`, err);
        // Continue with next prompt even if one fails
        posts.push({
          prompt: prompt,
          content: "Failed to generate content",
          hashtags: "",
          imagePrompt: "",
        });
      }
    }

    console.log(`✅ Generated ${posts.length} posts`);

    res.status(200).json({
      posts: posts,
      isMockData: hasMockData,
      dataSource: hasMockData ? "mock" : "api",
    });
  } catch (error) {
    console.error("Error generating posts with media:", error);
    res.status(500).json({
      error: error.message || "Failed to generate posts",
    });
  }
};
