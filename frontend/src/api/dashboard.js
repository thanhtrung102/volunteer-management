// ============= src/api/dashboard.js =============
import axios from './axios';

export const dashboardAPI = {
  getVolunteerDashboard: () => axios.get('/dashboard/volunteer'),
};