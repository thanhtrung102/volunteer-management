// Seed Database với dữ liệu mẫu
// Chạy: node seed.js

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Event = require('./models/Event');
const Registration = require('./models/Registration');
const Post = require('./models/Post');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

const clearDatabase = async () => {
  console.log('🗑️  Clearing database...');
  await User.deleteMany({});
  await Event.deleteMany({});
  await Registration.deleteMany({});
  await Post.deleteMany({});
  console.log('✅ Database cleared');
};

const seedData = async () => {
  try {
    await connectDB();
    await clearDatabase();

    console.log('\n📝 Creating users...');

    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 10);

    // 1. Tạo Admin
    const admin = await User.create({
      name: 'Admin System',
      email: 'admin@volunteer.com',
      password: hashedPassword,
      role: 'admin',
      phone: '0900000001'
    });
    console.log('✅ Admin created:', admin.email);

    // 2. Tạo Managers
    const managers = await User.insertMany([
      {
        name: 'Nguyễn Văn Manager',
        email: 'manager1@volunteer.com',
        password: hashedPassword,
        role: 'manager',
        phone: '0900000002'
      },
      {
        name: 'Trần Thị Quản Lý',
        email: 'manager2@volunteer.com',
        password: hashedPassword,
        role: 'manager',
        phone: '0900000003'
      }
    ]);
    console.log('✅ Managers created:', managers.length);

    // 3. Tạo Volunteers
    const volunteers = await User.insertMany([
      {
        name: 'Lê Văn Tình Nguyện',
        email: 'volunteer1@volunteer.com',
        password: hashedPassword,
        role: 'volunteer',
        phone: '0900000004'
      },
      {
        name: 'Phạm Thị Hoa',
        email: 'volunteer2@volunteer.com',
        password: hashedPassword,
        role: 'volunteer',
        phone: '0900000005'
      },
      {
        name: 'Hoàng Văn Nam',
        email: 'volunteer3@volunteer.com',
        password: hashedPassword,
        role: 'volunteer',
        phone: '0900000006'
      },
      {
        name: 'Đỗ Thị Lan',
        email: 'volunteer4@volunteer.com',
        password: hashedPassword,
        role: 'volunteer',
        phone: '0900000007'
      },
      {
        name: 'Vũ Văn Tuấn',
        email: 'volunteer5@volunteer.com',
        password: hashedPassword,
        role: 'volunteer',
        phone: '0900000008'
      }
    ]);
    console.log('✅ Volunteers created:', volunteers.length);

    console.log('\n🎉 Creating events...');

    // 4. Tạo Events
    const now = new Date();
    const events = await Event.insertMany([
      {
        title: 'Trồng 1000 cây xanh vì môi trường',
        description: 'Chiến dịch trồng cây lớn nhất năm 2024. Cùng nhau tạo nên một khu rừng xanh cho thế hệ tương lai.',
        category: 'tree_planting',
        location: {
          address: 'Công viên Thống Nhất, Hà Nội',
          coordinates: { lat: 21.0285, lng: 105.8542 }
        },
        startDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000),
        maxParticipants: 100,
        currentParticipants: 3,
        status: 'approved',
        organizer: managers[0]._id,
        requirements: 'Mang theo nước uống, găng tay, mũ rộng vành',
        benefits: 'Nhận chứng nhận tham gia, ăn trưa miễn phí, áo đồng phục'
      },
      {
        title: 'Dọn rác bãi biển Sầm Sơn',
        description: 'Làm sạch bãi biển, bảo vệ môi trường biển và sinh vật biển.',
        category: 'cleanup',
        location: {
          address: 'Bãi biển Sầm Sơn, Thanh Hóa'
        },
        startDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000),
        maxParticipants: 200,
        currentParticipants: 0,
        status: 'approved',
        organizer: managers[1]._id,
        requirements: 'Mang theo găng tay, túi rác',
        benefits: 'Chứng nhận, ăn trưa, tham quan miễn phí'
      },
      {
        title: 'Từ thiện cho trẻ em vùng cao',
        description: 'Mang quà tặng và sách vở đến với các em nhỏ vùng cao.',
        category: 'charity',
        location: {
          address: 'Xã Mường Hum, Bát Xát, Lào Cai'
        },
        startDate: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 23 * 24 * 60 * 60 * 1000),
        maxParticipants: 50,
        currentParticipants: 0,
        status: 'pending',
        organizer: managers[0]._id,
        requirements: 'Sức khỏe tốt, có kinh nghiệm đi rừng',
        benefits: 'Trải nghiệm ý nghĩa, chứng nhận'
      },
      {
        title: 'Bình dân học vụ số cho người cao tuổi',
        description: 'Dạy người cao tuổi sử dụng smartphone, internet cơ bản.',
        category: 'education',
        location: {
          address: 'Trung tâm Văn hóa Quận 1, TP.HCM'
        },
        startDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
        maxParticipants: 30,
        currentParticipants: 0,
        status: 'approved',
        organizer: managers[1]._id,
        requirements: 'Kiên nhẫn, có kiến thức công nghệ cơ bản',
        benefits: 'Chứng nhận giảng dạy tình nguyện'
      },
      {
        title: 'Sự kiện test đã hoàn thành',
        description: 'Sự kiện này đã diễn ra và hoàn thành.',
        category: 'other',
        location: {
          address: 'Hà Nội'
        },
        startDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000),
        maxParticipants: 50,
        currentParticipants: 5,
        status: 'completed',
        organizer: managers[0]._id
      }
    ]);
    console.log('✅ Events created:', events.length);

    console.log('\n👥 Creating registrations...');

    // 5. Tạo Registrations
    const registrations = await Registration.insertMany([
      // Event 1 - Trồng cây
      {
        event: events[0]._id,
        volunteer: volunteers[0]._id,
        status: 'confirmed',
        confirmedAt: new Date(),
        registeredAt: new Date()
      },
      {
        event: events[0]._id,
        volunteer: volunteers[1]._id,
        status: 'confirmed',
        confirmedAt: new Date(),
        registeredAt: new Date()
      },
      {
        event: events[0]._id,
        volunteer: volunteers[2]._id,
        status: 'confirmed',
        confirmedAt: new Date(),
        registeredAt: new Date()
      },
      // Event 5 - Completed
      {
        event: events[4]._id,
        volunteer: volunteers[0]._id,
        status: 'completed',
        confirmedAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
        completedAt: new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000),
        registeredAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
        attendance: {
          checkIn: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
          checkOut: new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000),
          hours: 8
        },
        feedback: {
          rating: 5,
          comment: 'Sự kiện rất ý nghĩa!',
          submittedAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000)
        }
      }
    ]);
    console.log('✅ Registrations created:', registrations.length);

    console.log('\n💬 Creating posts...');

    // 6. Tạo Posts
    const posts = await Post.insertMany([
      {
        event: events[0]._id,
        author: volunteers[0]._id,
        content: 'Rất vui được tham gia sự kiện này! Mọi người cùng cố gắng nhé! 🌳',
        likes: [volunteers[1]._id, volunteers[2]._id],
        comments: [
          {
            author: volunteers[1]._id,
            content: 'Đúng vậy! Hẹn gặp mọi người nha!',
            createdAt: new Date()
          }
        ]
      },
      {
        event: events[0]._id,
        author: volunteers[2]._id,
        content: 'Mình đã chuẩn bị đầy đủ dụng cụ rồi. Ai cần hỗ trợ gì cứ nói nhé!',
        likes: [volunteers[0]._id],
        comments: []
      }
    ]);
    console.log('✅ Posts created:', posts.length);

    // Cập nhật stats cho event
    events[0].stats = {
      totalPosts: 2,
      totalLikes: 3,
      totalComments: 1,
      recentActivityCount: 3,
      lastActivityAt: new Date()
    };
    await events[0].save();

    console.log('\n✅ Seed completed successfully!');
    console.log('\n📋 Summary:');
    console.log('-----------------------------------');
    console.log('👤 Users:');
    console.log(`   - Admin: 1 (${admin.email})`);
    console.log(`   - Managers: ${managers.length}`);
    console.log(`   - Volunteers: ${volunteers.length}`);
    console.log(`🎉 Events: ${events.length}`);
    console.log(`   - Approved: ${events.filter(e => e.status === 'approved').length}`);
    console.log(`   - Pending: ${events.filter(e => e.status === 'pending').length}`);
    console.log(`   - Completed: ${events.filter(e => e.status === 'completed').length}`);
    console.log(`📝 Registrations: ${registrations.length}`);
    console.log(`💬 Posts: ${posts.length}`);
    console.log('-----------------------------------');
    console.log('\n🔑 Test Credentials:');
    console.log('-----------------------------------');
    console.log('Admin:');
    console.log('  Email: admin@volunteer.com');
    console.log('  Password: password123');
    console.log('\nManager:');
    console.log('  Email: manager1@volunteer.com');
    console.log('  Password: password123');
    console.log('\nVolunteer:');
    console.log('  Email: volunteer1@volunteer.com');
    console.log('  Password: password123');
    console.log('-----------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed Error:', error);
    process.exit(1);
  }
};

seedData();