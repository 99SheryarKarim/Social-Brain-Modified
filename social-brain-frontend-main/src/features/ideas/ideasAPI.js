// src/api/ideasAPI.js
import axios from "axios";

// Function to fetch ideas from FastAPI backend
export const fetchIdeasFromAPI = async (prompt, num_posts, tone, words) => {
  console.log("Fetching ideas with:", { prompt, num_posts, tone, words });

  try {
    const res = await axios.post(
      "http://localhost:8000/generate_ideas",
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

    // AI service returns: { post_prompts: [{ prompt, hashtags }, ...] }
    // The UI expects `text` to be a string.
    const postPrompts = res.data.post_prompts || [];
    return postPrompts.map((p) => (p && typeof p === "object" ? p.prompt : p));
  } catch (error) {
    console.log("Error fetching ideas:", error);
    throw new Error("Failed to fetch ideas");
  }
};
