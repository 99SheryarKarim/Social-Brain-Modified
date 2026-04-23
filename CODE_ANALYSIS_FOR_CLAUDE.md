# KEY CODE FILES FOR DEBUGGING

## FILE 1: .env (Backend Configuration)
```
# SQLite Database Configuration
DB_PATH=./database/socialbrain.db

# Server Port
PORT=3001
NODE_ENV=development

# JWT Secret Key (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Google Generative AI (Gemini) - REQUIRED FOR POST GENERATION
# Get your API key from: https://aistudio.google.com/app/apikey
GOOGLE_API_KEY=AIzaSyDzENvCiOrefMJ-SUdVfm6vX2-KmedbUDs

# Facebook OAuth Configuration (Optional for social posting)
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
FACEBOOK_CALLBACK_URL=http://localhost:3001/api/facebook/callback
```

---

## FILE 2: src/services/geminiService.js (WHERE THE ERROR OCCURS)
```javascript
const { GoogleGenerativeAI } = require("@google/generative-ai");

// THIS LINE INITIALIZES THE API WITH THE KEY
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

/**
 * Extract keywords from user prompt using Gemini
 */
async function extractKeywords(userPrompt, limit = 25) {
  try {
    // THIS LINE GETS THE MODEL - THIS IS WHERE IT FAILS
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = \`You are a keyword extraction specialist. 
    
Based on the following topic: "\${userPrompt}"

Extract and return EXACTLY \${limit} relevant trending keywords related to this topic.

Rules:
- Return ONLY keywords, one per line
- No numbers, no bullet points, no dashes
- No explanations or additional text
- Each keyword should be 1-3 words
- Return exactly \${limit} keywords

Start now:\`;

    // THIS CALL RETURNS THE ERROR
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    const keywords = text
      .split("\n")
      .map((k) => k.trim())
      .filter((k) => k.length > 0)
      .slice(0, limit);

    return keywords;
  } catch (error) {
    // ERROR IS CAUGHT HERE
    console.error("Error extracting keywords:", error);
    throw new Error(\`Failed to extract keywords: \${error.message}\`);
  }
}

// Similar functions exist for generatePostPrompts and generatePostContent
// They all use the same genAI instance
```

---

## FILE 3: src/controllers/aiGenerationController.js (CALLS GEMINI SERVICE)
```javascript
const { extractKeywords, generatePostPrompts, generatePostContent } = require("../services/geminiService");

exports.generateIdeas = async (req, res) => {
  try {
    const { prompt, num_posts = 3, tone = "casual", num_words = 100, generate_image = false } = req.body;

    if (!prompt || prompt.trim().length === 0) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    console.log(\`🚀 Generating \${num_posts} ideas with tone "\${tone}" for prompt: "\${prompt}"\`);

    // THIS CALL FAILS - IT TRIES TO USE THE GOOGLE API
    const keywords = await extractKeywords(prompt, 10);
    console.log("Extracted keywords:", keywords);

    const postPrompts = await generatePostPrompts(prompt, keywords, tone, num_posts);
    console.log("Generated prompts:", postPrompts);

    const formattedPrompts = postPrompts.map((p) => ({
      prompt: p,
      hashtags: "",
    }));

    res.status(200).json({ post_prompts: formattedPrompts });
  } catch (error) {
    // ERROR IS CAUGHT HERE AND RETURNED AS 500
    console.error("Error generating ideas:", error);
    res.status(500).json({ error: error.message || "Failed to generate ideas" });
  }
};

exports.generatePostsWithMedia = async (req, res) => {
  try {
    const { input, prompts } = req.body;

    if (!prompts || !Array.isArray(prompts) || prompts.length === 0) {
      return res.status(400).json({ error: "Prompts array is required" });
    }

    console.log(\`🚀 Generating posts from \${prompts.length} prompts...\`);

    const posts = [];
    for (const prompt of prompts) {
      try {
        // THIS ALSO USES THE GOOGLE API
        const content = await generatePostContent(prompt, input?.tone || "casual", input?.num_words || 150);
        posts.push({
          prompt: prompt,
          content: content.content,
          hashtags: content.hashtags,
          imagePrompt: content.imagePrompt,
        });
      } catch (err) {
        console.error(\`Error generating post for prompt "\${prompt}":\`, err);
        posts.push({
          prompt: prompt,
          content: "Failed to generate content",
          hashtags: "",
          imagePrompt: "",
        });
      }
    }

    console.log(\`✅ Generated \${posts.length} posts\`);
    res.status(200).json({ posts: posts });
  } catch (error) {
    console.error("Error generating posts with media:", error);
    res.status(500).json({ error: error.message || "Failed to generate posts" });
  }
};
```

