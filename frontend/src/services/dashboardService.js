import api from './api';

const dashboardService = {
  // Get volunteer dashboard
  getVolunteerDashboard: async () => {
    try {
      const response = await api.get('/dashboard/volunteer');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get notifications
  getNotifications: async (params = {}) => {
    try {
      const response = await api.get('/notifications', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get unread count
  getUnreadCount: async () => {
    try {
      const response = await api.get('/notifications/unread-count');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Mark as read
  markAsRead: async (notificationId) => {
    try {
      const response = await api.put(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Mark all as read
  markAllAsRead: async () => {
    try {
      const response = await api.put('/notifications/mark-all-read');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    try {
      const response = await api.delete(`/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Clear all notifications
  clearAll: async () => {
    try {
      const response = await api.delete('/notifications/clear-all');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default dashboardService;