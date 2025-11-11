/**
 * Socket.IO Helper Functions
 * Sử dụng global.io và global.onlineUsers được set trong server.js
 */

/**
 * Emit notification đến một user cụ thể
 * @param {String} userId - ID của user nhận
 * @param {Object} notification - Notification data
 */
exports.emitNotification = (userId, notification) => {
  try {
    const socketId = global.onlineUsers.get(userId);
    
    if (socketId && global.io) {
      global.io.to(socketId).emit('notification:new', notification);
      console.log(`📨 Notification sent to user ${userId}`);
    }
  } catch (error) {
    console.error('Error emitting notification:', error);
  }
};

/**
 * Emit notification đến nhiều users
 * @param {Array} userIds - Mảng user IDs
 * @param {Object} notification - Notification data
 */
exports.emitNotificationToMultiple = (userIds, notification) => {
  try {
    userIds.forEach(userId => {
      exports.emitNotification(userId.toString(), notification);
    });
  } catch (error) {
    console.error('Error emitting notifications to multiple users:', error);
  }
};

/**
 * Emit event update đến tất cả participants
 * @param {String} eventId - ID của event
 * @param {Object} updateData - Data cập nhật
 */
exports.emitEventUpdate = (eventId, updateData) => {
  try {
    if (global.io) {
      global.io.emit('event:update', {
        eventId,
        ...updateData
      });
      console.log(`📢 Event update broadcasted: ${eventId}`);
    }
  } catch (error) {
    console.error('Error emitting event update:', error);
  }
};

/**
 * Emit new post đến event channel
 * @param {String} eventId - ID của event
 * @param {Object} post - Post data
 */
exports.emitNewPost = (eventId, post) => {
  try {
    if (global.io) {
      global.io.emit('post:new', {
        eventId,
        post
      });
      console.log(`💬 New post broadcasted to event ${eventId}`);
    }
  } catch (error) {
    console.error('Error emitting new post:', error);
  }
};

/**
 * Emit post like
 * @param {String} postId - ID của post
 * @param {Object} likeData - Like data
 */
exports.emitPostLike = (postId, likeData) => {
  try {
    if (global.io) {
      global.io.emit('post:like', {
        postId,
        ...likeData
      });
    }
  } catch (error) {
    console.error('Error emitting post like:', error);
  }
};

/**
 * Emit new comment
 * @param {String} postId - ID của post
 * @param {Object} comment - Comment data
 */
exports.emitNewComment = (postId, comment) => {
  try {
    if (global.io) {
      global.io.emit('comment:new', {
        postId,
        comment
      });
      console.log(`💭 New comment broadcasted to post ${postId}`);
    }
  } catch (error) {
    console.error('Error emitting new comment:', error);
  }
};

/**
 * Emit registration status update
 * @param {String} userId - ID của volunteer
 * @param {Object} registrationData - Registration data
 */
exports.emitRegistrationUpdate = (userId, registrationData) => {
  try {
    const socketId = global.onlineUsers.get(userId);
    
    if (socketId && global.io) {
      global.io.to(socketId).emit('registration:update', registrationData);
      console.log(`✅ Registration update sent to user ${userId}`);
    }
  } catch (error) {
    console.error('Error emitting registration update:', error);
  }
};

/**
 * Get số lượng users đang online
 * @returns {Number} - Số lượng online users
 */
exports.getOnlineUsersCount = () => {
  return global.onlineUsers ? global.onlineUsers.size : 0;
};

/**
 * Check user có online không
 * @param {String} userId - ID của user
 * @returns {Boolean}
 */
exports.isUserOnline = (userId) => {
  return global.onlineUsers ? global.onlineUsers.has(userId) : false;
};