const express = require('express');
const router = express.Router();
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// @route   GET /api/notifications
// @desc    Lấy danh sách notifications
router.get('/', getNotifications);

// @route   GET /api/notifications/unread-count
// @desc    Lấy số lượng notifications chưa đọc
router.get('/unread-count', getUnreadCount);

// @route   PUT /api/notifications/mark-all-read
// @desc    Đánh dấu tất cả đã đọc
router.put('/mark-all-read', markAllAsRead);

// @route   DELETE /api/notifications/clear-all
// @desc    Xóa tất cả notifications
router.delete('/clear-all', clearAllNotifications);

// @route   PUT /api/notifications/:id/read
// @desc    Đánh dấu đã đọc
router.put('/:id/read', markAsRead);

// @route   DELETE /api/notifications/:id
// @desc    Xóa notification
router.delete('/:id', deleteNotification);

module.exports = router;