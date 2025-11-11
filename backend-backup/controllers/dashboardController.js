const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Post = require('../models/Post');
const Notification = require('../models/Notification');

// @desc    Lấy thông tin dashboard cho volunteer
// @route   GET /api/dashboard/volunteer
// @access  Private (Volunteer)
exports.getVolunteerDashboard = async (req, res) => {
  try {
    const volunteerId = req.user._id;

    // 1. Sự kiện mới công bố (7 ngày gần nhất)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const newEvents = await Event.find({
      status: 'approved',
      createdAt: { $gte: sevenDaysAgo },
      startDate: { $gte: new Date() }
    })
      .sort('-createdAt')
      .limit(5)
      .select('title description category location startDate endDate images currentParticipants maxParticipants');

    // 2. Sự kiện đã đăng ký và có hoạt động mới (có bài viết/comment/like mới trong 24h)
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const myRegistrations = await Registration.find({
      volunteer: volunteerId,
      status: { $in: ['confirmed', 'completed'] }
    }).select('event');

    const myEventIds = myRegistrations.map(reg => reg.event);

    const eventsWithActivity = await Event.find({
      _id: { $in: myEventIds },
      'stats.lastActivityAt': { $gte: oneDayAgo }
    })
      .sort('-stats.lastActivityAt')
      .limit(5)
      .select('title description category location startDate stats');

    // 3. Sự kiện thu hút (trending) - tăng thành viên/tương tác nhanh trong 3 ngày gần nhất
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const trendingEvents = await Event.find({
      status: 'approved',
      startDate: { $gte: new Date() },
      'stats.lastActivityAt': { $gte: threeDaysAgo }
    })
      .sort('-stats.recentActivityCount')
      .limit(5)
      .select('title description category location startDate endDate images currentParticipants maxParticipants stats');

    // 4. Sự kiện sắp diễn ra mà volunteer đã đăng ký
    const upcomingRegistrations = await Registration.find({
      volunteer: volunteerId,
      status: 'confirmed'
    })
      .populate({
        path: 'event',
        match: { startDate: { $gte: new Date() } },
        select: 'title description category location startDate endDate images'
      })
      .sort('event.startDate')
      .limit(5);

    const upcomingEvents = upcomingRegistrations
      .filter(reg => reg.event !== null)
      .map(reg => reg.event);

    // 5. Thống kê cá nhân
    const totalRegistrations = await Registration.countDocuments({
      volunteer: volunteerId
    });

    const completedEvents = await Registration.countDocuments({
      volunteer: volunteerId,
      status: 'completed'
    });

    const upcomingCount = await Registration.countDocuments({
      volunteer: volunteerId,
      status: 'confirmed'
    });

    // 6. Thông báo chưa đọc
    const unreadNotifications = await Notification.countDocuments({
      recipient: volunteerId,
      isRead: false
    });

    res.status(200).json({
      success: true,
      data: {
        newEvents,
        eventsWithActivity,
        trendingEvents,
        upcomingEvents,
        stats: {
          totalRegistrations,
          completedEvents,
          upcomingCount,
          unreadNotifications
        }
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

// @desc    Lấy thông tin dashboard cho manager
// @route   GET /api/dashboard/manager
// @access  Private (Manager, Admin)
exports.getManagerDashboard = async (req, res) => {
  try {
    const managerId = req.user._id;

    // 1. Tổng số sự kiện của manager
    const totalEvents = await Event.countDocuments({
      organizer: managerId
    });

    // 2. Sự kiện theo trạng thái
    const eventsByStatus = await Event.aggregate([
      { $match: { organizer: managerId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statusCounts = {};
    eventsByStatus.forEach(item => {
      statusCounts[item._id] = item.count;
    });

    // 3. Sự kiện sắp diễn ra
    const upcomingEvents = await Event.find({
      organizer: managerId,
      status: 'approved',
      startDate: { $gte: new Date() }
    })
      .sort('startDate')
      .limit(5)
      .select('title startDate endDate currentParticipants maxParticipants');

    // 4. Sự kiện đang diễn ra
    const now = new Date();
    const ongoingEvents = await Event.find({
      organizer: managerId,
      status: 'approved',
      startDate: { $lte: now },
      endDate: { $gte: now }
    })
      .select('title startDate endDate currentParticipants maxParticipants');

    // 5. Tổng số đăng ký
    const myEvents = await Event.find({ organizer: managerId }).select('_id');
    const myEventIds = myEvents.map(e => e._id);

    const totalRegistrations = await Registration.countDocuments({
      event: { $in: myEventIds }
    });

    const confirmedRegistrations = await Registration.countDocuments({
      event: { $in: myEventIds },
      status: 'confirmed'
    });

    const completedRegistrations = await Registration.countDocuments({
      event: { $in: myEventIds },
      status: 'completed'
    });

    // 6. Sự kiện cần duyệt (nếu là admin)
    let pendingEvents = [];
    if (req.user.role === 'admin') {
      pendingEvents = await Event.find({
        status: 'pending'
      })
        .populate('organizer', 'name email')
        .sort('-createdAt')
        .limit(10)
        .select('title organizer createdAt category');
    }

    // 7. Hoạt động gần đây
    const recentPosts = await Post.find({
      event: { $in: myEventIds },
      isDeleted: false
    })
      .populate('author', 'name avatar')
      .populate('event', 'title')
      .sort('-createdAt')
      .limit(10)
      .select('content author event createdAt');

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalEvents,
          statusCounts,
          totalRegistrations,
          confirmedRegistrations,
          completedRegistrations
        },
        upcomingEvents,
        ongoingEvents,
        pendingEvents,
        recentPosts
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

// @desc    Lấy thống kê tổng quan (Admin)
// @route   GET /api/dashboard/admin
// @access  Private (Admin)
exports.getAdminDashboard = async (req, res) => {
  try {
    // 1. Tổng số users theo role
    const User = require('../models/User');
    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    const roleCounts = {};
    usersByRole.forEach(item => {
      roleCounts[item._id] = item.count;
    });

    // 2. Tổng số sự kiện theo trạng thái
    const eventsByStatus = await Event.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const eventStatusCounts = {};
    eventsByStatus.forEach(item => {
      eventStatusCounts[item._id] = item.count;
    });

    // 3. Tổng số đăng ký
    const totalRegistrations = await Registration.countDocuments();

    // 4. Sự kiện cần duyệt
    const pendingEvents = await Event.find({
      status: 'pending'
    })
      .populate('organizer', 'name email')
      .sort('-createdAt')
      .limit(10);

    // 5. Sự kiện hoạt động tích cực nhất
    const activeEvents = await Event.find({
      status: 'approved'
    })
      .sort('-stats.recentActivityCount')
      .limit(5)
      .select('title organizer currentParticipants maxParticipants stats');

    // 6. User hoạt động tích cực nhất
    const activeVolunteers = await Registration.aggregate([
      {
        $match: {
          status: { $in: ['confirmed', 'completed'] }
        }
      },
      {
        $group: {
          _id: '$volunteer',
          eventCount: { $sum: 1 }
        }
      },
      { $sort: { eventCount: -1 } },
      { $limit: 5 }
    ]);

    const User2 = require('../models/User');
    const activeVolunteerDetails = await User2.find({
      _id: { $in: activeVolunteers.map(v => v._id) }
    }).select('name email avatar');

    const activeVolunteersData = activeVolunteers.map(v => {
      const user = activeVolunteerDetails.find(u => u._id.toString() === v._id.toString());
      return {
        user,
        eventCount: v.eventCount
      };
    });

    // 7. Thống kê theo thời gian (30 ngày gần nhất)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newEventsLast30Days = await Event.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    const newRegistrationsLast30Days = await Registration.countDocuments({
      registeredAt: { $gte: thirtyDaysAgo }
    });

    res.status(200).json({
      success: true,
      data: {
        userStats: {
          byRole: roleCounts,
          total: Object.values(roleCounts).reduce((a, b) => a + b, 0)
        },
        eventStats: {
          byStatus: eventStatusCounts,
          total: Object.values(eventStatusCounts).reduce((a, b) => a + b, 0)
        },
        registrationStats: {
          total: totalRegistrations
        },
        recentStats: {
          newEventsLast30Days,
          newRegistrationsLast30Days
        },
        pendingEvents,
        activeEvents,
        activeVolunteers: activeVolunteersData
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