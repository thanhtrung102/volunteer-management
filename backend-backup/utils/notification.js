const webpush = require('web-push');
const User = require('../models/User');

// Cấu hình Web Push
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:' + (process.env.ADMIN_EMAIL || 'admin@volunteer.com'),
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

/**
 * Gửi push notification đến user
 * @param {String} userId - ID của user nhận notification
 * @param {Object} payload - Nội dung notification {title, body, icon, data}
 */
exports.sendNotification = async (userId, payload) => {
  try {
    const user = await User.findById(userId);

    if (!user || !user.pushSubscription) {
      console.log('User không có push subscription');
      return;
    }

    const notificationPayload = JSON.stringify({
      title: payload.title || 'Thông báo',
      body: payload.body || '',
      icon: payload.icon || '/icon.png',
      badge: payload.badge || '/badge.png',
      data: payload.data || {}
    });

    await webpush.sendNotification(
      user.pushSubscription,
      notificationPayload
    );

    console.log('Đã gửi push notification thành công');
  } catch (error) {
    console.error('Lỗi khi gửi push notification:', error);

    // Nếu subscription không còn hợp lệ, xóa nó
    if (error.statusCode === 410) {
      const user = await User.findById(userId);
      if (user) {
        user.pushSubscription = null;
        await user.save();
        console.log('Đã xóa push subscription không hợp lệ');
      }
    }
  }
};

/**
 * Gửi notification đến nhiều users
 * @param {Array} userIds - Mảng ID của users
 * @param {Object} payload - Nội dung notification
 */
exports.sendNotificationToMultiple = async (userIds, payload) => {
  try {
    const promises = userIds.map(userId => 
      exports.sendNotification(userId, payload)
    );

    await Promise.all(promises);
    console.log(`Đã gửi notification đến ${userIds.length} users`);
  } catch (error) {
    console.error('Lỗi khi gửi notification đến nhiều users:', error);
  }
};