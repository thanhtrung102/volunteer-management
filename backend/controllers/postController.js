const Post = require('../models/Post');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Notification = require('../models/Notification');
const { emitNewPost, emitPostLike, emitNewComment, emitNotification } = require('../utils/socket');

// @desc    Tạo bài viết trong sự kiện
// @route   POST /api/posts/:eventId
// @access  Private (Volunteer đã đăng ký)
exports.createPost = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { content, images } = req.body;

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
        message: 'Chỉ có thể đăng bài trong sự kiện đã được duyệt'
      });
    }

    // Kiểm tra user đã đăng ký sự kiện chưa
    const registration = await Registration.findOne({
      event: eventId,
      volunteer: req.user._id,
      status: { $in: ['confirmed', 'completed'] }
    });

    if (!registration) {
      return res.status(403).json({
        success: false,
        message: 'Bạn phải đăng ký sự kiện này để có thể đăng bài'
      });
    }

    // Tạo bài viết
    const post = await Post.create({
      event: eventId,
      author: req.user._id,
      content,
      images: images || []
    });

    // Populate author info
    await post.populate('author', 'name avatar');

    // Cập nhật stats của event
    event.stats.totalPosts += 1;
    event.stats.recentActivityCount += 1;
    event.stats.lastActivityAt = new Date();
    await event.save();

    // Emit real-time event
    emitNewPost(eventId, post);

    res.status(201).json({
      success: true,
      message: 'Đăng bài thành công',
      data: post
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

// @desc    Lấy danh sách bài viết của sự kiện
// @route   GET /api/posts/:eventId
// @access  Private (Volunteer đã đăng ký)
exports.getEventPosts = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Kiểm tra sự kiện có tồn tại không
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sự kiện'
      });
    }

    // Kiểm tra user đã đăng ký sự kiện chưa
    const registration = await Registration.findOne({
      event: eventId,
      volunteer: req.user._id,
      status: { $in: ['confirmed', 'completed'] }
    });

    if (!registration) {
      return res.status(403).json({
        success: false,
        message: 'Bạn phải đăng ký sự kiện này để xem bài viết'
      });
    }

    const skip = (page - 1) * limit;

    const posts = await Post.find({
      event: eventId,
      isDeleted: false
    })
      .populate('author', 'name avatar')
      .populate('comments.author', 'name avatar')
      .sort('-createdAt')
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Post.countDocuments({
      event: eventId,
      isDeleted: false
    });

    res.status(200).json({
      success: true,
      count: posts.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: posts
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

// @desc    Cập nhật bài viết
// @route   PUT /api/posts/:id
// @access  Private (Author)
exports.updatePost = async (req, res) => {
  try {
    const { content, images } = req.body;

    let post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết'
      });
    }

    // Kiểm tra quyền
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền cập nhật bài viết này'
      });
    }

    if (content) post.content = content;
    if (images) post.images = images;
    post.updatedAt = new Date();

    await post.save();

    await post.populate('author', 'name avatar');

    res.status(200).json({
      success: true,
      message: 'Cập nhật bài viết thành công',
      data: post
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

// @desc    Xóa bài viết
// @route   DELETE /api/posts/:id
// @access  Private (Author, Admin)
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết'
      });
    }

    // Kiểm tra quyền
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền xóa bài viết này'
      });
    }

    post.isDeleted = true;
    await post.save();

    // Cập nhật stats của event
    const event = await Event.findById(post.event);
    if (event) {
      event.stats.totalPosts -= 1;
      await event.save();
    }

    res.status(200).json({
      success: true,
      message: 'Xóa bài viết thành công'
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

// @desc    Like/Unlike bài viết
// @route   PUT /api/posts/:id/like
// @access  Private
exports.toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết'
      });
    }

    const userId = req.user._id;
    const likeIndex = post.likes.indexOf(userId);

    let message;
    if (likeIndex > -1) {
      // Unlike
      post.likes.splice(likeIndex, 1);
      message = 'Đã bỏ thích';

      // Cập nhật stats của event
      const event = await Event.findById(post.event);
      if (event) {
        event.stats.totalLikes = Math.max(0, event.stats.totalLikes - 1);
        await event.save();
      }
    } else {
      // Like
      post.likes.push(userId);
      message = 'Đã thích bài viết';

      // Cập nhật stats của event
      const event = await Event.findById(post.event);
      if (event) {
        event.stats.totalLikes += 1;
        event.stats.recentActivityCount += 1;
        event.stats.lastActivityAt = new Date();
        await event.save();
      }

      // Tạo thông báo cho tác giả (nếu không phải tự like)
      if (post.author.toString() !== userId.toString()) {
        const notification = await Notification.create({
          recipient: post.author,
          type: 'post_liked',
          title: 'Bài viết được thích',
          message: `${req.user.name} đã thích bài viết của bạn`,
          relatedPost: post._id,
          relatedUser: userId
        });

        // Emit real-time notification
        emitNotification(post.author.toString(), notification);
      }

      // Emit real-time like event
      emitPostLike(post._id.toString(), {
        userId,
        userName: req.user.name,
        isLiked: true
      });
    }

    await post.save();

    res.status(200).json({
      success: true,
      message,
      data: {
        likesCount: post.likes.length,
        isLiked: likeIndex === -1
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

// @desc    Thêm comment vào bài viết
// @route   POST /api/posts/:id/comments
// @access  Private
exports.addComment = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Nội dung bình luận không được để trống'
      });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết'
      });
    }

    const comment = {
      author: req.user._id,
      content: content.trim()
    };

    post.comments.push(comment);
    await post.save();

    // Populate author info
    await post.populate('comments.author', 'name avatar');

    // Cập nhật stats của event
    const event = await Event.findById(post.event);
    if (event) {
      event.stats.totalComments += 1;
      event.stats.recentActivityCount += 1;
      event.stats.lastActivityAt = new Date();
      await event.save();
    }

    // Tạo thông báo cho tác giả bài viết (nếu không phải tự comment)
    if (post.author.toString() !== req.user._id.toString()) {
      const notification = await Notification.create({
        recipient: post.author,
        type: 'new_comment',
        title: 'Bình luận mới',
        message: `${req.user.name} đã bình luận vào bài viết của bạn`,
        relatedPost: post._id,
        relatedUser: req.user._id
      });

      // Emit real-time notification
      emitNotification(post.author.toString(), notification);
    }

    // Emit real-time comment event
    emitNewComment(post._id.toString(), post.comments[post.comments.length - 1]);

    res.status(201).json({
      success: true,
      message: 'Thêm bình luận thành công',
      data: post.comments[post.comments.length - 1]
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

// @desc    Xóa comment
// @route   DELETE /api/posts/:id/comments/:commentId
// @access  Private (Author của comment, Admin)
exports.deleteComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết'
      });
    }

    const comment = post.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bình luận'
      });
    }

    // Kiểm tra quyền
    if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền xóa bình luận này'
      });
    }

    comment.deleteOne();
    await post.save();

    // Cập nhật stats của event
    const event = await Event.findById(post.event);
    if (event) {
      event.stats.totalComments = Math.max(0, event.stats.totalComments - 1);
      await event.save();
    }

    res.status(200).json({
      success: true,
      message: 'Xóa bình luận thành công'
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