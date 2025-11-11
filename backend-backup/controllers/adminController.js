const User = require('../models/User');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Post = require('../models/Post');
const Notification = require('../models/Notification');
const { Parser } = require('json2csv');

// ==================== USER MANAGEMENT ====================

// @desc    Lấy danh sách tất cả users
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getAllUsers = async (req, res) => {
  try {
    const {
      role,
      isActive,
      search,
      page = 1,
      limit = 20,
      sort = '-createdAt'
    } = req.query;

    // Build query
    const query = {};

    if (role) {
      query.role = role;
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const users = await User.find(query)
      .select('-password')
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await User.countDocuments(query);

    // Thống kê thêm cho mỗi user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        let stats = {};

        if (user.role === 'volunteer') {
          const registrations = await Registration.countDocuments({
            volunteer: user._id
          });
          const completed = await Registration.countDocuments({
            volunteer: user._id,
            status: 'completed'
          });
          stats = { totalRegistrations: registrations, completedEvents: completed };
        }

        if (user.role === 'manager') {
          const events = await Event.countDocuments({
            organizer: user._id
          });
          stats = { totalEvents: events };
        }

        return {
          ...user.toObject(),
          stats
        };
      })
    );

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: usersWithStats
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

// @desc    Lấy chi tiết user
// @route   GET /api/admin/users/:id
// @access  Private (Admin)
exports.getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    // Lấy thống kê chi tiết
    let detailedStats = {};

    if (user.role === 'volunteer') {
      const registrations = await Registration.find({
        volunteer: user._id
      })
        .populate('event', 'title startDate status')
        .sort('-registeredAt')
        .limit(10);

      const stats = await Registration.aggregate([
        { $match: { volunteer: user._id } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      detailedStats = {
        recentRegistrations: registrations,
        registrationsByStatus: stats
      };
    }

    if (user.role === 'manager') {
      const events = await Event.find({
        organizer: user._id
      })
        .sort('-createdAt')
        .limit(10);

      const eventStats = await Event.aggregate([
        { $match: { organizer: user._id } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      detailedStats = {
        recentEvents: events,
        eventsByStatus: eventStats
      };
    }

    res.status(200).json({
      success: true,
      data: {
        user,
        ...detailedStats
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

// @desc    Cập nhật user
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
exports.updateUser = async (req, res) => {
  try {
    const { name, email, phone, role, isActive } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    // Không cho phép tự sửa chính mình thành inactive
    if (req.user._id.toString() === req.params.id && isActive === false) {
      return res.status(400).json({
        success: false,
        message: 'Không thể vô hiệu hóa tài khoản của chính mình'
      });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Cập nhật người dùng thành công',
      data: user
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

// @desc    Khóa/Mở khóa tài khoản user
// @route   PUT /api/admin/users/:id/toggle-active
// @access  Private (Admin)
exports.toggleUserActive = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    // Không cho phép tự khóa chính mình
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({
        success: false,
        message: 'Không thể khóa tài khoản của chính mình'
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    // Tạo thông báo
    await Notification.create({
      recipient: user._id,
      type: 'account_status_changed',
      title: user.isActive ? 'Tài khoản đã được kích hoạt' : 'Tài khoản bị khóa',
      message: user.isActive
        ? 'Tài khoản của bạn đã được kích hoạt trở lại'
        : 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ admin để biết thêm chi tiết'
    });

    res.status(200).json({
      success: true,
      message: `${user.isActive ? 'Mở khóa' : 'Khóa'} tài khoản thành công`,
      data: {
        userId: user._id,
        isActive: user.isActive
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

// @desc    Đổi role user
// @route   PUT /api/admin/users/:id/change-role
// @access  Private (Admin)
exports.changeUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!['volunteer', 'manager', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role không hợp lệ'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    // Không cho phép tự đổi role của mình
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({
        success: false,
        message: 'Không thể đổi role của chính mình'
      });
    }

    const oldRole = user.role;
    user.role = role;
    await user.save();

    // Tạo thông báo
    await Notification.create({
      recipient: user._id,
      type: 'role_changed',
      title: 'Vai trò đã thay đổi',
      message: `Vai trò của bạn đã được thay đổi từ ${oldRole} sang ${role}`
    });

    res.status(200).json({
      success: true,
      message: 'Đổi role thành công',
      data: {
        userId: user._id,
        oldRole,
        newRole: role
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

// @desc    Xóa user (soft delete - set isActive = false)
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    // Không cho phép tự xóa mình
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa tài khoản của chính mình'
      });
    }

    // Soft delete
    user.isActive = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Xóa người dùng thành công'
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

// ==================== EVENT MANAGEMENT ====================

// @desc    Duyệt/Từ chối sự kiện
// @route   PUT /api/admin/events/:id/approve
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

    const event = await Event.findById(req.params.id).populate('organizer', 'name email');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sự kiện'
      });
    }

    const oldStatus = event.status;
    event.status = status;

    if (status === 'rejected') {
      event.rejectionReason = reason;
    }

    await event.save();

    // Tạo thông báo cho organizer
    await Notification.create({
      recipient: event.organizer._id,
      type: status === 'approved' ? 'event_approved' : 'event_rejected',
      title: status === 'approved' ? 'Sự kiện được duyệt' : 'Sự kiện bị từ chối',
      message: status === 'approved'
        ? `Sự kiện "${event.title}" đã được duyệt`
        : `Sự kiện "${event.title}" bị từ chối. Lý do: ${reason}`,
      relatedEvent: event._id
    });

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

// @desc    Xóa sự kiện (admin có thể xóa bất kỳ sự kiện nào)
// @route   DELETE /api/admin/events/:id
// @access  Private (Admin)
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sự kiện'
      });
    }

    // Kiểm tra có đăng ký nào không
    const registrationCount = await Registration.countDocuments({
      event: req.params.id,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (registrationCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Không thể xóa sự kiện có ${registrationCount} đăng ký đang hoạt động`
      });
    }

    await event.deleteOne();

    // Thông báo cho organizer
    await Notification.create({
      recipient: event.organizer,
      type: 'event_deleted',
      title: 'Sự kiện bị xóa',
      message: `Sự kiện "${event.title}" đã bị xóa bởi admin`,
      relatedEvent: event._id
    });

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

// ==================== DATA EXPORT ====================

// @desc    Export danh sách users
// @route   GET /api/admin/export/users
// @access  Private (Admin)
exports.exportUsers = async (req, res) => {
  try {
    const { format = 'json', role, isActive } = req.query;

    // Build query
    const query = {};
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const users = await User.find(query).select('-password -pushSubscription');

    if (format === 'csv') {
      // Convert to CSV
      const fields = ['_id', 'name', 'email', 'role', 'phone', 'isActive', 'createdAt'];
      const opts = { fields };
      const parser = new Parser(opts);
      const csv = parser.parse(users);

      res.header('Content-Type', 'text/csv');
      res.header('Content-Disposition', 'attachment; filename=users.csv');
      return res.send(csv);
    }

    // Default: JSON
    res.header('Content-Type', 'application/json');
    res.header('Content-Disposition', 'attachment; filename=users.json');
    res.status(200).json({
      success: true,
      count: users.length,
      exportedAt: new Date().toISOString(),
      data: users
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi export dữ liệu',
      error: error.message
    });
  }
};

// @desc    Export danh sách events
// @route   GET /api/admin/export/events
// @access  Private (Admin)
exports.exportEvents = async (req, res) => {
  try {
    const { format = 'json', status, category } = req.query;

    // Build query
    const query = {};
    if (status) query.status = status;
    if (category) query.category = category;

    const events = await Event.find(query)
      .populate('organizer', 'name email')
      .lean();

    if (format === 'csv') {
      // Flatten data for CSV
      const flattenedEvents = events.map(event => ({
        _id: event._id,
        title: event.title,
        category: event.category,
        status: event.status,
        organizerName: event.organizer?.name || '',
        organizerEmail: event.organizer?.email || '',
        location: event.location?.address || '',
        startDate: event.startDate,
        endDate: event.endDate,
        maxParticipants: event.maxParticipants,
        currentParticipants: event.currentParticipants,
        createdAt: event.createdAt
      }));

      const fields = [
        '_id',
        'title',
        'category',
        'status',
        'organizerName',
        'organizerEmail',
        'location',
        'startDate',
        'endDate',
        'maxParticipants',
        'currentParticipants',
        'createdAt'
      ];
      const opts = { fields };
      const parser = new Parser(opts);
      const csv = parser.parse(flattenedEvents);

      res.header('Content-Type', 'text/csv');
      res.header('Content-Disposition', 'attachment; filename=events.csv');
      return res.send(csv);
    }

    // Default: JSON
    res.header('Content-Type', 'application/json');
    res.header('Content-Disposition', 'attachment; filename=events.json');
    res.status(200).json({
      success: true,
      count: events.length,
      exportedAt: new Date().toISOString(),
      data: events
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi export dữ liệu',
      error: error.message
    });
  }
};

// @desc    Export danh sách volunteers (registrations)
// @route   GET /api/admin/export/volunteers
// @access  Private (Admin)
exports.exportVolunteers = async (req, res) => {
  try {
    const { format = 'json', eventId, status } = req.query;

    // Build query
    const query = {};
    if (eventId) query.event = eventId;
    if (status) query.status = status;

    const registrations = await Registration.find(query)
      .populate('volunteer', 'name email phone')
      .populate('event', 'title startDate')
      .lean();

    if (format === 'csv') {
      const flattenedData = registrations.map(reg => ({
        registrationId: reg._id,
        volunteerName: reg.volunteer?.name || '',
        volunteerEmail: reg.volunteer?.email || '',
        volunteerPhone: reg.volunteer?.phone || '',
        eventTitle: reg.event?.title || '',
        eventStartDate: reg.event?.startDate || '',
        status: reg.status,
        registeredAt: reg.registeredAt,
        completedAt: reg.completedAt,
        hours: reg.attendance?.hours || 0
      }));

      const fields = [
        'registrationId',
        'volunteerName',
        'volunteerEmail',
        'volunteerPhone',
        'eventTitle',
        'eventStartDate',
        'status',
        'registeredAt',
        'completedAt',
        'hours'
      ];
      const opts = { fields };
      const parser = new Parser(opts);
      const csv = parser.parse(flattenedData);

      res.header('Content-Type', 'text/csv');
      res.header('Content-Disposition', 'attachment; filename=volunteers.csv');
      return res.send(csv);
    }

    // Default: JSON
    res.header('Content-Type', 'application/json');
    res.header('Content-Disposition', 'attachment; filename=volunteers.json');
    res.status(200).json({
      success: true,
      count: registrations.length,
      exportedAt: new Date().toISOString(),
      data: registrations
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi export dữ liệu',
      error: error.message
    });
  }
};