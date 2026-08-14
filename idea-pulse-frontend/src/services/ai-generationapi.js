// src/services/ai-generationapi.js
import axios from "axios";

const API_BASE_URL = "http://localhost:3001/api";

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add interceptor to include auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Generate a social media post based on topic and tone
 * @param {string} topic - The topic for the post
 * @param {string} tone - The tone of the post (e.g., 'professional', 'casual', 'humorous')
 * @param {number} numWords - Target word count for the post (default: 150)
 * @returns {Promise} Response with generated post data
 */
export const generateSocialPost = async (topic, tone = "casual", numWords = 150) => {
  try {
    const response = await apiClient.post("/posts/generate", {
      topic,
      tone,
      numWords,
    });

    if (response.data.success) {
      return {
        success: true,
        data: {
          postId: response.data.data.postId,
          content: response.data.data.content,
          hashtags: response.data.data.hashtags,
          imagePrompt: response.data.data.imagePrompt,
          topic: response.data.data.topic,
          tone: response.data.data.tone,
          keywords: response.data.data.keywords,
        },
      };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to generate post",
      };
    }
  } catch (error) {
    console.error("Error generating social post:", error.message);
    return {
      success: false,
      error:
        error.response?.data?.error ||
        "Failed to generate social post. Please check your connection and try again.",
    };
  }
};

/**
 * Get all user's posts
 * @param {number} limit - Maximum posts to retrieve
 * @param {number} offset - Pagination offset
 * @returns {Promise} Response with posts and statistics
 */
export const getUserPosts = async (limit = 50, offset = 0) => {
  try {
    const response = await apiClient.get("/posts", {
      params: { limit, offset },
    });

    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
      };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to fetch posts",
      };
    }
  } catch (error) {
    console.error("Error fetching posts:", error.message);
    return {
      success: false,
      error:
        error.response?.data?.error ||
        "Failed to fetch posts. Please try again.",
    };
  }
};

/**
 * Get a specific post by ID
 * @param {number} postId - The post ID
 * @returns {Promise} Response with post details
 */
export const getPostById = async (postId) => {
  try {
    const response = await apiClient.get(`/posts/${postId}`);

    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
      };
    } else {
      return {
        success: false,
        error: response.data.error || "Post not found",
      };
    }
  } catch (error) {
    console.error("Error fetching post:", error.message);
    return {
      success: false,
      error:
        error.response?.data?.error ||
        "Failed to fetch post. Please try again.",
    };
  }
};

/**
 * Update a post
 * @param {number} postId - The post ID
 * @param {Object} updates - Fields to update (content, tone)
 * @returns {Promise} Response with updated post
 */
export const updatePost = async (postId, updates) => {
  try {
    const response = await apiClient.put(`/posts/${postId}`, updates);

    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
      };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to update post",
      };
    }
  } catch (error) {
    console.error("Error updating post:", error.message);
    return {
      success: false,
      error:
        error.response?.data?.error ||
        "Failed to update post. Please try again.",
    };
  }
};

/**
 * Delete a post
 * @param {number} postId - The post ID
 * @returns {Promise} Response indicating success/failure
 */
export const deletePost = async (postId) => {
  try {
    const response = await apiClient.delete(`/posts/${postId}`);

    if (response.data.success) {
      return {
        success: true,
        message: response.data.message,
      };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to delete post",
      };
    }
  } catch (error) {
    console.error("Error deleting post:", error.message);
    return {
      success: false,
      error:
        error.response?.data?.error ||
        "Failed to delete post. Please try again.",
    };
  }
};

/**
 * Mark a post as posted to Facebook
 * @param {number} postId - The post ID
 * @param {string} facebookPostId - The Facebook post ID
 * @returns {Promise} Response with updated post
 */
export const markAsPostedToFacebook = async (postId, facebookPostId) => {
  try {
    const response = await apiClient.patch(`/posts/${postId}/facebook`, {
      facebookPostId,
    });

    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
      };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to update post status",
      };
    }
  } catch (error) {
    console.error("Error updating post status:", error.message);
    return {
      success: false,
      error:
        error.response?.data?.error ||
        "Failed to update post status. Please try again.",
    };
  }
};

export default apiClient;

