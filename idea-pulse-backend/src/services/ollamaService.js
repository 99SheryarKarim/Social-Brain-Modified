/**
 * Ollama Local API Service
 * Runs locally on user's machine at http://localhost:11434
 * No API key required, completely private
 */

const axios = require("axios");

const OLLAMA_HOST = process.env.OLLAMA_HOST || "http://localhost:11434";

/**
 * Check if Ollama is running
 */
async function isOllamaAvailable() {
  try {
    const response = await axios.get(`${OLLAMA_HOST}/api/tags`, {
      timeout: 5000,
    });
    return response.status === 200;
  } catch {
    return false;
  }
}

async function getAvailableModels() {
  try {
    const response = await axios.get(`${OLLAMA_HOST}/api/tags`, {
      timeout: 5000,
    });
    return (response.data?.models || []).map((model) => model.name || model.model || "").filter(Boolean);
  } catch {
    return [];
  }
}

function resolveLocalModelName(modelId, availableModels) {
  const requested = (modelId || "").toLowerCase();

  if (!availableModels.length) return modelId;
  if (availableModels.includes(modelId)) return modelId;

  const exactAliases = {
    "ollama-mistral": ["mistral", "mistral:latest", "llama3:latest", "llama3.2:1b"],
    "ollama-llama2": ["llama2", "llama2:latest", "llama3:latest", "llama3.2:1b"],
    "ollama-neural-chat": ["neural-chat", "llama3:latest", "llama3.2:1b", "mistral"],
  };

  const aliasList = exactAliases[modelId] || [];
  for (const alias of aliasList) {
    const match = availableModels.find((name) => name.toLowerCase() === alias.toLowerCase());
    if (match) return match;
  }

  if (requested.includes("mistral")) {
    const match = availableModels.find((name) => name.toLowerCase().includes("mistral"));
    if (match) return match;
  }

  if (requested.includes("llama") || requested.includes("llama2") || requested.includes("llama-2")) {
    const match = availableModels.find((name) => name.toLowerCase().includes("llama3") || name.toLowerCase().includes("llama2"));
    if (match) return match;
  }

  if (requested.includes("neural") || requested.includes("chat")) {
    const match = availableModels.find((name) => name.toLowerCase().includes("llama") || name.toLowerCase().includes("mistral"));
    if (match) return match;
  }

  return availableModels[0];
}

/**
 * Generic Ollama API call
 */
async function callOllamaAPI(modelId, prompt, options = {}) {
  const available = await isOllamaAvailable();
  if (!available) {
    throw new Error(
      `Ollama is not running. Please start Ollama first. Expected at: ${OLLAMA_HOST}`
    );
  }

  const availableModels = await getAvailableModels();
  const resolvedModel = resolveLocalModelName(modelId, availableModels);

  try {
    const response = await axios.post(
      `${OLLAMA_HOST}/api/generate`,
      {
        model: resolvedModel,
        prompt: prompt,
        temperature: options.temperature || 0.7,
        top_p: options.topP || 0.95,
        top_k: options.topK || 40,
        num_predict: options.maxTokens || 512,
        stream: false,
      },
      {
        timeout: 120000, // Ollama can be slow
      }
    );

    return response.data;
  } catch (error) {
    if (error.message.includes("ECONNREFUSED")) {
      throw new Error(
        `Cannot connect to Ollama at ${OLLAMA_HOST}. Make sure Ollama is running.`
      );
    }
    if (error.response?.status === 404) {
      throw new Error(
        `Ollama model '${resolvedModel}' is not installed. Pull it first or pick a different model.`
      );
    }
    throw error;
  }
}

/**
 * Generate post ideas using Ollama
 */
