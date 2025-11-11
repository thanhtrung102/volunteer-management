const Registration = require('../models/Registration');
const Event = require('../models/Event');
const Notification = require('../models/Notification');
const { sendNotification } = require('../utils/notification');

// @desc    Đăng ký tham gia sự kiện
// @route   POST /api/registrations/:eventId
// @access  Private (Volunteer)
exports.registerEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const volunteerId = req.user._id;

    // Kiểm tra sự kiện có tồn tại không
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sự kiện'
      });
    }

    // Kiểm tra sự kiện đã được duyệt chưa
    if (event.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Sự kiện chưa được duyệt'
      });
    }

    // Kiểm tra sự kiện đã qua chưa
    if (event.startDate < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Sự kiện đã diễn ra'
      });
    }

    // Kiểm tra đã đăng ký chưa
    const isRegistered = await Registration.isAlreadyRegistered(eventId, volunteerId);

    if (isRegistered) {
      return res.status(400).json({
        success: false,
        message: 'Bạn đã đăng ký sự kiện này rồi'
      });
    }

    // Kiểm tra sự kiện đã đầy chưa
    if (event.currentParticipants >= event.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: 'Sự kiện đã đầy'
      });
    }

    // Tạo đăng ký mới
    const registration = await Registration.create({
      event: eventId,
      volunteer: volunteerId,
      status: 'confirmed', // Tự động xác nhận
      confirmedAt: new Date(),
      notes: req.body.notes
    });

    // Tăng số lượng tham gia
    event.currentParticipants += 1;
    await event.save();

    // Tạo thông báo
    await Notification.create({
      recipient: volunteerId,
      type: 'registration_confirmed',
      title: 'Đăng ký thành công',
      message: `Bạn đã đăng ký thành công sự kiện "${event.title}"`,
      relatedEvent: eventId
    });

    // Gửi push notification
    await sendNotification(volunteerId, {
      title: 'Đăng ký thành công',
      body: `Bạn đã đăng ký thành công sự kiện "${event.title}"`
    });

    res.status(201).json({
      success: true,
      message: 'Đăng ký sự kiện thành công',
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

// @desc    Hủy đăng ký sự kiện
// @route   PUT /api/registrations/:id/cancel
// @access  Private (Volunteer)
exports.cancelRegistration = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đăng ký'
      });
    }

    // Kiểm tra quyền
    if (registration.volunteer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền hủy đăng ký này'
      });
    }

    // Kiểm tra trạng thái
    if (registration.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Đăng ký đã được hủy trước đó'
      });
    }

    if (registration.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Không thể hủy đăng ký đã hoàn thành'
      });
    }

    // Lấy thông tin sự kiện
    const event = await Event.findById(registration.event);

    // Kiểm tra thời gian (ví dụ: phải hủy trước 24h)
    const hoursDiff = (event.startDate - new Date()) / (1000 * 60 * 60);
    if (hoursDiff < 24) {
      return res.status(400).json({
        success: false,
        message: 'Không thể hủy đăng ký trong vòng 24 giờ trước sự kiện'
      });
    }

    // Cập nhật đăng ký
    registration.status = 'cancelled';
    registration.cancelledAt = new Date();
    registration.cancelReason = req.body.reason;
    await registration.save();

    // Giảm số lượng tham gia
    event.currentParticipants -= 1;
    await event.save();

    res.status(200).json({
      success: true,
      message: 'Hủy đăng ký thành công',
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

// @desc    Lấy lịch sử đăng ký của volunteer
// @route   GET /api/registrations/my-registrations
// @access  Private (Volunteer)
exports.getMyRegistrations = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = { volunteer: req.user._id };

    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const registrations = await Registration.find(query)
      .populate('event', 'title description category location startDate endDate images')
      .sort('-registeredAt')
      .limit(parseInt(limit))
      .skip(skip);

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

// @desc    Lấy danh sách đăng ký của một sự kiện
// @route   GET /api/registrations/event/:eventId
// @access  Private (Manager chủ event, Admin)
exports.getEventRegistrations = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { status, page = 1, limit = 50 } = req.query;

    // Kiểm tra sự kiện có tồn tại không
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
        message: 'Không có quyền xem danh sách đăng ký này'
      });
    }

    const query = { event: eventId };

    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const registrations = await Registration.find(query)
      .populate('volunteer', 'name email phone avatar')
      .sort('-registeredAt')
      .limit(parseInt(limit))
      .skip(skip);

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

// @desc    Đánh dấu hoàn thành sự kiện cho volunteer
// @route   PUT /api/registrations/:id/complete
// @access  Private (Manager chủ event, Admin)
exports.completeRegistration = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id).populate('event');

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đăng ký'
      });
    }

    // Kiểm tra quyền
    if (registration.event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền cập nhật đăng ký này'
      });
    }

    registration.status = 'completed';
    registration.completedAt = new Date();

    if (req.body.attendance) {
      registration.attendance = req.body.attendance;
    }

    await registration.save();

    // Tạo thông báo
    await Notification.create({
      recipient: registration.volunteer,
      type: 'event_completed',
      title: 'Hoàn thành sự kiện',
      message: `Bạn đã hoàn thành sự kiện "${registration.event.title}"`,
      relatedEvent: registration.event._id
    });

    res.status(200).json({
      success: true,
      message: 'Đánh dấu hoàn thành thành công',
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

// @desc    Thêm feedback cho sự kiện
// @route   PUT /api/registrations/:id/feedback
// @access  Private (Volunteer)
exports.addFeedback = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const registration = await Registration.findById(req.params.id);

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đăng ký'
      });
    }

    // Kiểm tra quyền
    if (registration.volunteer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền thêm feedback cho đăng ký này'
      });
    }

    // Kiểm tra sự kiện đã hoàn thành chưa
    if (registration.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Chỉ có thể feedback cho sự kiện đã hoàn thành'
      });
    }

    registration.feedback = {
      rating,
      comment,
      submittedAt: new Date()
    };

    await registration.save();

    res.status(200).json({
      success: true,
      message: 'Thêm feedback thành công',
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