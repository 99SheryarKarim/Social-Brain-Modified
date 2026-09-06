/**
 * Model Router Service
 * Routes requests to the appropriate AI service based on model ID
 * Implements adapter pattern for multiple AI providers
 */

const geminiService = require("./geminiService");
const huggingFaceService = require("./huggingFaceService");
const ollamaService = require("./ollamaService");
const customModelService = require("./customModelService");
const { getModelInfo } = require("../config/models");

/**
 * Route generation request to appropriate service
 */
async function generatePostPromptsWithFallback(
  userTopic,
  tone,
  numPosts,
  brandSettings,
  modelId
) {
  const modelInfo = getModelInfo(modelId);

  if (!modelInfo) {
    console.warn(`Unknown model: ${modelId}, falling back to Gemini`);
    return generatePostPromptsWithTracking(
      userTopic,
      [],
      tone,
      numPosts,
      brandSettings,
      "gemini-2.5-flash"
    );
  }

  try {
    switch (modelInfo.provider) {
      case "custom":
        try {
          const prompts = await customModelService.generatePostPrompts(
            userTopic,
            tone,
            numPosts,
            brandSettings
          );
          return { prompts, isMock: false, provider: "custom" };
        } catch (err) {
          console.warn("Custom model generation failed, falling back to Gemini:", err.message);
          return await generatePostPromptsWithTracking(userTopic, [], tone, numPosts, brandSettings, "gemini-2.5-flash");
        }

      case "gemini":
        return await generatePostPromptsWithTracking(
          userTopic,
          [],
          tone,
          numPosts,
          brandSettings,
          modelId
        );

      case "huggingface":
        try {
          const prompts = await huggingFaceService.generatePostPrompts(
            userTopic,
            tone,
            numPosts,
            brandSettings,
            modelId
          );
          return { prompts, isMock: false, provider: "huggingface" };
        } catch (error) {
          console.warn(
            `Hugging Face failed for model ${modelId}, trying local Ollama before Gemini:`,
            error.message
          );

          try {
            const localResult = await ollamaService.generatePostPrompts(
              userTopic,
              tone,
              numPosts,
              brandSettings,
              "ollama-llama2"
            );
            return { prompts: localResult, isMock: false, provider: "ollama" };
          } catch (ollamaError) {
            console.warn("Local Ollama fallback also failed, using Gemini:", ollamaError.message);
            const fallback = await generatePostPromptsWithTracking(
              userTopic,
              [],
              tone,
              numPosts,
              brandSettings,
              "gemini-2.5-flash"
            );
            return { ...fallback, provider: "gemini" };
          }
        }

      case "together":
        try {
          const prompts = await togetherService.generatePostPrompts(
            userTopic,
            tone,
            numPosts,
            brandSettings,
            modelId
          );
          return { prompts, isMock: false, provider: "together" };
        } catch (error) {
          console.warn(
            `Together.ai failed for model ${modelId}, trying local Ollama before Gemini:`,
            error.message
          );

          try {
            const localResult = await ollamaService.generatePostPrompts(
              userTopic,
              tone,
              numPosts,
              brandSettings,
              "ollama-llama2"
            );
            return { prompts: localResult, isMock: false, provider: "ollama" };
          } catch (ollamaError) {
            console.warn("Local Ollama fallback also failed, using Gemini:", ollamaError.message);
            const fallback = await generatePostPromptsWithTracking(
              userTopic,
              [],
              tone,
              numPosts,
              brandSettings,
              "gemini-2.5-flash"
            );
            return { ...fallback, provider: "gemini" };
          }
        }

      case "ollama":
        try {
          const prompts = await ollamaService.generatePostPrompts(
            userTopic,
            tone,
            numPosts,
            brandSettings,
            modelId
          );
          return { prompts, isMock: false, provider: "ollama" };
        } catch (error) {
          console.warn(
            `Ollama failed for model ${modelId}, falling back to Gemini:`,
            error.message
          );
          const fallback = await generatePostPromptsWithTracking(
            userTopic,
            [],
            tone,
            numPosts,
            brandSettings,
            "gemini-2.5-flash"
          );
          return { ...fallback, provider: "gemini" };
        }

      default:
        throw new Error(`Unsupported provider: ${modelInfo.provider}`);
    }
  } catch (error) {
    console.error(`Model routing error for ${modelId}:`, error.message);
    const mock = Array.from({ length: numPosts }, (_, i) =>
      `Post idea ${i + 1} about ${userTopic}`
    );
    return { prompts: mock, isMock: true, provider: "mock" };
  }
}

