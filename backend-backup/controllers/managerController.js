const Event = require('../models/Event');
const Registration = require('../models/Registration');
const User = require('../models/User');
const Post = require('../models/Post');
const Notification = require('../models/Notification');
const { sendNotification } = require('../utils/notification');

// @desc    Xác nhận hoặc từ chối đăng ký của tình nguyện viên
// @route   PUT /api/manager/registrations/:id/approve
// @access  Private (Manager chủ event, Admin)
exports.approveRegistration = async (req, res) => {
  try {
    const { status, reason, notes } = req.body;

    const registration = await Registration.findById(req.params.id)
      .populate('event')
      .populate('volunteer', 'name email');

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đăng ký'
      });
    }

    // Kiểm tra quyền
    if (
      registration.event.organizer.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền xử lý đăng ký này'
      });
    }

    // Kiểm tra trạng thái hiện tại
    if (registration.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Không thể xử lý đăng ký đã ${registration.status}`
      });
    }

    // Cập nhật trạng thái
    registration.status = status;
    
    if (status === 'confirmed') {
      registration.confirmedAt = new Date();
      
      // Tăng số lượng tham gia
      const event = await Event.findById(registration.event._id);
      event.currentParticipants += 1;
      await event.save();

      // Tạo thông báo
      await Notification.create({
        recipient: registration.volunteer._id,
        type: 'registration_confirmed',
        title: 'Đăng ký được xác nhận',
        message: `Đăng ký của bạn cho sự kiện "${registration.event.title}" đã được xác nhận`,
        relatedEvent: registration.event._id
      });

      // Gửi push notification
      await sendNotification(registration.volunteer._id, {
        title: 'Đăng ký được xác nhận',
        body: `Đăng ký của bạn cho sự kiện "${registration.event.title}" đã được xác nhận`
      });

    } else if (status === 'rejected') {
      registration.cancelledAt = new Date();
      registration.cancelReason = reason;

      // Tạo thông báo
      await Notification.create({
        recipient: registration.volunteer._id,
        type: 'registration_rejected',
        title: 'Đăng ký bị từ chối',
        message: `Đăng ký của bạn cho sự kiện "${registration.event.title}" đã bị từ chối. Lý do: ${reason}`,
        relatedEvent: registration.event._id
      });

      // Gửi push notification
      await sendNotification(registration.volunteer._id, {
        title: 'Đăng ký bị từ chối',
        body: `Lý do: ${reason}`
      });
    }

    if (notes) {
      registration.notes = notes;
    }

    await registration.save();

    res.status(200).json({
      success: true,
      message: `${status === 'confirmed' ? 'Xác nhận' : 'Từ chối'} đăng ký thành công`,
      data: registration
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

// @desc    Đánh dấu hoàn thành cho nhiều tình nguyện viên
// @route   POST /api/manager/events/:eventId/complete-batch
// @access  Private (Manager chủ event, Admin)
exports.completeBatchRegistrations = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { registrationIds, attendance } = req.body;

    // Kiểm tra sự kiện
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sự kiện'
      });
    }

    // Kiểm tra quyền
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền cập nhật sự kiện này'
      });
    }

    // Kiểm tra sự kiện đã kết thúc chưa
    if (event.endDate > new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Sự kiện chưa kết thúc'
      });
    }

    // Cập nhật hàng loạt
    const result = await Registration.updateMany(
      {
        _id: { $in: registrationIds },
        event: eventId,
        status: 'confirmed'
      },
      {
        $set: {
          status: 'completed',
          completedAt: new Date(),
          ...(attendance && { attendance })
        }
      }
    );

    // Gửi thông báo cho từng volunteer
    const registrations = await Registration.find({
      _id: { $in: registrationIds }
    }).select('volunteer');

    const notifications = registrations.map(reg => ({
      recipient: reg.volunteer,
      type: 'event_completed',
      title: 'Hoàn thành sự kiện',
      message: `Bạn đã hoàn thành sự kiện "${event.title}"`,
      relatedEvent: eventId
    }));

    await Notification.insertMany(notifications);

    res.status(200).json({
      success: true,
      message: 'Đánh dấu hoàn thành thành công',
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

// @desc    Xem báo cáo chi tiết sự kiện
// @route   GET /api/manager/events/:eventId/report
// @access  Private (Manager chủ event, Admin)
exports.getEventReport = async (req, res) => {
  try {
    const { eventId } = req.params;

    // Kiểm tra sự kiện
    const event = await Event.findById(eventId)
      .populate('organizer', 'name email phone');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sự kiện'
      });
    }

    // Kiểm tra quyền
    if (event.organizer._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền xem báo cáo này'
      });
    }

    // Thống kê đăng ký
    const registrations = await Registration.find({ event: eventId })
      .populate('volunteer', 'name email phone avatar');

    const registrationStats = {
      total: registrations.length,
      pending: registrations.filter(r => r.status === 'pending').length,
      confirmed: registrations.filter(r => r.status === 'confirmed').length,
      completed: registrations.filter(r => r.status === 'completed').length,
      cancelled: registrations.filter(r => r.status === 'cancelled').length,
      rejected: registrations.filter(r => r.status === 'rejected').length,
      noShow: registrations.filter(r => r.status === 'no_show').length
    };

    // Thống kê hoạt động
    const posts = await Post.find({ event: eventId, isDeleted: false });
    
    const activityStats = {
      totalPosts: posts.length,
      totalLikes: posts.reduce((sum, post) => sum + post.likes.length, 0),
      totalComments: posts.reduce((sum, post) => sum + post.comments.length, 0),
      activeUsers: new Set(posts.map(p => p.author.toString())).size
    };

    // Danh sách tình nguyện viên hoàn thành
    const completedVolunteers = registrations
      .filter(r => r.status === 'completed')
      .map(r => ({
        volunteer: r.volunteer,
        registeredAt: r.registeredAt,
        completedAt: r.completedAt,
        attendance: r.attendance,
        feedback: r.feedback
      }));

    // Feedback trung bình
    const feedbacks = registrations.filter(r => r.feedback && r.feedback.rating);
    const averageRating = feedbacks.length > 0
      ? (feedbacks.reduce((sum, r) => sum + r.feedback.rating, 0) / feedbacks.length).toFixed(1)
      : null;

    res.status(200).json({
      success: true,
      data: {
        event: {
          _id: event._id,
          title: event.title,
          category: event.category,
          status: event.status,
          location: event.location,
          startDate: event.startDate,
          endDate: event.endDate,
          maxParticipants: event.maxParticipants,
          currentParticipants: event.currentParticipants,
          organizer: event.organizer
        },
        registrationStats,
        activityStats,
        completedVolunteers,
        averageRating,
        feedbacks: feedbacks.map(r => ({
          volunteer: r.volunteer.name,
          rating: r.feedback.rating,
          comment: r.feedback.comment,
          submittedAt: r.feedback.submittedAt
        }))
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

// @desc    Lấy danh sách tình nguyện viên của sự kiện (với filter)
// @route   GET /api/manager/events/:eventId/volunteers
// @access  Private (Manager chủ event, Admin)
exports.getEventVolunteers = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { status, search, page = 1, limit = 50 } = req.query;

    // Kiểm tra sự kiện
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sự kiện'
      });
    }

    // Kiểm tra quyền
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền xem danh sách này'
      });
    }

    // Build query
    const query = { event: eventId };

    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    // Get registrations
    let registrations = await Registration.find(query)
      .populate('volunteer', 'name email phone avatar')
      .sort('-registeredAt')
      .limit(parseInt(limit))
      .skip(skip);

    // Search filter (sau khi populate)
    if (search) {
      registrations = registrations.filter(reg => 
        reg.volunteer.name.toLowerCase().includes(search.toLowerCase()) ||
        reg.volunteer.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    const total = await Registration.countDocuments(query);

    res.status(200).json({
      success: true,
      count: registrations.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: registrations
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

// @desc    Cập nhật trạng thái sự kiện (ongoing, completed, cancelled)
// @route   PUT /api/manager/events/:id/status
// @access  Private (Manager chủ event, Admin)
exports.updateEventStatus = async (req, res) => {
  try {
    const { status, reason } = req.body;

    if (!['ongoing', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái không hợp lệ'
      });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sự kiện'
      });
    }

    // Kiểm tra quyền
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền cập nhật sự kiện này'
      });
    }

    const oldStatus = event.status;
    event.status = status;

    if (status === 'cancelled' && reason) {
      event.cancellationReason = reason;
    }

    await event.save();

    // Gửi thông báo cho tất cả volunteers đã đăng ký
    if (status === 'cancelled') {
      const registrations = await Registration.find({
        event: req.params.id,
        status: { $in: ['confirmed', 'pending'] }
      }).select('volunteer');

      const notifications = registrations.map(reg => ({
        recipient: reg.volunteer,
        type: 'event_cancelled',
        title: 'Sự kiện bị hủy',
        message: `Sự kiện "${event.title}" đã bị hủy. ${reason ? 'Lý do: ' + reason : ''}`,
        relatedEvent: event._id
      }));

      await Notification.insertMany(notifications);
    }

    res.status(200).json({
      success: true,
      message: `Cập nhật trạng thái từ ${oldStatus} sang ${status} thành công`,
      data: event
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