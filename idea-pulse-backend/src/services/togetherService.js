/**
 * Together.ai API Service
 * Provides same interface as Gemini service for model abstraction
 * Supports high-performance open-source models
 */

const axios = require("axios");

const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY;
const TOGETHER_API_URL = "https://api.together.xyz/inference";

// Rate limiting
let lastRequestTime = 0;
const REQUEST_DELAY = 500; // 0.5 second between requests

async function waitForRateLimit() {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < REQUEST_DELAY) {
    await new Promise((resolve) =>
      setTimeout(resolve, REQUEST_DELAY - timeSinceLastRequest)
    );
  }
  lastRequestTime = Date.now();
}

/**
 * Generic Together.ai API call
 */
async function callTogetherAPI(modelId, prompt, options = {}) {
  if (!TOGETHER_API_KEY) {
    throw new Error("TOGETHER_API_KEY not configured in .env");
  }

  await waitForRateLimit();

  try {
    const response = await axios.post(
      TOGETHER_API_URL,
      {
        model: modelId,
        prompt: prompt,
        max_tokens: options.maxTokens || 512,
        temperature: options.temperature || 0.7,
        top_p: options.topP || 0.95,
        top_k: options.topK || 40,
        repetition_penalty: 1,
        stop: ["<|im_end|>"],
      },
      {
        headers: {
          Authorization: `Bearer ${TOGETHER_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 60000,
      }
    );

    return response.data;
  } catch (error) {
    if (error.response?.status === 429) {
      throw new Error("Together.ai API rate limit exceeded. Try again later.");
    }
    if (error.response?.status === 503) {
      throw new Error("Together.ai is temporarily unavailable. Please try again.");
    }
    throw error;
  }
}

/**
 * Generate post ideas using Together.ai
 */
async function generatePostPrompts(
  userTopic,
  tone,
  numPosts,
  brandSettings = {},
  modelId = "togethercomputer/llama-2-70b-chat"
) {
  const brandContext = brandSettings.brand_description
    ? `\nYou are creating content for: ${brandSettings.brand_description}`
    : "";
  const audienceContext = brandSettings.target_audience
    ? `\nTarget audience: ${brandSettings.target_audience}`
    : "";

  const prompt = `You are an AI Social Media Manager.${brandContext}${audienceContext}

The user wants ${numPosts} social media post ideas about: "${userTopic}"
Tone: ${tone}

Generate exactly ${numPosts} short, specific post ideas. Each idea must be directly about "${userTopic}"${
    brandSettings.brand_description ? ` and relevant to ${brandSettings.brand_description}` : ""
  }.

Rules:
- Every idea MUST be about "${userTopic}"
- Be specific and practical, not abstract or poetic
- Each idea should be 1-2 sentences max
${brandSettings.target_audience ? `- Keep ${brandSettings.target_audience} in mind` : ""}

Format exactly like this:
IDEA 1: [idea here]
IDEA 2: [idea here]
IDEA 3: [idea here]

Start generating now:`;

  const response = await callTogetherAPI(modelId, prompt, {
    maxTokens: 400,
    temperature: 0.7,
  });

  const text = response.output?.choices?.[0]?.text || JSON.stringify(response);

  const ideas = [];
  const lines = text.split("\n");

  for (const line of lines) {
    const match = line.match(/^IDEA\s*\d+:\s*(.+)/i);
    if (match) {
      const idea = match[1].trim();
      if (idea.length > 0) ideas.push(idea);
    }
    if (ideas.length >= numPosts) break;
  }

  if (ideas.length === 0) {
    return text
      .split("\n")
      .filter((l) => l.trim().length > 10)
      .slice(0, numPosts);
  }

  return ideas;
}

/**
 * Generate full post content using Together.ai
 */
async function generatePostContent(
  idea,
  tone,
  numWords = 150,
  originalTopic = "",
  brandSettings = {},
  modelId = "togethercomputer/llama-2-70b-chat"
) {
  const brandContext = brandSettings.brand_description
    ? `\nYou are an AI Social Media Manager for: ${brandSettings.brand_description}`
    : "\nYou are an AI Social Media Manager.";
  const audienceContext = brandSettings.target_audience
    ? `\nTarget audience: ${brandSettings.target_audience}`
    : "";

  const prompt = `${brandContext}${audienceContext}

Write a social media post with these requirements:
- Topic: "${originalTopic || idea}"
- Post idea: "${idea}"
- Tone: ${tone}
- Length: approximately ${numWords} words
- The post MUST be about "${originalTopic || idea}"${
    brandSettings.brand_description ? ` and align with ${brandSettings.brand_description}` : ""
  }
${brandSettings.target_audience ? `- Write specifically for ${brandSettings.target_audience}` : ""}
- Be direct, practical, and engaging
- End with a call-to-action

---CONTENT_START---
[write your post here]
---CONTENT_END---

---HASHTAGS_START---
#hashtag1 #hashtag2 #hashtag3
---HASHTAGS_END---

---IMAGE_PROMPT_START---
[image keywords]
---IMAGE_PROMPT_END---

Start generating now:`;

  const response = await callTogetherAPI(modelId, prompt, {
    maxTokens: 600,
    temperature: 0.7,
  });

  const text = response.output?.choices?.[0]?.text || JSON.stringify(response);

  const contentMatch = text.match(/---CONTENT_START---\s*([\s\S]*?)\s*---CONTENT_END---/i);
  const hashtagMatch = text.match(/---HASHTAGS_START---\s*([\s\S]*?)\s*---HASHTAGS_END---/i);
  const imageMatch = text.match(/---IMAGE_PROMPT_START---\s*([\s\S]*?)\s*---IMAGE_PROMPT_END---/i);

  const rawHashtags = hashtagMatch ? hashtagMatch[1].trim() : "";
  const cleanHashtags = rawHashtags
    .split(/[\s,\n]+/)
    .filter((w) => w.startsWith("#") && w.length > 1)
    .slice(0, 5)
    .join(" ");

  return {
    content: contentMatch
      ? contentMatch[1].trim()
      : text.replace(/---.*?---/gs, "").trim(),
    hashtags: cleanHashtags || `#${(originalTopic || idea).replace(/\s+/g, "")}`,
    imagePrompt: imageMatch ? imageMatch[1].trim() : originalTopic || idea,
  };
}

module.exports = {
  generatePostPrompts,
  generatePostContent,
};