/**
 * Route content generation request
 */
async function generateIdeaRecommendationWithFallback(
  idea,
  originalTopic,
  tone,
  modelId,
  providerOverride = null
) {
  const modelInfo = getModelInfo(modelId);
  const provider = providerOverride || modelInfo?.provider || "gemini";

  try {
    if (provider === "ollama") {
      return await ollamaService.generateIdeaRecommendation(idea, originalTopic, tone, modelId);
    }

    if (provider === "gemini") {
      return await geminiService.generateIdeaRecommendation(idea, originalTopic, tone, modelId);
    }

    if (provider === "huggingface" || provider === "together") {
      return await geminiService.generateIdeaRecommendation(idea, originalTopic, tone, "gemini-2.5-flash");
    }

    return await geminiService.generateIdeaRecommendation(idea, originalTopic, tone, "gemini-2.5-flash");
  } catch (error) {
    console.warn(`AI recommendation route failed for provider ${provider}:`, error.message);
    const lower = String(idea || "").toLowerCase();
    let platform = "Instagram";
    if (lower.includes("startup") || lower.includes("tech lead") || lower.includes("professional") || lower.includes("career") || lower.includes("business") || lower.includes("leadership")) {
      platform = "LinkedIn";
    } else if (lower.includes("short video") || lower.includes("viral") || lower.includes("trend") || lower.includes("tiktok")) {
      platform = "TikTok";
    } else if (lower.includes("video") || lower.includes("tutorial") || lower.includes("youtube")) {
      platform = "YouTube";
    } else if (lower.includes("twitter") || lower.includes("x.com") || lower.includes("news") || lower.includes("industry")) {
      platform = "X / Twitter";
    } else if (lower.includes("community") || lower.includes("facebook") || lower.includes("event")) {
      platform = "Facebook";
    }

    let time = "Tue–Thu, 7:00–9:00 PM";
    if (platform === "LinkedIn") time = "Tue–Thu, 8:00–10:00 AM";
    else if (platform === "TikTok") time = "Mon–Fri, 6:00–9:00 PM";
    else if (platform === "YouTube") time = "Wed–Sat, 6:00–8:00 PM";
    else if (platform === "X / Twitter") time = "Tue–Thu, 8:00–10:00 AM";
    else if (platform === "Facebook") time = "Wed–Sat, 1:00–3:00 PM";

    const platformSignals = {
      LinkedIn: ["startup", "tech lead", "engineering manager", "founder", "leadership", "professional", "career", "business", "product", "saas", "b2b"],
      TikTok: ["short-form", "short form", "tiktok", "viral", "launch", "launch day", "countdown", "trend", "demo", "product demo", "quick tip"],
      YouTube: ["youtube", "tutorial", "walkthrough", "vlog", "how to", "explainer", "series", "interview", "step-by-step"],
      "X / Twitter": ["twitter", "x.com", "industry", "news", "opinion", "commentary", "hot take"],
      Facebook: ["community", "facebook", "local", "event", "discussion", "group"],
      Instagram: ["instagram", "visual", "brand", "lifestyle", "creative", "storytelling", "aesthetic"],
    };

    const matchedSignal = Object.entries(platformSignals).find(([_, signals]) =>
      signals.some((signal) => lower.includes(signal))
    );

    let reason = `This idea fits ${platform} because it matches the content format and audience behavior best, and ${time} is when that audience is most active.`;
    if (matchedSignal) {
      const [matchedPlatform, signals] = matchedSignal;
      const matchedWord = signals.find((signal) => lower.includes(signal));
      if (matchedPlatform === "TikTok" && matchedWord) {
        reason = `This idea fits TikTok because the content is short-form, attention-grabbing, and launch-driven, and ${time} is when users are most likely to discover fast-moving clips.`;
      } else if (matchedPlatform === "YouTube" && matchedWord) {
        reason = `This idea fits YouTube because it is educational, explainer-style, or video-first, and ${time} is when viewers are most likely to watch longer content.`;
      } else if (matchedPlatform === "LinkedIn" && matchedWord) {
        reason = `This idea fits LinkedIn because it is professional, founder, or leadership-focused, and ${time} is when decision-makers are checking updates.`;
      } else if (matchedPlatform === "Instagram" && matchedWord) {
        reason = `This idea fits Instagram because it is visual and community-driven, and ${time} is when people are browsing social content in the evening.`;
      } else if (matchedPlatform === "X / Twitter" && matchedWord) {
        reason = `This idea fits X / Twitter because it is timely, opinion-driven, and best for fast conversation, and ${time} is when industry chatter is active.`;
      } else if (matchedPlatform === "Facebook" && matchedWord) {
        reason = `This idea fits Facebook because it thrives on community discussion and event-style engagement, and ${time} is when local and community audiences are most active.`;
      }
    }

    return { platform, time, reason };
  }
}

