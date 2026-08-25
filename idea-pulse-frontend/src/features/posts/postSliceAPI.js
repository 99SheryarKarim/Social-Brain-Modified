import axios from "axios";

export const generateSocialPostAPI = async ({ input, selectedIdeas }) => {
  const token = localStorage.getItem('token');
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await axios.post(
    `http://localhost:1000/generate_posts_with_media`,
    { input, prompts: selectedIdeas },
    { headers }
  );
  return { success: true, data: res.data.posts };
};

export const fetchLibraryAPI = async () => {
  const token = localStorage.getItem('token');
  if (!token) return [];
  const res = await axios.get('http://localhost:1000/api/library', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const deletePostAPI = async (postId) => {
  const token = localStorage.getItem('token');
  await axios.delete(`http://localhost:1000/api/library/${postId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const schedulePostAPI = async (postId, scheduledAt, recommendedTimeBasis = null) => {
  const token = localStorage.getItem('token');
  const res = await axios.patch(`http://localhost:1000/api/library/${postId}/schedule`,
    { scheduled_at: scheduledAt, recommended_time_basis: recommendedTimeBasis },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

export const getRecommendedTimeAPI = async (platform = 'facebook') => {
  const token = localStorage.getItem('token');
  const res = await axios.get(`http://localhost:1000/api/recommended-time?platform=${encodeURIComponent(platform)}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const unschedulePostAPI = async (postId) => {
  const token = localStorage.getItem('token');
  const res = await axios.patch(`http://localhost:1000/api/library/${postId}/unschedule`, {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};
