const express = require('express');
const router = express.Router();
const {
  getVolunteerDashboard,
  getManagerDashboard,
  getAdminDashboard
} = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/dashboard/volunteer
router.get('/volunteer', protect, authorize('volunteer'), getVolunteerDashboard);

// @route   GET /api/dashboard/manager
router.get('/manager', protect, authorize('manager', 'admin'), getManagerDashboard);

// @route   GET /api/dashboard/admin
router.get('/admin', protect, authorize('admin'), getAdminDashboard);

module.exports = router;