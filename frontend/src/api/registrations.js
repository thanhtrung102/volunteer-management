// ============= src/api/registrations.js =============
import axios from './axios';

export const registrationsAPI = {
  getMyRegistrations: (params) => axios.get('/registrations/my/list', { params }),
  cancel: (id, data) => axios.put(`/registrations/${id}/cancel`, data),
  addFeedback: (id, data) => axios.put(`/registrations/${id}/feedback`, data),
};