const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function generatePostPrompts(userTopic, tone, numPosts, brandSettings = {}, selectedModel = "gemini-2.5-flash") {
  const model = genAI.getGenerativeModel({ model: selectedModel });

  const brandContext = brandSettings.brand_description
    ? `\nYou are creating content for: ${brandSettings.brand_description}`
    : '';
  const audienceContext = brandSettings.target_audience
    ? `\nTarget audience: ${brandSettings.target_audience}`
    : '';

  const prompt = `You are an AI Social Media Manager.${brandContext}${audienceContext}

The user wants ${numPosts} social media post ideas about: "${userTopic}"
Tone: ${tone}

Generate exactly ${numPosts} distinct post ideas. Each idea must be directly about "${userTopic}"${brandSettings.brand_description ? ` and relevant to ${brandSettings.brand_description}` : ''}.

Rules:
- Every idea MUST be about "${userTopic}"
- Each idea must be a complete idea, not a title or headline
- Be specific, practical, and actionable
- Write 1-2 full sentences with enough detail to be useful to a creator
- Use 20-40 words per idea
- Avoid single-word or fragment-style outputs like "Behind-the-Scenes Vlogs"
${brandSettings.target_audience ? `- Keep ${brandSettings.target_audience} in mind` : ''}

Format exactly like this:
IDEA 1: [full idea in 1-2 complete sentences]
IDEA 2: [full idea in 1-2 complete sentences]
IDEA 3: [full idea in 1-2 complete sentences]`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  const ideas = [];
  const lines = text.split("\n");
  for (const line of lines) {
    const match = line.match(/^IDEA\s*\d+:\s*(.+)/i);
    if (match) ideas.push(match[1].trim());
    if (ideas.length >= numPosts) break;
  }

  if (ideas.length === 0) {
    return text.split("\n").filter(l => l.trim().length > 10).slice(0, numPosts);
  }

  return ideas;
}

async function generatePostContent(idea, tone, numWords, originalTopic, brandSettings = {}, selectedModel = "gemini-2.5-flash") {
  const model = genAI.getGenerativeModel({ model: selectedModel });

  const brandContext = brandSettings.brand_description
    ? `\nYou are an AI Social Media Manager for: ${brandSettings.brand_description}`
    : '\nYou are an AI Social Media Manager.';
  const audienceContext = brandSettings.target_audience
    ? `\nTarget audience: ${brandSettings.target_audience}`
    : '';

  const prompt = `${brandContext}${audienceContext}

Write a social media post with these requirements:
- Topic: "${originalTopic}"
- Post idea: "${idea}"
- Tone: ${tone}
- Length: approximately ${numWords} words
- The post MUST be about "${originalTopic}"${brandSettings.brand_description ? ` and align with ${brandSettings.brand_description}` : ''}
${brandSettings.target_audience ? `- Write specifically for ${brandSettings.target_audience}` : ''}
- Be direct, practical, and engaging
- End with a call-to-action

---CONTENT_START---
[write post here]
---CONTENT_END---

---HASHTAGS_START---
[ONLY 3-5 hashtags, each starting with #, space-separated on ONE line. Example: #Gaming #Tips #PlayStation #Esports. NO other text, NO sentences, ONLY hashtags]
---HASHTAGS_END---

---IMAGE_PROMPT_START---
[2-3 keywords describing a relevant image for this post, e.g: "gaming setup RGB" or "football stadium crowd"]
---IMAGE_PROMPT_END---`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  const contentMatch = text.match(/---CONTENT_START---\s*([\s\S]*?)\s*---CONTENT_END---/i);
  const hashtagMatch = text.match(/---HASHTAGS_START---\s*([\s\S]*?)\s*---HASHTAGS_END---/i);
  const imageMatch = text.match(/---IMAGE_PROMPT_START---\s*([\s\S]*?)\s*---IMAGE_PROMPT_END---/i);

  // Extract only valid hashtags (words starting with #)
  const rawHashtags = hashtagMatch ? hashtagMatch[1].trim() : '';
  const cleanHashtags = rawHashtags
    .split(/[\s,\n]+/)
    .filter(w => w.startsWith('#') && w.length > 1)
    .slice(0, 5)
    .join(' ');

  return {
    content: contentMatch ? contentMatch[1].trim() : text.trim(),
    hashtags: cleanHashtags || `#${originalTopic.replace(/\s+/g, '')}`,
    imagePrompt: imageMatch ? imageMatch[1].trim() : originalTopic,
  };
}

async function extractKeywordsWithTracking(userPrompt) {
  return { keywords: [userPrompt], isMock: false };
}

function normalizeRecommendation(rawRecommendation = {}) {
  const platform = rawRecommendation.platform || rawRecommendation.bestPlatform || "Instagram";
  const time = rawRecommendation.time || rawRecommendation.bestTime || "Tue–Thu, 7:00–9:00 PM";
  const reason = rawRecommendation.reason || rawRecommendation.description || "This format is best for engagement and visibility on this platform during active audience hours.";

  return {
    platform: String(platform).trim() || "Instagram",
    time: String(time).trim() || "Tue–Thu, 7:00–9:00 PM",
    reason: String(reason).trim() || "This format is best for engagement and visibility on this platform during active audience hours.",
  };
}

async function generateIdeaRecommendation(idea, originalTopic = "", tone = "casual", selectedModel = "gemini-2.5-flash") {
  try {
    const model = genAI.getGenerativeModel({ model: selectedModel });
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

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleaned = responseText.replace(/```json|```/gi, "").trim();

    const match = cleaned.match(/\{[\s\S]*\}/);
    const jsonText = match ? match[0] : cleaned;
    const parsed = JSON.parse(jsonText);

    return normalizeRecommendation(parsed);
  } catch (error) {
    console.warn(`Idea recommendation generation failed for model ${selectedModel}:`, error.message);
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

async function generatePostPromptsWithTracking(userTopic, _keywords, tone, numPosts, brandSettings, selectedModel = "gemini-2.5-flash") {
  try {
    const prompts = await generatePostPrompts(userTopic, tone, numPosts, brandSettings, selectedModel);
    return { prompts, isMock: false, provider: "gemini" };
  } catch (error) {
    if (error.message.includes("429") || error.message.includes("quota")) {
      const mock = Array.from({ length: numPosts }, (_, i) =>
        `Post idea ${i + 1} about ${userTopic}`
      );
      return { prompts: mock, isMock: true, provider: "gemini" };
    }
    throw error;
  }
}

async function generatePostContentWithTracking(idea, tone, numWords = 150, originalTopic = "", brandSettings = {}, selectedModel = "gemini-2.5-flash") {
  try {
    const result = await generatePostContent(idea, tone, numWords, originalTopic || idea, brandSettings, selectedModel);
    return { ...result, isMock: false, provider: "gemini" };
  } catch (error) {
    if (error.message.includes("429") || error.message.includes("quota")) {
      return {
        content: `A ${tone} post about ${originalTopic || idea}.`,
        hashtags: `#${(originalTopic || idea).replace(/\s+/g, "")}`,
        imagePrompt: `Image about ${originalTopic || idea}`,
        isMock: true,
        provider: "gemini",
      };
    }
    throw error;
  }
}

module.exports = {
  extractKeywordsWithTracking,
  generatePostPromptsWithTracking,
  generatePostContentWithTracking,
  generateIdeaRecommendation,
};
