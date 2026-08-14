import axios from 'axios';

const BASE = 'http://localhost:3001/api/notifications';

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

export const fetchNotifications = async () => {
  const res = await axios.get(BASE, { headers: getHeaders() });
  return res.data;
};

export const fetchUnreadCount = async () => {
  const res = await axios.get(`${BASE}/unread-count`, { headers: getHeaders() });
  return res.data.count;
};

export const markNotificationRead = async (id) => {
  await axios.patch(`${BASE}/${id}/read`, {}, { headers: getHeaders() });
};

export const markAllNotificationsRead = async () => {
  await axios.patch(`${BASE}/read-all`, {}, { headers: getHeaders() });
};
