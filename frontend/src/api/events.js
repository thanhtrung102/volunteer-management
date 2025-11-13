// ============= src/api/events.js =============
import axios from './axios';

export const eventsAPI = {
  getAll: (params) => axios.get('/events', { params }),
  getById: (id) => axios.get(`/events/${id}`),
  register: (eventId, data) => axios.post(`/registrations/${eventId}`, data),
};
