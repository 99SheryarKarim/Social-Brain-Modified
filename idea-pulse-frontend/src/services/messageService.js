import axios from 'axios';

const BASE = 'http://localhost:3001/api/messages';

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

export const sendIdea = async (receiverId, content) => {
  const res = await axios.post(`${BASE}/send-idea`, { receiverId, content }, { headers: getHeaders() });
  return res.data;
};

export const fetchConversation = async (friendId) => {
  const res = await axios.get(`${BASE}/with/${friendId}`, { headers: getHeaders() });
  return res.data;
};

export const fetchFriendStreaks = async () => {
  const res = await axios.get(`${BASE}/streaks`, { headers: getHeaders() });
  return res.data;
};

export const fetchInbox = async () => {
  const res = await axios.get(`${BASE}/inbox`, { headers: getHeaders() });
  return res.data;
};
