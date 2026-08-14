import axios from 'axios';

const BASE = 'http://localhost:3001/api/activity';

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

export const saveActivity = async (type, description, meta = null) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return; // guest user, don't save
    await axios.post(BASE, { type, description, meta }, { headers: getHeaders() });
  } catch (err) {
    console.error('Failed to save activity:', err.message);
  }
};

export const fetchActivity = async () => {
  const res = await axios.get(BASE, { headers: getHeaders() });
  return res.data;
};
