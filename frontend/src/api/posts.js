// ============= src/api/posts.js =============
import axios from './axios';

export const postsAPI = {
  getEventPosts: (eventId, params) => axios.get(`/posts/${eventId}`, { params }),
  create: (eventId, data) => axios.post(`/posts/${eventId}`, data),
  update: (id, data) => axios.put(`/posts/${id}`, data),
  delete: (id) => axios.delete(`/posts/${id}`),
  toggleLike: (id) => axios.put(`/posts/${id}/like`),
  addComment: (id, data) => axios.post(`/posts/${id}/comments`, data),
  deleteComment: (postId, commentId) => 
    axios.delete(`/posts/${postId}/comments/${commentId}`),
};