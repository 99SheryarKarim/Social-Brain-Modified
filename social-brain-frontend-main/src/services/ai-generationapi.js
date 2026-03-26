// src/services/api.js
import axios from "axios";

// export const fetchIdeas = async () => {
//   try {
//     const res = await axios.get(
//       "https://jsonplaceholder.typicode.com/posts?_limit=5"
//     );
//     const titles = res.data.map((post) => post.title);
//     return { success: true, data: titles };
//   } catch (error) {
//     console.error("Error fetching ideas:", error.message);
//     return {
//       success: false,
//       error:
//         "Failed to fetch ideas. Please check your connection and try again.",
//     };
//   }
// };

export const generateSocialPost = async (data) => {
  console.log("Generating social post with data:", data);
  try {
    const res = await axios.post(
      "http://localhost:8000/generate_post",
      {
        prompt: "impacts of ai",
        num_posts: 1,
        tone: null,
        num_words: 50,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Response from server:", res.data);
    return { success: true, data: res.data.posts };
  } catch (error) {
    console.error("Error generating social post:", error.message);
    return {
      success: false,
      error:
        "Failed to generate social post. Please check your connection and try again.",
      data: { data: null},
    };
  }
};
