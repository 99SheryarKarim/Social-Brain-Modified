/**
 * IdeaPulse Custom Trained AI Model Service
 * Interface for connecting fine-tuned custom models (e.g. via Flask/FastAPI, Hugging Face Endpoint, or Ollama fine-tune).
 */

const geminiService = require("./geminiService");
const axios = require("axios");

// Custom model backend endpoint (e.g. http://localhost:5000/generate if hosting custom PyTorch/Unsloth model)
const CUSTOM_MODEL_URL = process.env.CUSTOM_MODEL_URL || null;

async function generatePostPrompts(userTopic, tone, numPosts, brandSettings = {}) {
  if (CUSTOM_MODEL_URL) {
    try {
      const response = await axios.post(`${CUSTOM_MODEL_URL}/generate-ideas`, {
        userTopic,
        tone,
        numPosts,
        brandSettings,
      }, { timeout: 15000 });
      if (response.data?.prompts) {
        return response.data.prompts;
      }
    } catch (err) {
      console.warn("Custom model API endpoint error, falling back to specialized IdeaPulse prompt:", err.message);
    }
  }

  // Specialized fine-tuned system prompt wrapper matching IdeaPulse custom behavior
  return await geminiService.generatePostPromptsWithTracking(
    `[IdeaPulse Trained AI] ${userTopic}`,
    [],
    tone,
    numPosts,
    brandSettings,
    "gemini-2.5-flash"
  ).then(res => res.prompts);
}

async function generatePostContent(idea, tone, numWords = 150, originalTopic = "", brandSettings = {}) {
  if (CUSTOM_MODEL_URL) {
    try {
      const response = await axios.post(`${CUSTOM_MODEL_URL}/generate-post`, {
        idea,
        tone,
        numWords,
        originalTopic,
        brandSettings,
      }, { timeout: 20000 });
      if (response.data?.content) {
        return response.data;
      }
    } catch (err) {
      console.warn("Custom model API endpoint error, falling back to specialized IdeaPulse prompt:", err.message);
    }
  }

  return await geminiService.generatePostContentWithTracking(
    idea,
    tone,
    numWords,
    originalTopic,
    brandSettings,
    "gemini-2.5-flash"
  );
}

module.exports = {
  generatePostPrompts,
  generatePostContent,
};
