import axios from 'axios';

const BASE = 'http://localhost:1000/api/friends';

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

export const fetchAllUsers = async () => {
  const res = await axios.get(`${BASE}/users`, { headers: getHeaders() });
  return res.data;
};

export const searchUsers = async (query) => {
  const res = await axios.get(`${BASE}/search?query=${encodeURIComponent(query)}`, { headers: getHeaders() });
  return res.data;
};

export const fetchFriends = async () => {
  const res = await axios.get(`${BASE}/list`, { headers: getHeaders() });
  return res.data;
};

export const fetchPendingRequests = async () => {
  const res = await axios.get(`${BASE}/pending`, { headers: getHeaders() });
  return res.data;
};

export const sendFriendRequest = async (friendId) => {
  const res = await axios.post(`${BASE}/request`, { friendId }, { headers: getHeaders() });
  return res.data;
};

export const acceptFriendRequest = async (friendId) => {
  const res = await axios.post(`${BASE}/accept`, { friendId }, { headers: getHeaders() });
  return res.data;
};

export const rejectFriendRequest = async (friendId) => {
  const res = await axios.post(`${BASE}/reject`, { friendId }, { headers: getHeaders() });
  return res.data;
};
