const Event = require('../models/Event');
const Registration = require('../models/Registration');

// @desc    Lấy danh sách sự kiện (có filter)
// @route   GET /api/events
// @access  Public
exports.getEvents = async (req, res) => {
  try {
    const {
      category,
      status,
      startDate,
      endDate,
      search,
      page = 1,
      limit = 10,
      sort = '-createdAt'
    } = req.query;

    // Build query
    const query = {};

    // Filter theo category
    if (category) {
      query.category = category;
    }

    // Filter theo status
    if (status) {
      query.status = status;
    } else if (req.user?.role === 'volunteer' || !req.user) {
      // Volunteer hoặc không login chỉ xem được event approved
      query.status = 'approved';
    }

    // Filter theo thời gian
    if (startDate || endDate) {
      query.startDate = {};
      if (startDate) query.startDate.$gte = new Date(startDate);
      if (endDate) query.startDate.$lte = new Date(endDate);
    }

    // Search theo tên hoặc mô tả
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Execute query
    const events = await Event.find(query)
      .populate('organizer', 'name email avatar')
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip);

    // Đếm tổng số documents
    const total = await Event.countDocuments(query);

    res.status(200).json({
      success: true,
      count: events.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: events
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

// @desc    Lấy chi tiết sự kiện
// @route   GET /api/events/:id
// @access  Public
exports.getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email phone avatar');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sự kiện'
      });
    }

    // Kiểm tra quyền xem
    if (event.status !== 'approved' && req.user?.role === 'volunteer') {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền xem sự kiện này'
      });
    }

    res.status(200).json({
      success: true,
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

// @desc    Tạo sự kiện mới
// @route   POST /api/events
// @access  Private (Manager, Admin)
exports.createEvent = async (req, res) => {
  try {
    // Thêm organizer vào data (đã validate bởi Joi)
    req.body.organizer = req.user._id;

    // Set status mặc định
    if (req.user.role === 'manager') {
      req.body.status = 'pending'; // Manager tạo cần admin duyệt
    } else if (req.user.role === 'admin') {
      req.body.status = 'approved'; // Admin tạo thì tự động approved
    }

    const event = await Event.create(req.body);

    // Populate organizer info
    await event.populate('organizer', 'name email phone avatar');

    res.status(201).json({
      success: true,
      message: 'Tạo sự kiện thành công',
      data: event
    });
  } catch (error) {
    console.error(error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// @desc    Cập nhật sự kiện
// @route   PUT /api/events/:id
// @access  Private (Manager chủ event, Admin)
exports.updateEvent = async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sự kiện'
      });
    }

    // Kiểm tra quyền (chủ event hoặc admin)
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền cập nhật sự kiện này'
      });
    }

    // Không cho phép cập nhật một số trường
    delete req.body.organizer;
    delete req.body.currentParticipants;

    event = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Cập nhật sự kiện thành công',
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

// @desc    Xóa sự kiện
// @route   DELETE /api/events/:id
// @access  Private (Manager chủ event, Admin)
exports.deleteEvent = async (req, res) => {
  try {
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
        message: 'Không có quyền xóa sự kiện này'
      });
    }

    // Kiểm tra xem có đăng ký nào không
    const registrationCount = await Registration.countDocuments({
      event: req.params.id,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (registrationCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa sự kiện đã có người đăng ký'
      });
    }

    await event.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Xóa sự kiện thành công'
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

// @desc    Duyệt/từ chối sự kiện
// @route   PUT /api/events/:id/approve
// @access  Private (Admin)
exports.approveEvent = async (req, res) => {
  try {
    const { status, reason } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
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

    event.status = status;
    if (status === 'rejected' && reason) {
      event.rejectionReason = reason;
    }

    await event.save();

    res.status(200).json({
      success: true,
      message: `${status === 'approved' ? 'Duyệt' : 'Từ chối'} sự kiện thành công`,
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

// @desc    Lấy danh sách sự kiện của mình (manager)
// @route   GET /api/events/my-events
// @access  Private (Manager, Admin)
exports.getMyEvents = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = { organizer: req.user._id };

    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const events = await Event.find(query)
      .sort('-createdAt')
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Event.countDocuments(query);

    res.status(200).json({
      success: true,
      count: events.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: events
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