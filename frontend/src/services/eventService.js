import api from './api';

const eventService = {
  // Get all events with filters
  getEvents: async (params = {}) => {
    try {
      const response = await api.get('/events', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get event details
  getEventById: async (id) => {
    try {
      const response = await api.get(`/events/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Register for event
  registerEvent: async (eventId, data = {}) => {
    try {
      const response = await api.post(`/registrations/${eventId}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Cancel registration
  cancelRegistration: async (registrationId, data) => {
    try {
      const response = await api.put(`/registrations/${registrationId}/cancel`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get my registrations
  getMyRegistrations: async (params = {}) => {
    try {
      const response = await api.get('/registrations/my/list', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Add feedback
  addFeedback: async (registrationId, data) => {
    try {
      const response = await api.put(`/registrations/${registrationId}/feedback`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get event posts
  getEventPosts: async (eventId, params = {}) => {
    try {
      const response = await api.get(`/posts/${eventId}`, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create post
  createPost: async (eventId, data) => {
    try {
      const response = await api.post(`/posts/${eventId}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update post
  updatePost: async (postId, data) => {
    try {
      const response = await api.put(`/posts/${postId}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete post
  deletePost: async (postId) => {
    try {
      const response = await api.delete(`/posts/${postId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Toggle like
  toggleLike: async (postId) => {
    try {
      const response = await api.put(`/posts/${postId}/like`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Add comment
  addComment: async (postId, data) => {
    try {
      const response = await api.post(`/posts/${postId}/comments`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete comment
  deleteComment: async (postId, commentId) => {
    try {
      const response = await api.delete(`/posts/${postId}/comments/${commentId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default eventService;