async function generatePostPrompts(
  userTopic,
  tone,
  numPosts,
  brandSettings = {},
  modelId = "mistral"
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

Generate exactly ${numPosts} distinct post ideas. Each idea must be directly about "${userTopic}"${
    brandSettings.brand_description ? ` and relevant to ${brandSettings.brand_description}` : ""
  }.

Rules:
- Every idea MUST be about "${userTopic}"
- Each idea must be a complete idea, not a title or headline
- Be specific, practical, and actionable
- Write 1-2 full sentences with enough detail to be useful to a creator
- Use 20-40 words per idea
- Avoid single-word or fragment-style outputs like "Behind-the-Scenes Vlogs"
${brandSettings.target_audience ? `- Keep ${brandSettings.target_audience} in mind` : ""}

Format exactly like this:
IDEA 1: [full idea in 1-2 complete sentences]
IDEA 2: [full idea in 1-2 complete sentences]
IDEA 3: [full idea in 1-2 complete sentences]

Start generating now:`;

  const response = await callOllamaAPI(modelId, prompt, {
    maxTokens: 400,
    temperature: 0.7,
  });

  const text = response.response || JSON.stringify(response);

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
 * Generate full post content using Ollama
 */
async function generatePostContent(
  idea,
  tone,
  numWords = 150,
  originalTopic = "",
  brandSettings = {},
  modelId = "mistral"
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

  const response = await callOllamaAPI(modelId, prompt, {
    maxTokens: 600,
    temperature: 0.7,
  });

  const text = response.response || JSON.stringify(response);

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

function normalizeRecommendation(rawRecommendation = {}) {
  const platform = rawRecommendation.platform || rawRecommendation.bestPlatform || "Instagram";
  const time = rawRecommendation.time || rawRecommendation.bestTime || "Tue–Thu, 7:00–9:00 PM";
  const reason = rawRecommendation.reason || rawRecommendation.description || "This content is most effective when it matches the audience’s active browsing window.";

  return {
    platform: String(platform).trim() || "Instagram",
    time: String(time).trim() || "Tue–Thu, 7:00–9:00 PM",
    reason: String(reason).trim() || "This content is most effective when it matches the audience’s active browsing window.",
  };
}

async function generateIdeaRecommendation(idea, originalTopic = "", tone = "casual", modelId = "ollama-mistral") {
  const prompt = `You are a high-performing social media strategist.

Analyze this content idea and choose the single best platform and posting time.

Context topic: "${originalTopic || idea}"
Idea: "${idea}"
Tone: ${tone}

Platform guidance:
- Use LinkedIn for founder, leadership, startup, business, career, product, engineering leadership, professional, or B2B content.
- Use TikTok for short-form video, trend-driven, viral, launch-day, product demo, quick tips, and attention-grabbing creative ideas.
- Use Instagram for lifestyle, visual storytelling, brand personality, community, and creative short-form content.
- Use YouTube for tutorials, walkthroughs, in-depth education, vlogs, interviews, and longer explainer content.
- Use X / Twitter for industry commentary, hot takes, fast opinions, and real-time trends.
- Use Facebook for community, local groups, events, discussions, and lifestyle updates.

Time guidance:
- LinkedIn: Tue–Thu, 8:00–10:00 AM
- TikTok: Mon–Fri, 6:00–9:00 PM
- Instagram: Tue–Thu, 7:00–9:00 PM
- YouTube: Wed–Sat, 6:00–8:00 PM
- X / Twitter: Tue–Thu, 8:00–10:00 AM
- Facebook: Wed–Sat, 1:00–3:00 PM

Return valid JSON only in this exact schema:
{
  "platform": "LinkedIn",
  "time": "Tue–Thu, 8:00–10:00 AM",
  "reason": "One concise sentence explaining why this platform and time fit this specific idea."
}

Do not include markdown, commentary, or extra text outside the JSON object.`;

  const response = await callOllamaAPI(modelId, prompt, {
    maxTokens: 350,
    temperature: 0.3,
  });

  const text = response.response || JSON.stringify(response);
  const cleaned = text.replace(/```json|```/gi, "").trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  const jsonText = match ? match[0] : cleaned;

  try {
    const recommendation = normalizeRecommendation(JSON.parse(jsonText));
    const explicitPlatform =
      /(youtube|youtube video|vlog|tutorial|walkthrough|explainer|how-to|how to|series|interview)/.test(String(`${originalTopic || ""} ${idea || ""}`).toLowerCase()) ? "YouTube" :
      /(tiktok|short-form|short form|viral|launch day|countdown|trend|product demo|demo)/.test(String(`${originalTopic || ""} ${idea || ""}`).toLowerCase()) ? "TikTok" :
      /(linkedin|startup|tech lead|engineering manager|founder|leadership|professional|career|business|b2b|product)/.test(String(`${originalTopic || ""} ${idea || ""}`).toLowerCase()) ? "LinkedIn" :
      /(instagram|story|reel|aesthetic|brand|lifestyle|visual|community)/.test(String(`${originalTopic || ""} ${idea || ""}`).toLowerCase()) ? "Instagram" :
      /(x.com|twitter|industry|news|opinion|commentary|hot take)/.test(String(`${originalTopic || ""} ${idea || ""}`).toLowerCase()) ? "X / Twitter" :
      /(facebook|community|local|event|group|discussion)/.test(String(`${originalTopic || ""} ${idea || ""}`).toLowerCase()) ? "Facebook" :
      null;

    if (explicitPlatform && recommendation.platform !== explicitPlatform) {
      const time = explicitPlatform === "LinkedIn" ? "Tue–Thu, 8:00–10:00 AM" :
        explicitPlatform === "TikTok" ? "Mon–Fri, 6:00–9:00 PM" :
        explicitPlatform === "YouTube" ? "Wed–Sat, 6:00–8:00 PM" :
        explicitPlatform === "X / Twitter" ? "Tue–Thu, 8:00–10:00 AM" :
        explicitPlatform === "Facebook" ? "Wed–Sat, 1:00–3:00 PM" :
        "Tue–Thu, 7:00–9:00 PM";

      return {
        platform: explicitPlatform,
        time,
        reason: explicitPlatform === "YouTube" ? `This idea fits YouTube because it is video-first, educational, or explainer-driven, and ${time} is when viewers are most likely to watch longer-form content.` :
          explicitPlatform === "TikTok" ? `This idea fits TikTok because it is short-form, launch-driven, or attention-grabbing, and ${time} is when users are most likely to discover fast-moving clips.` :
          explicitPlatform === "LinkedIn" ? `This idea fits LinkedIn because it is founder, business, or leadership-focused, and ${time} is when decision-makers are checking updates.` :
          `This idea fits ${explicitPlatform} because it matches the content format and audience behavior best, and ${time} is when that audience is most active.`,
      };
    }

    return recommendation;
  } catch {
    const lower = String(`${originalTopic || ""} ${idea || ""}`).toLowerCase();
    const explicitPlatform =
      /(youtube|youtube video|vlog|tutorial|walkthrough|explainer|how-to|how to|series|interview)/.test(lower) ? "YouTube" :
      /(tiktok|short-form|short form|viral|launch day|countdown|trend|product demo|demo)/.test(lower) ? "TikTok" :
      /(linkedin|startup|tech lead|engineering manager|founder|leadership|professional|career|business|b2b|product)/.test(lower) ? "LinkedIn" :
      /(instagram|story|reel|aesthetic|brand|lifestyle|visual|community)/.test(lower) ? "Instagram" :
      /(x.com|twitter|industry|news|opinion|commentary|hot take)/.test(lower) ? "X / Twitter" :
      /(facebook|community|local|event|group|discussion)/.test(lower) ? "Facebook" :
      "Instagram";

    let time = "Tue–Thu, 7:00–9:00 PM";
    if (explicitPlatform === "LinkedIn") time = "Tue–Thu, 8:00–10:00 AM";
    else if (explicitPlatform === "TikTok") time = "Mon–Fri, 6:00–9:00 PM";
    else if (explicitPlatform === "YouTube") time = "Wed–Sat, 6:00–8:00 PM";
    else if (explicitPlatform === "X / Twitter") time = "Tue–Thu, 8:00–10:00 AM";
    else if (explicitPlatform === "Facebook") time = "Wed–Sat, 1:00–3:00 PM";

    return {
      platform: explicitPlatform,
      time,
      reason: explicitPlatform === "YouTube" ? `This idea fits YouTube because it is video-first, educational, or explainer-driven, and ${time} is when viewers are most likely to watch longer-form content.` :
        explicitPlatform === "TikTok" ? `This idea fits TikTok because it is short-form, launch-driven, or attention-grabbing, and ${time} is when users are most likely to discover fast-moving clips.` :
        explicitPlatform === "LinkedIn" ? `This idea fits LinkedIn because it is founder, business, or leadership-focused, and ${time} is when decision-makers are checking updates.` :
        `This idea fits ${explicitPlatform} because it matches the content format and audience behavior best, and ${time} is when that audience is most active.`,
    };
  }
}

module.exports = {
  generatePostPrompts,
  generatePostContent,
  generateIdeaRecommendation,
  isOllamaAvailable,
};
