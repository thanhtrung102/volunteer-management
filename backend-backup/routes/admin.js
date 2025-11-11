const express = require('express');
const router = express.Router();
const {
  // User Management
  getAllUsers,
  getUserDetails,
  updateUser,
  toggleUserActive,
  changeUserRole,
  deleteUser,
  // Event Management
  approveEvent,
  deleteEvent,
  // Data Export
  exportUsers,
  exportEvents,
  exportVolunteers
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const {
  adminUpdateUserSchema,
  changeRoleSchema,
  approveEventSchema
} = require('../utils/validators');

// Tất cả routes yêu cầu Admin role
router.use(protect, authorize('admin'));

// ==================== USER MANAGEMENT ====================

// @route   GET /api/admin/users
// @desc    Lấy danh sách tất cả users
router.get('/users', getAllUsers);

// @route   GET /api/admin/users/:id
// @desc    Lấy chi tiết user
router.get('/users/:id', getUserDetails);

// @route   PUT /api/admin/users/:id
// @desc    Cập nhật user
router.put('/users/:id', validate(adminUpdateUserSchema), updateUser);

// @route   PUT /api/admin/users/:id/toggle-active
// @desc    Khóa/Mở khóa user
router.put('/users/:id/toggle-active', toggleUserActive);

// @route   PUT /api/admin/users/:id/change-role
// @desc    Đổi role user
router.put('/users/:id/change-role', validate(changeRoleSchema), changeUserRole);

// @route   DELETE /api/admin/users/:id
// @desc    Xóa user
router.delete('/users/:id', deleteUser);

// ==================== EVENT MANAGEMENT ====================

// @route   PUT /api/admin/events/:id/approve
// @desc    Duyệt/Từ chối sự kiện
router.put('/events/:id/approve', validate(approveEventSchema), approveEvent);

// @route   DELETE /api/admin/events/:id
// @desc    Xóa sự kiện
router.delete('/events/:id', deleteEvent);

// ==================== DATA EXPORT ====================

// @route   GET /api/admin/export/users
// @desc    Export danh sách users (JSON/CSV)
router.get('/export/users', exportUsers);

// @route   GET /api/admin/export/events
// @desc    Export danh sách events (JSON/CSV)
router.get('/export/events', exportEvents);

// @route   GET /api/admin/export/volunteers
// @desc    Export danh sách volunteers (JSON/CSV)
router.get('/export/volunteers', exportVolunteers);

module.exports = router;