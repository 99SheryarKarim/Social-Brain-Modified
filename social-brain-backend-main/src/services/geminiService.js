const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function generatePostPrompts(userTopic, tone, numPosts, brandSettings = {}) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const brandContext = brandSettings.brand_description
    ? `\nYou are creating content for: ${brandSettings.brand_description}`
    : '';
  const audienceContext = brandSettings.target_audience
    ? `\nTarget audience: ${brandSettings.target_audience}`
    : '';

  const prompt = `You are an AI Social Media Manager.${brandContext}${audienceContext}

The user wants ${numPosts} social media post ideas about: "${userTopic}"
Tone: ${tone}

Generate exactly ${numPosts} short, specific post ideas. Each idea must be directly about "${userTopic}"${brandSettings.brand_description ? ` and relevant to ${brandSettings.brand_description}` : ''}.

Rules:
- Every idea MUST be about "${userTopic}"
- Be specific and practical, not abstract or poetic
- Each idea should be 1-2 sentences max
${brandSettings.target_audience ? `- Keep ${brandSettings.target_audience} in mind` : ''}

Format exactly like this:
IDEA 1: [idea here]
IDEA 2: [idea here]
IDEA 3: [idea here]`;

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

async function generatePostContent(idea, tone, numWords, originalTopic, brandSettings = {}) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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

async function generatePostPromptsWithTracking(userTopic, _keywords, tone, numPosts, brandSettings) {
  try {
    const prompts = await generatePostPrompts(userTopic, tone, numPosts, brandSettings);
    return { prompts, isMock: false };
  } catch (error) {
    if (error.message.includes("429") || error.message.includes("quota")) {
      const mock = Array.from({ length: numPosts }, (_, i) =>
        `Post idea ${i + 1} about ${userTopic}`
      );
      return { prompts: mock, isMock: true };
    }
    throw error;
  }
}

async function generatePostContentWithTracking(idea, tone, numWords = 150, originalTopic = "", brandSettings = {}) {
  try {
    const result = await generatePostContent(idea, tone, numWords, originalTopic || idea, brandSettings);
    return { ...result, isMock: false };
  } catch (error) {
    if (error.message.includes("429") || error.message.includes("quota")) {
      return {
        content: `A ${tone} post about ${originalTopic || idea}.`,
        hashtags: `#${(originalTopic || idea).replace(/\s+/g, "")}`,
        imagePrompt: `Image about ${originalTopic || idea}`,
        isMock: true,
      };
    }
    throw error;
  }
}

module.exports = {
  extractKeywordsWithTracking,
  generatePostPromptsWithTracking,
  generatePostContentWithTracking,
};
