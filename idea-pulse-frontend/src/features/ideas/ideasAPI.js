// src/api/ideasAPI.js
import axios from "axios";

export const fetchTrendMatch = async (niche) => {
  const token = localStorage.getItem('token');
  const res = await axios.get(`http://localhost:1000/api/trends?niche=${encodeURIComponent(niche || 'General')}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.matchedTrend || null;
};

// Function to fetch ideas from FastAPI backend
export const fetchIdeasFromAPI = async (prompt, num_posts, tone, words, model = "gemini-2.5-flash", useTrends = false) => {
  console.log("Fetching ideas with:", { prompt, num_posts, tone, words, model });

  try {
    const res = await axios.post(
      "http://localhost:1000/generate_ideas",
      {
        prompt: prompt,
        num_posts: num_posts,
        tone: tone,
        num_words: words,
        generate_image: false,
        model: model,
        useTrends,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Response from server:", res.data.post_prompts);

    // AI service returns: { post_prompts: [{ prompt, hashtags, recommendation }, ...], isMockData, dataSource }
    const postPrompts = res.data.post_prompts || [];
    const isMockData = res.data.isMockData || false;
    const dataSource = res.data.dataSource || "api";

    return {
      ideas: postPrompts.map((p) => (p && typeof p === "object" ? p.prompt : p)),
      recommendations: postPrompts.map((p) => (p && typeof p === "object" ? p.recommendation : null)),
      isMockData: isMockData,
      dataSource: dataSource,
      matchedTrend: res.data.matchedTrend || null,
    };
  } catch (error) {
    if (error.response?.data?.upgrade) {
      throw new Error('LIMIT_REACHED:' + error.response.data.message);
    }
    console.log("Error fetching ideas:", error);
    throw new Error("Failed to fetch ideas");
  }
};
