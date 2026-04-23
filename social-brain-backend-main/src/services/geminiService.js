const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

/**
 * Extract keywords from user prompt using Gemini
 * @param {string} userPrompt - The user's topic/prompt
 * @param {number} limit - Maximum number of keywords to extract
 * @returns {Promise<string[]>} Array of extracted keywords
 */
async function extractKeywords(userPrompt, limit = 25) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are a keyword extraction specialist. 
    
Based on the following topic: "${userPrompt}"

Extract and return EXACTLY ${limit} relevant trending keywords related to this topic.

Rules:
- Return ONLY keywords, one per line
- No numbers, no bullet points, no dashes
- No explanations or additional text
- Each keyword should be 1-3 words
- Return exactly ${limit} keywords

Start now:`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Parse the response into an array of keywords
    const keywords = text
      .split("\n")
      .map((k) => k.trim())
      .filter((k) => k.length > 0)
      .slice(0, limit);

    return keywords;
  } catch (error) {
    // Check if quota exceeded (429 error)
    if (error.message.includes("429") || error.message.includes("quota")) {
      console.warn("⚠️  Gemini API quota exceeded. Using mock keywords for development.");
      const mockKeywords = [
        `${userPrompt} tips`,
        `${userPrompt} trends`,
        `best ${userPrompt}`,
        `${userPrompt} guide`,
        `${userPrompt} ideas`,
        "social media",
        "content creation",
        "engagement",
        "viral content",
        "digital marketing",
        `${userPrompt} benefits`,
        `${userPrompt} strategy`,
        `${userPrompt} hacks`,
        `${userPrompt} mistakes`,
        `why ${userPrompt}`,
      ];
      return mockKeywords.slice(0, limit);
    }
    console.error("Error extracting keywords:", error);
    throw new Error(`Failed to extract keywords: ${error.message}`);
  }
}

/**
 * Generate post prompts based on topic, keywords, and tone
 * @param {string} userPrompt - The user's topic
 * @param {string[]} keywords - Array of keywords to incorporate
 * @param {string} tone - Desired tone (e.g., professional, casual, humorous)
 * @param {number} numPosts - Number of post prompts to generate
 * @returns {Promise<string[]>} Array of post prompts
 */
async function generatePostPrompts(userPrompt, keywords, tone, numPosts) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const keywordList = keywords.join(", ");

    const prompt = `You are a creative social media strategist and content planner.

Based on the following:
- User Topic: ${userPrompt}
- Trending Keywords: ${keywordList}
- Tone: ${tone}
- Number of Posts: ${numPosts}

Generate ${numPosts} UNIQUE and engaging social media post prompts.

Rules:
- Incorporate multiple trending keywords into each post idea (at least 2 per post)
- Match the tone: ${tone}
- Write briefly about the post structure and things to include (7 sentences max)
- Each post should be unique and not repetitive
- Specify that each post is text-based

Format each post as:
POST [number]: [Brief description of the post idea]
KEYWORDS: [List keywords used]
---

Start now:`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Parse the response to extract individual post prompts
    const postPrompts = parsePostPrompts(text, numPosts);
    return postPrompts;
  } catch (error) {
    // Check if quota exceeded (429 error)
    if (error.message.includes("429") || error.message.includes("quota")) {
      console.warn("⚠️  Gemini API quota exceeded. Using mock post prompts for development.");
      const mockPrompts = [
        `Create a ${tone} post about "${userPrompt}" focusing on ${keywords[0] || "trends"} and ${keywords[1] || "engagement"}. Share practical tips.`,
        `Write a ${tone} post about "${userPrompt}" that highlights ${keywords[2] || "benefits"} and ${keywords[3] || "results"}. Make it relatable.`,
        `Compose a ${tone} post about "${userPrompt}" incorporating ${keywords[4] || "best practices"} and ${keywords[5] || "success stories"}.`,
        `Draft a ${tone} post about "${userPrompt}" that discusses ${keywords[6] || "common mistakes"} and solutions.`,
        `Create a ${tone} post about "${userPrompt}" using ${keywords[7] || "real examples"} and actionable advice.`,
      ];
      return mockPrompts.slice(0, numPosts);
    }
    console.error("Error generating post prompts:", error);
    throw new Error(`Failed to generate post prompts: ${error.message}`);
  }
}

/**
 * Generate actual post content based on a post prompt
 * @param {string} postPrompt - The post prompt/idea
 * @param {string} tone - Desired tone
 * @param {number} numWords - Target number of words (default: 150)
 * @returns {Promise<Object>} Object containing post content, hashtags, and image prompt
 */
async function generatePostContent(postPrompt, tone, numWords = 150) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are a professional social media content creator.

Based on the following:
- Post Prompt: ${postPrompt}
- Tone: ${tone}
- Target Word Count: ${numWords} words

Generate a high-quality social media post.

Rules:
- Ensure the post adheres to the specified tone: ${tone}
- The post should be approximately ${numWords} words
- Include a call-to-action (CTA) at the end of the post
- Use engaging language to capture the audience's attention
- Include 3-5 relevant hashtags at the end

Also generate a detailed image prompt for the post:
- The image prompt should be visually appealing and relevant to the post content
- Include details about colors, style, and specific elements
- The image prompt should be suitable for Instagram, Facebook, or Twitter
- Keep it to 2-4 sentences

Format your response EXACTLY as follows (use these exact section headers):
POST CONTENT:
[Write the post here]

HASHTAGS:
[List hashtags here, separated by spaces]

IMAGE PROMPT:
[Describe the image here]

Start now:`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Parse the structured response
    const parsed = parsePostContent(text);
    return parsed;
  } catch (error) {
    // Check if quota exceeded (429 error)
    if (error.message.includes("429") || error.message.includes("quota")) {
      console.warn("⚠️  Gemini API quota exceeded. Using mock post content for development.");
      return {
        content: `This is a ${tone} post about: ${postPrompt.substring(0, 100)}...

${tone === "professional" ? "Professional insights and proven strategies for success." : ""}
${tone === "casual" ? "Check this out! Some awesome tips you'll love." : ""}
${tone === "humorous" ? "Here's something hilarious and surprisingly useful about this topic!" : ""}

Don't miss out on these amazing opportunities!`,
        hashtags: "#Development #MockData #Testing #SocialMedia #Trending",
        imagePrompt: "A vibrant, modern design representing the topic with bright colors, clean typography, and engaging visuals suitable for social media. Professional yet eye-catching aesthetic."
      };
    }
    console.error("Error generating post content:", error);
    throw new Error(`Failed to generate post content: ${error.message}`);
  }
}

