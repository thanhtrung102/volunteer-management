const express = require('express');
const router = express.Router();
const {
  approveRegistration,
  completeBatchRegistrations,
  getEventReport,
  getEventVolunteers,
  updateEventStatus
} = require('../controllers/managerController');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const {
  approveRegistrationSchema,
  completeRegistrationSchema,
  reportFiltersSchema
} = require('../utils/validators');

// Tất cả routes yêu cầu Manager hoặc Admin role

// @route   PUT /api/manager/registrations/:id/approve
// @desc    Xác nhận hoặc từ chối đăng ký
router.put(
  '/registrations/:id/approve',
  protect,
  authorize('manager', 'admin'),
  validate(approveRegistrationSchema),
  approveRegistration
);

// @route   POST /api/manager/events/:eventId/complete-batch
// @desc    Đánh dấu hoàn thành hàng loạt
router.post(
  '/events/:eventId/complete-batch',
  protect,
  authorize('manager', 'admin'),
  completeBatchRegistrations
);

// @route   GET /api/manager/events/:eventId/report
// @desc    Xem báo cáo chi tiết sự kiện
router.get(
  '/events/:eventId/report',
  protect,
  authorize('manager', 'admin'),
  getEventReport
);

// @route   GET /api/manager/events/:eventId/volunteers
// @desc    Lấy danh sách tình nguyện viên của sự kiện
router.get(
  '/events/:eventId/volunteers',
  protect,
  authorize('manager', 'admin'),
  getEventVolunteers
);

// @route   PUT /api/manager/events/:id/status
// @desc    Cập nhật trạng thái sự kiện
router.put(
  '/events/:id/status',
  protect,
  authorize('manager', 'admin'),
  updateEventStatus
);

module.exports = router;