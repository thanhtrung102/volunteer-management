// ============= src/api/notifications.js =============
import axios from './axios';

export const notificationsAPI = {
  getAll: (params) => axios.get('/notifications', { params }),
  getUnreadCount: () => axios.get('/notifications/unread-count'),
  markAsRead: (id) => axios.put(`/notifications/${id}/read`),
  markAllAsRead: () => axios.put('/notifications/mark-all-read'),
  delete: (id) => axios.delete(`/notifications/${id}`),
  clearAll: () => axios.delete('/notifications/clear-all'),
};