/**
 * Main function to generate a complete social media post from topic
 * @param {string} topic - User's topic/idea
 * @param {string} tone - Desired tone
 * @param {number} numWords - Target word count
 * @returns {Promise<Object>} Complete post object with content and metadata
 */
async function generateCompletePost(topic, tone, numWords = 150) {
  try {
    console.log("🔄 Extracting keywords from topic...");
    const keywords = await extractKeywords(topic, 25);

    console.log("🔄 Generating post prompt...");
    const postPrompts = await generatePostPrompts(topic, keywords, tone, 1);
    const postPrompt = postPrompts[0];

    console.log("🔄 Generating post content...");
    const postContent = await generatePostContent(postPrompt, tone, numWords);

    return {
      topic,
      tone,
      keywords,
      postPrompt,
      ...postContent,
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error in generateCompletePost:", error);
    throw error;
  }
}

/**
 * Helper function to parse post prompts from Gemini response
 */
function parsePostPrompts(text, numPosts) {
  const prompts = [];
  const lines = text.split("\n");
  let currentPrompt = "";

  for (const line of lines) {
    if (line.startsWith("POST") && line.includes(":")) {
      if (currentPrompt) {
        prompts.push(currentPrompt.trim());
      }
      currentPrompt = line.replace(/^POST\s+\d+:\s*/, "");
    } else if (line.startsWith("KEYWORDS:")) {
      if (currentPrompt) {
        currentPrompt += " " + line;
      }
    } else if (line.startsWith("---")) {
      if (currentPrompt) {
        prompts.push(currentPrompt.trim());
      }
      currentPrompt = "";
    } else if (currentPrompt) {
      currentPrompt += " " + line;
    }
  }

  if (currentPrompt) {
    prompts.push(currentPrompt.trim());
  }

  return prompts.slice(0, numPosts);
}

/**
 * Helper function to parse structured post content response
 */
function parsePostContent(text) {
  const sections = {
    content: "",
    hashtags: "",
    imagePrompt: "",
  };

  const contentMatch = text.match(
    /POST CONTENT:\s*([\s\S]*?)(?=HASHTAGS:|$)/i
  );
  const hashtagMatch = text.match(
    /HASHTAGS:\s*([\s\S]*?)(?=IMAGE PROMPT:|$)/i
  );
  const imageMatch = text.match(/IMAGE PROMPT:\s*([\s\S]*?)$/i);

  if (contentMatch) {
    sections.content = contentMatch[1].trim();
  }
  if (hashtagMatch) {
    sections.hashtags = hashtagMatch[1].trim();
  }
  if (imageMatch) {
    sections.imagePrompt = imageMatch[1].trim();
  }

  return {
    content: sections.content,
    hashtags: sections.hashtags,
    imagePrompt: sections.imagePrompt,
  };
}

/**
 * Extract keywords with mock tracking
 * Returns { keywords, isMock }
 */
async function extractKeywordsWithTracking(userPrompt, limit = 25) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `You are a keyword extraction specialist. 
    
Based on the following topic: "${userPrompt}"

Extract and return EXACTLY ${limit} relevant trending keywords related to this topic.

Rules:
- Return ONLY keywords, one per line
- No numbers, no bullet points, no dashes
- No explanations or additional text
- Each keyword should be 1-3 words
- Return exactly ${limit} keywords

Start now:`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const keywords = text
      .split("\n")
      .map((k) => k.trim())
      .filter((k) => k.length > 0)
      .slice(0, limit);

    return { keywords, isMock: false };
  } catch (error) {
    if (error.message.includes("429") || error.message.includes("quota")) {
      console.warn("⚠️  Using mock keywords - API quota exceeded");
      const mockKeywords = [
        `${userPrompt} tips`,
        `${userPrompt} trends`,
        `best ${userPrompt}`,
        `${userPrompt} guide`,
        `${userPrompt} ideas`,
        "social media",
        "content creation",
        "engagement",
        "viral content",
        "digital marketing",
        `${userPrompt} benefits`,
        `${userPrompt} strategy`,
        `${userPrompt} hacks`,
        `${userPrompt} mistakes`,
        `why ${userPrompt}`,
      ];
      return { keywords: mockKeywords.slice(0, limit), isMock: true };
    }
    throw error;
  }
}

