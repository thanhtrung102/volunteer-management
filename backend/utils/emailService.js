const nodemailer = require('nodemailer');

// Tạo transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

/**
 * Gửi email
 * @param {Object} options - Email options {to, subject, html}
 */
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Volunteer Management" <noreply@volunteer.com>',
      to: options.to,
      subject: options.subject,
      html: options.html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Email error:', error);
    return false;
  }
};

/**
 * Email template: Welcome
 */
exports.sendWelcomeEmail = async (user) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4CAF50;">Chào mừng đến với Volunteer Management!</h2>
      <p>Xin chào <strong>${user.name}</strong>,</p>
      <p>Cảm ơn bạn đã đăng ký tài khoản với vai trò <strong>${user.role}</strong>.</p>
      <p>Bạn có thể bắt đầu khám phá các hoạt động tình nguyện ngay bây giờ!</p>
      <div style="margin: 30px 0;">
        <a href="${process.env.CORS_ORIGIN || 'http://localhost:3000'}" 
           style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
          Khám phá ngay
        </a>
      </div>
      <p style="color: #666; font-size: 12px;">
        Email này được gửi tự động, vui lòng không trả lời.
      </p>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject: 'Chào mừng đến với Volunteer Management',
    html
  });
};

/**
 * Email template: Registration Confirmed
 */
exports.sendRegistrationConfirmedEmail = async (user, event) => {
  const eventDate = new Date(event.startDate).toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4CAF50;">✅ Đăng ký được xác nhận</h2>
      <p>Xin chào <strong>${user.name}</strong>,</p>
      <p>Đăng ký của bạn cho sự kiện <strong>${event.title}</strong> đã được xác nhận!</p>
      
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Thông tin sự kiện</h3>
        <p><strong>📅 Thời gian:</strong> ${eventDate}</p>
        <p><strong>📍 Địa điểm:</strong> ${event.location.address}</p>
        <p><strong>👥 Số người tham gia:</strong> ${event.currentParticipants}/${event.maxParticipants}</p>
      </div>

      ${event.requirements ? `
        <div style="margin: 20px 0;">
          <h4>Yêu cầu chuẩn bị:</h4>
          <p>${event.requirements}</p>
        </div>
      ` : ''}

      <p>Hãy đến đúng giờ và chuẩn bị tinh thần để có một ngày tình nguyện ý nghĩa nhé!</p>
      
      <div style="margin: 30px 0;">
        <a href="${process.env.CORS_ORIGIN || 'http://localhost:3000'}/events/${event._id}" 
           style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
          Xem chi tiết sự kiện
        </a>
      </div>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject: `✅ Xác nhận đăng ký: ${event.title}`,
    html
  });
};

/**
 * Email template: Event Approved
 */
exports.sendEventApprovedEmail = async (organizer, event) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4CAF50;">🎉 Sự kiện đã được duyệt</h2>
      <p>Xin chào <strong>${organizer.name}</strong>,</p>
      <p>Sự kiện <strong>${event.title}</strong> của bạn đã được phê duyệt và công bố!</p>
      
      <p>Tình nguyện viên giờ đã có thể xem và đăng ký tham gia sự kiện của bạn.</p>
      
      <div style="margin: 30px 0;">
        <a href="${process.env.CORS_ORIGIN || 'http://localhost:3000'}/manager/events/${event._id}" 
           style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
          Quản lý sự kiện
        </a>
      </div>
    </div>
  `;

  return sendEmail({
    to: organizer.email,
    subject: `✅ Sự kiện "${event.title}" đã được duyệt`,
    html
  });
};

/**
 * Email template: Event Rejected
 */
exports.sendEventRejectedEmail = async (organizer, event, reason) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f44336;">❌ Sự kiện bị từ chối</h2>
      <p>Xin chào <strong>${organizer.name}</strong>,</p>
      <p>Rất tiếc, sự kiện <strong>${event.title}</strong> của bạn đã bị từ chối.</p>
      
      <div style="background-color: #ffebee; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #f44336;">Lý do từ chối:</h3>
        <p>${reason}</p>
      </div>

      <p>Vui lòng chỉnh sửa lại thông tin sự kiện theo yêu cầu và gửi lại để được xét duyệt.</p>
      
      <div style="margin: 30px 0;">
        <a href="${process.env.CORS_ORIGIN || 'http://localhost:3000'}/manager/events/${event._id}/edit" 
           style="background-color: #2196F3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
          Chỉnh sửa sự kiện
        </a>
      </div>
    </div>
  `;

  return sendEmail({
    to: organizer.email,
    subject: `❌ Sự kiện "${event.title}" bị từ chối`,
    html
  });
};

/**
 * Email template: Event Reminder (1 day before)
 */
exports.sendEventReminderEmail = async (user, event) => {
  const eventDate = new Date(event.startDate).toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #FF9800;">⏰ Nhắc nhở: Sự kiện sắp diễn ra</h2>
      <p>Xin chào <strong>${user.name}</strong>,</p>
      <p>Sự kiện <strong>${event.title}</strong> mà bạn đã đăng ký sẽ diễn ra vào <strong>ngày mai</strong>!</p>
      
      <div style="background-color: #fff3e0; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>📅 Thời gian:</strong> ${eventDate}</p>
        <p><strong>📍 Địa điểm:</strong> ${event.location.address}</p>
      </div>

      <p>Đừng quên chuẩn bị:</p>
      <ul>
        ${event.requirements ? `<li>${event.requirements}</li>` : ''}
        <li>Đến đúng giờ</li>
        <li>Tinh thần nhiệt huyết</li>
      </ul>

      <p>Hẹn gặp bạn tại sự kiện! 🎉</p>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject: `⏰ Nhắc nhở: "${event.title}" diễn ra ngày mai`,
    html
  });
};

/**
 * Email template: Event Completed
 */
exports.sendEventCompletedEmail = async (user, event) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4CAF50;">🎊 Cảm ơn bạn đã tham gia!</h2>
      <p>Xin chào <strong>${user.name}</strong>,</p>
      <p>Cảm ơn bạn đã tham gia sự kiện <strong>${event.title}</strong>!</p>
      
      <p>Sự đóng góp của bạn đã tạo nên sự khác biệt cho cộng đồng. Chúng tôi rất trân trọng tinh thần tình nguyện của bạn.</p>

      <div style="background-color: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p>💚 Hãy tiếp tục theo dõi để không bỏ lỡ các hoạt động tình nguyện tiếp theo!</p>
      </div>

      <div style="margin: 30px 0;">
        <a href="${process.env.CORS_ORIGIN || 'http://localhost:3000'}/events" 
           style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
          Xem sự kiện khác
        </a>
      </div>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject: `🎊 Cảm ơn bạn đã tham gia "${event.title}"`,
    html
  });
};

module.exports = {
  sendWelcomeEmail: exports.sendWelcomeEmail,
  sendRegistrationConfirmedEmail: exports.sendRegistrationConfirmedEmail,
  sendEventApprovedEmail: exports.sendEventApprovedEmail,
  sendEventRejectedEmail: exports.sendEventRejectedEmail,
  sendEventReminderEmail: exports.sendEventReminderEmail,
  sendEventCompletedEmail: exports.sendEventCompletedEmail
};