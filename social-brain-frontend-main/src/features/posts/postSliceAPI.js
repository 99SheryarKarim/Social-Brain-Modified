// src/api/socialPostsAPI.js
import axios from "axios";

// Function to generate social posts
export const generateSocialPostAPI = async ({ input, selectedIdeas }) => {

  console.log("Arguments Test:", { input, selectedIdeas });
  try {
    const res = await axios.post(
      `http://localhost:3001/generate_posts_with_media`,
      {
        input: input,
        prompts: selectedIdeas,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Response from server INSIDE slicer API :", res.data.posts);
    return { success: true, data: res.data.posts };
  } catch (error) {
    console.error("Error generating social post:", error);
    console.error("Error generating social post:", error.message);
    throw new Error(
      "Failed to generate social post. Please check your connection and try again."
    );
  }
};