/**
 * Generate post prompts with mock tracking
 * Returns { prompts, isMock }
 */
async function generatePostPromptsWithTracking(userPrompt, keywords, tone, numPosts) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const keywordList = keywords.join(", ");
    const prompt = `You are a creative social media strategist and content planner.

Based on the following:
- User Topic: ${userPrompt}
- Trending Keywords: ${keywordList}
- Tone: ${tone}
- Number of Posts: ${numPosts}

Generate ${numPosts} UNIQUE and engaging social media post prompts.

Rules:
- Incorporate multiple trending keywords into each post idea (at least 2 per post)
- Match the tone: ${tone}
- Write briefly about the post structure and things to include (7 sentences max)
- Each post should be unique and not repetitive
- Specify that each post is text-based

Format each post as:
POST [number]: [Brief description of the post idea]
KEYWORDS: [List keywords used]
---

Start now:`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const prompts = parsePostPrompts(text, numPosts);
    return { prompts, isMock: false };
  } catch (error) {
    if (error.message.includes("429") || error.message.includes("quota")) {
      console.warn("⚠️  Using mock post prompts - API quota exceeded");
      const mockPrompts = [
        `Create a ${tone} post about "${userPrompt}" focusing on ${keywords[0] || "trends"} and ${keywords[1] || "engagement"}. Share practical tips.`,
        `Write a ${tone} post about "${userPrompt}" that highlights ${keywords[2] || "benefits"} and ${keywords[3] || "results"}. Make it relatable.`,
        `Compose a ${tone} post about "${userPrompt}" incorporating ${keywords[4] || "best practices"} and ${keywords[5] || "success stories"}.`,
        `Draft a ${tone} post about "${userPrompt}" that discusses ${keywords[6] || "common mistakes"} and solutions.`,
        `Create a ${tone} post about "${userPrompt}" using ${keywords[7] || "real examples"} and actionable advice.`,
      ];
      return { prompts: mockPrompts.slice(0, numPosts), isMock: true };
    }
    throw error;
  }
}

/**
 * Generate post content with mock tracking
 * Returns { content, isMock }
 */
async function generatePostContentWithTracking(postPrompt, tone, numWords = 150) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `You are a professional social media content creator.

Based on the following:
- Post Prompt: ${postPrompt}
- Tone: ${tone}
- Target Word Count: ${numWords} words

Generate a high-quality social media post.

Rules:
- Ensure the post adheres to the specified tone: ${tone}
- The post should be approximately ${numWords} words
- Include a call-to-action (CTA) at the end of the post
- Use engaging language to capture the audience's attention
- Include 3-5 relevant hashtags at the end

Also generate a detailed image prompt for the post:
- The image prompt should be visually appealing and relevant to the post content
- Include details about colors, style, and specific elements
- The image prompt should be suitable for Instagram, Facebook, or Twitter
- Keep it to 2-4 sentences

Format your response EXACTLY as follows (use these exact section headers):
POST CONTENT:
[Write the post here]

HASHTAGS:
[List hashtags here, separated by spaces]

IMAGE PROMPT:
[Describe the image here]

Start now:`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = parsePostContent(text);
    return { ...parsed, isMock: false };
  } catch (error) {
    if (error.message.includes("429") || error.message.includes("quota")) {
      console.warn("⚠️  Using mock post content - API quota exceeded");
      return {
        content: `This is a ${tone} post about: ${postPrompt.substring(0, 100)}...

${tone === "professional" ? "Professional insights and proven strategies for success." : ""}
${tone === "casual" ? "Check this out! Some awesome tips you'll love." : ""}
${tone === "humorous" ? "Here's something hilarious and surprisingly useful about this topic!" : ""}

Don't miss out on these amazing opportunities!`,
        hashtags: "#Development #MockData #Testing #SocialMedia #Trending",
        imagePrompt: "A vibrant, modern design representing the topic with bright colors, clean typography, and engaging visuals suitable for social media. Professional yet eye-catching aesthetic.",
        isMock: true
      };
    }
    throw error;
  }
}

module.exports = {
  extractKeywords,
  generatePostPrompts,
  generatePostContent,
  generateCompletePost,
  extractKeywordsWithTracking,
  generatePostPromptsWithTracking,
  generatePostContentWithTracking,
};
