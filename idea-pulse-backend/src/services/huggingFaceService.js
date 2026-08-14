/**
 * Hugging Face Inference API Service
 * Provides same interface as Gemini service for model abstraction
 */

const axios = require("axios");

const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;
const HF_API_URL = "https://api-inference.huggingface.co/models";

// Rate limiting to avoid hitting quota
let lastRequestTime = 0;
const REQUEST_DELAY = 1000; // 1 second between requests

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
 * Generic HF API call
 */
async function callHuggingFaceAPI(modelId, prompt, options = {}) {
  if (!HF_API_KEY) {
    throw new Error("HUGGINGFACE_API_KEY not configured in .env");
  }

  await waitForRateLimit();

  try {
    const response = await axios.post(
      `${HF_API_URL}/${modelId}`,
      {
        inputs: prompt,
        parameters: {
          max_length: options.maxLength || 512,
          temperature: options.temperature || 0.7,
          top_p: options.topP || 0.95,
          ...options.parameters,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    return response.data;
  } catch (error) {
    if (error.response?.status === 429) {
      throw new Error("Hugging Face API rate limit exceeded. Try again later.");
    }
    if (error.response?.status === 503) {
      throw new Error("Hugging Face model is loading. Please try again in a moment.");
    }
    throw error;
  }
}

/**
 * Generate post ideas (matches Gemini interface)
 */
async function generatePostPrompts(
  userTopic,
  tone,
  numPosts,
  brandSettings = {},
  modelId = "mistralai/Mistral-7B-Instruct-v0.1"
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

Start with IDEA 1:`;

  const response = await callHuggingFaceAPI(modelId, prompt, {
    maxLength: 400,
    temperature: 0.7,
  });

  const text =
    response[0]?.generated_text || response[0]?.summary_text || JSON.stringify(response);

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

  // Fallback: if we didn't get enough ideas, split the text
  if (ideas.length === 0) {
    return text
      .split("\n")
      .filter((l) => l.trim().length > 10)
      .slice(0, numPosts);
  }

  return ideas;
}

/**
 * Generate full post content (matches Gemini interface)
 */
async function generatePostContent(
  idea,
  tone,
  numWords = 150,
  originalTopic = "",
  brandSettings = {},
  modelId = "mistralai/Mistral-7B-Instruct-v0.1"
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

  const response = await callHuggingFaceAPI(modelId, prompt, {
    maxLength: 600,
    temperature: 0.7,
  });

  const text =
    response[0]?.generated_text || response[0]?.summary_text || JSON.stringify(response);

  const contentMatch = text.match(/---CONTENT_START---\s*([\s\S]*?)\s*---CONTENT_END---/i);
  const hashtagMatch = text.match(/---HASHTAGS_START---\s*([\s\S]*?)\s*---HASHTAGS_END---/i);
  const imageMatch = text.match(/---IMAGE_PROMPT_START---\s*([\s\S]*?)\s*---IMAGE_PROMPT_END---/i);

  // Clean hashtags
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