async function generatePostContentWithFallback(
  idea,
  tone,
  numWords,
  originalTopic,
  brandSettings,
  modelId
) {
  const modelInfo = getModelInfo(modelId);

  if (!modelInfo) {
    console.warn(`Unknown model: ${modelId}, falling back to Gemini`);
    return await generatePostContentWithTracking(
      idea,
      tone,
      numWords,
      originalTopic,
      brandSettings,
      "gemini-2.5-flash"
    );
  }

  try {
    switch (modelInfo.provider) {
      case "custom":
        try {
          const result = await customModelService.generatePostContent(idea, tone, numWords, originalTopic, brandSettings);
          return { ...result, isMock: false, provider: "custom" };
        } catch (err) {
          console.warn("Custom model content generation failed, falling back to Gemini:", err.message);
          return await generatePostContentWithTracking(idea, tone, numWords, originalTopic, brandSettings, "gemini-2.5-flash");
        }

      case "gemini":
        return await generatePostContentWithTracking(
          idea,
          tone,
          numWords,
          originalTopic,
          brandSettings,
          modelId
        );

      case "huggingface":
        try {
          const result = await huggingFaceService.generatePostContent(
            idea,
            tone,
            numWords,
            originalTopic,
            brandSettings,
            modelId
          );
          return { ...result, isMock: false, provider: "huggingface" };
        } catch (error) {
          console.warn(
            `Hugging Face failed for model ${modelId}, falling back to Gemini:`,
            error.message
          );
          const fallback = await generatePostContentWithTracking(
            idea,
            tone,
            numWords,
            originalTopic,
            brandSettings,
            "gemini-2.5-flash"
          );
          return { ...fallback, provider: "gemini" };
        }

      case "together":
        try {
          const result = await togetherService.generatePostContent(
            idea,
            tone,
            numWords,
            originalTopic,
            brandSettings,
            modelId
          );
          return { ...result, isMock: false, provider: "together" };
        } catch (error) {
          console.warn(
            `Together.ai failed for model ${modelId}, falling back to Gemini:`,
            error.message
          );
          const fallback = await generatePostContentWithTracking(
            idea,
            tone,
            numWords,
            originalTopic,
            brandSettings,
            "gemini-2.5-flash"
          );
          return { ...fallback, provider: "gemini" };
        }

      case "ollama":
        try {
          const result = await ollamaService.generatePostContent(
            idea,
            tone,
            numWords,
            originalTopic,
            brandSettings,
            modelId
          );
          return { ...result, isMock: false, provider: "ollama" };
        } catch (error) {
          console.warn(
            `Ollama failed for model ${modelId}, falling back to Gemini:`,
            error.message
          );
          const fallback = await generatePostContentWithTracking(
            idea,
            tone,
            numWords,
            originalTopic,
            brandSettings,
            "gemini-2.5-flash"
          );
          return { ...fallback, provider: "gemini" };
        }

      default:
        throw new Error(`Unsupported provider: ${modelInfo.provider}`);
    }
  } catch (error) {
    console.error(`Model routing error for ${modelId}:`, error.message);
    return {
      content: `A ${tone} post about ${originalTopic || idea}.`,
      hashtags: `#${(originalTopic || idea).replace(/\s+/g, "")}`,
      imagePrompt: `Image about ${originalTopic || idea}`,
      isMock: true,
      provider: "mock",
    };
  }
}

/**
 * Import Gemini tracking functions (re-export)
 */
const {
  generatePostPromptsWithTracking,
  generatePostContentWithTracking,
  extractKeywordsWithTracking,
} = require("./geminiService");

module.exports = {
  generatePostPromptsWithFallback,
  generatePostContentWithFallback,
  generateIdeaRecommendationWithFallback,
  extractKeywordsWithTracking,
  // Export tracking functions for backward compatibility
  generatePostPromptsWithTracking,
  generatePostContentWithTracking,
};
