/**
 * Calendar Service
 * Handles all API calls for calendar functionality
 */

const API_BASE_URL = 'http://localhost:3001/api';

/**
 * Get all scheduled posts for the logged-in user
 */
export const getScheduledPosts = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/scheduled-posts/get-posts`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch scheduled posts');
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching scheduled posts:', error);
    throw error;
  }
};

/**
 * Get all user's posts (generated)
 */
export const getUserPosts = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/posts`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user posts');
    }

    const data = await response.json();
    return data.data?.posts || [];
  } catch (error) {
    console.error('Error fetching user posts:', error);
    throw error;
  }
};

/**
 * Create a new post
 */
export const createPost = async (token, postData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/posts/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create post');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

/**
 * Schedule a post to be posted on a specific date
 */
export const schedulePost = async (token, scheduleData) => {
  try {
    const formData = new FormData();
    
    // Add text fields
    formData.append('content', scheduleData.content);
    formData.append('scheduledTime', scheduleData.scheduledTime);
    formData.append('platform', scheduleData.platform || 'facebook');
    
    // Add optional fields
    if (scheduleData.postId) {
      formData.append('postId', scheduleData.postId);
    }
    if (scheduleData.tone) {
      formData.append('tone', scheduleData.tone);
    }

    const response = await fetch(`${API_BASE_URL}/scheduled-posts/schedule`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to schedule post');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error scheduling post:', error);
    throw error;
  }
};

/**
 * Update a post
 */
export const updatePost = async (token, postId, updates) => {
  try {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error('Failed to update post');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error updating post:', error);
    throw error;
  }
};

/**
 * Delete a post
 */
export const deletePost = async (token, postId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete post');
    }

    return true;
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
};

/**
 * Mark post as posted to Facebook
 */
export const markAsPostedToFacebook = async (token, postId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/facebook`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to mark post as posted');
    }

    return true;
  } catch (error) {
    console.error('Error marking post as posted:', error);
    throw error;
  }
};