---

## FILE 4: src/features/ideas/ideasAPI.js (FRONTEND - CALLS BACKEND)
```javascript
import axios from "axios";

export const fetchIdeasFromAPI = async (prompt, num_posts, tone, words) => {
  console.log("Fetching ideas with:", { prompt, num_posts, tone, words });

  try {
    // THIS SENDS THE REQUEST TO BACKEND ENDPOINT
    const res = await axios.post(
      "http://localhost:3001/generate_ideas",  // ✅ CORRECT ENDPOINT
      {
        prompt: prompt,
        num_posts: num_posts,
        tone: tone,
        num_words: words,
        generate_image: false,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Response from server:", res.data.post_prompts);

    const postPrompts = res.data.post_prompts || [];
    return postPrompts.map((p) => (p && typeof p === "object" ? p.prompt : p));
  } catch (error) {
    // ERROR IS CAUGHT HERE
    console.error("Error fetching ideas:", error);
    throw new Error("Failed to fetch ideas");
  }
};
```

---

## FILE 5: package.json (DEPENDENCIES)
```json
{
  "name": "socialbrain",
  "version": "1.0.0",
  "description": "Social Brain AI Post Generator",
  "main": "src/server.js",
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "sqlite3": "^5.1.6",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.0",
    "@google/generative-ai": "latest",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3"
  },
  "devDependencies": {
    "nodemon": "^2.0.20"
  }
}
```

---

## THE ERROR CHAIN

```
1. Frontend calls: POST http://localhost:3001/generate_ideas
        ↓
2. Backend receives in aiGenerationController.js::generateIdeas()
        ↓
3. Calls: extractKeywords(prompt, 10)
        ↓
4. In geminiService.js, tries to initialize:
   const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
        ↓
5. Tries to get model:
   const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        ↓
6. Google API returns ERROR:
   "[400 Bad Request] API key expired. Please renew the API key."
        ↓
7. Error is caught in geminiService.js and re-thrown
        ↓
8. Error is caught in aiGenerationController.js
        ↓
9. Backend sends: res.status(500).json({ error: "..." })
        ↓
10. Frontend receives 500 error
        ↓
11. User sees: "Failed to fetch ideas" toast
```

---

## DEBUGGING CHECKLIST FOR CLAUDE

- [ ] Is the API key initialization correct?
- [ ] Are all required headers being sent?
- [ ] Is the model name spelled correctly? (`gemini-pro`)
- [ ] Should we use a different model name?
- [ ] Is there a configuration issue with GoogleGenerativeAI?
- [ ] Should we add retry logic?
- [ ] Should we have a fallback/mock data?
- [ ] Are we using the API correctly according to official docs?

---

## QUESTIONS FOR CLAUDE

1. **Is the Google API being initialized correctly?**
   - The code: `const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);`
   - Is this the right way to do it?

2. **What could cause "API key expired" if the key was just created?**
   - Is there a caching issue?
   - Does Google have a validation delay?
   - Is there a permission issue?

3. **Should we verify the API key differently?**
   - Should we log the key to verify it's being read?
   - Are there any headers we're missing?

4. **What are alternative solutions?**
   - Use a different AI API (OpenAI, Anthropic, etc.)?
   - Use mock data for development?
   - Implement error recovery?

---

**Thank you for reviewing this code, Claude! 🙏**
