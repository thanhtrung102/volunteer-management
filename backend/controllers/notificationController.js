const Notification = require('../models/Notification');

// @desc    Lấy danh sách notifications của user
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    const { isRead, type, page = 1, limit = 20 } = req.query;

    // Build query
    const query = { recipient: req.user._id };

    if (isRead !== undefined) {
      query.isRead = isRead === 'true';
    }

    if (type) {
      query.type = type;
    }

    const skip = (page - 1) * limit;

    const notifications = await Notification.find(query)
      .populate('relatedEvent', 'title startDate')
      .populate('relatedPost', 'content')
      .populate('relatedUser', 'name avatar')
      .sort('-createdAt')
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Notification.countDocuments(query);

    res.status(200).json({
      success: true,
      count: notifications.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: notifications
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// @desc    Lấy số lượng notifications chưa đọc
// @route   GET /api/notifications/unread-count
// @access  Private
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false
    });

    res.status(200).json({
      success: true,
      data: {
        count
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// @desc    Đánh dấu notification đã đọc
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user._id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy notification'
      });
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    res.status(200).json({
      success: true,
      message: 'Đánh dấu đã đọc thành công',
      data: notification
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// @desc    Đánh dấu tất cả notifications đã đọc
// @route   PUT /api/notifications/mark-all-read
// @access  Private
exports.markAllAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      {
        recipient: req.user._id,
        isRead: false
      },
      {
        $set: {
          isRead: true,
          readAt: new Date()
        }
      }
    );

    res.status(200).json({
      success: true,
      message: 'Đánh dấu tất cả đã đọc thành công',
      data: {
        updated: result.modifiedCount
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// @desc    Xóa notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user._id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy notification'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Xóa notification thành công'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// @desc    Xóa tất cả notifications
// @route   DELETE /api/notifications/clear-all
// @access  Private
exports.clearAllNotifications = async (req, res) => {
  try {
    const result = await Notification.deleteMany({
      recipient: req.user._id
    });

    res.status(200).json({
      success: true,
      message: 'Xóa tất cả notifications thành công',
      data: {
        deleted: result.deletedCount
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};