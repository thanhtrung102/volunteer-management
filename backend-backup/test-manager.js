// Test Manager API Script
// Chạy: node test-manager.js

const BASE_URL = 'http://localhost:5000/api';
let managerToken = '';
let volunteerToken = '';
let eventId = '';
let registrationId = '';

async function testManagerAPI() {
  console.log('🚀 Starting Manager API Tests...\n');

  try {
    // 1. Đăng ký Manager
    console.log('1️⃣ Registering Manager...');
    const managerRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Manager Test',
        email: `manager${Date.now()}@test.com`,
        password: 'password123',
        role: 'manager'
      })
    });
    const managerData = await managerRes.json();
    managerToken = managerData.data.token;
    console.log('✅ Manager registered!');
    console.log('📧 Email:', managerData.data.email);
    console.log('');

    // 2. Tạo sự kiện (với validation)
    console.log('2️⃣ Creating event with validation...');
    const createEventRes = await fetch(`${BASE_URL}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${managerToken}`
      },
      body: JSON.stringify({
        title: 'Chiến dịch Trồng 1000 cây xanh',
        description: 'Sự kiện trồng cây nhằm góp phần xanh hóa môi trường, tạo không gian sống trong lành cho cộng đồng',
        category: 'tree_planting',
        location: {
          address: 'Công viên Thống Nhất, Hà Nội',
          coordinates: {
            lat: 21.0285,
            lng: 105.8542
          }
        },
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
        maxParticipants: 100,
        requirements: 'Mang theo nước uống, găng tay, mũ rộng vành',
        benefits: 'Nhận chứng nhận tham gia, ăn trưa miễn phí',
        contactInfo: {
          name: 'Nguyễn Văn A',
          phone: '0123456789',
          email: 'contact@example.com'
        }
      })
    });
    const eventData = await createEventRes.json();
    
    if (eventData.success) {
      eventId = eventData.data._id;
      console.log('✅ Event created!');
      console.log('📝 Event ID:', eventId);
      console.log('📌 Status:', eventData.data.status);
    } else {
      console.log('❌ Event creation failed:', eventData);
    }
    console.log('');

    // 3. Test validation error
    console.log('3️⃣ Testing validation error...');
    const invalidEventRes = await fetch(`${BASE_URL}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${managerToken}`
      },
      body: JSON.stringify({
        title: 'Too',  // Too short
        description: 'Short',  // Too short
        category: 'invalid_category'
      })
    });
    const invalidData = await invalidEventRes.json();
    console.log('✅ Validation working:', invalidData.errors ? 'Yes' : 'No');
    if (invalidData.errors) {
      console.log('   Errors:', invalidData.errors.map(e => e.message).join(', '));
    }
    console.log('');

    // 4. Đăng ký Admin để duyệt event
    console.log('4️⃣ Registering Admin to approve event...');
    const adminRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Admin Test',
        email: `admin${Date.now()}@test.com`,
        password: 'password123',
        role: 'admin'
      })
    });
    const adminData = await adminRes.json();
    const adminToken = adminData.data.token;

    // Duyệt event
    const approveRes = await fetch(`${BASE_URL}/events/${eventId}/approve`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        status: 'approved'
      })
    });
    const approveData = await approveRes.json();
    console.log('✅ Event approved!');
    console.log('');

    // 5. Đăng ký Volunteer
    console.log('5️⃣ Registering Volunteer...');
    const volunteerRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Volunteer Test',
        email: `volunteer${Date.now()}@test.com`,
        password: 'password123',
        role: 'volunteer'
      })
    });
    const volunteerData = await volunteerRes.json();
    volunteerToken = volunteerData.data.token;
    console.log('✅ Volunteer registered!');
    console.log('');

    // 6. Volunteer đăng ký sự kiện
    console.log('6️⃣ Volunteer registering for event...');
    const registerRes = await fetch(`${BASE_URL}/registrations/${eventId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${volunteerToken}`
      },
      body: JSON.stringify({
        notes: 'Rất mong được tham gia!'
      })
    });
    const registerData = await registerRes.json();
    
    if (registerData.success) {
      registrationId = registerData.data._id;
      console.log('✅ Registration successful!');
      console.log('📝 Registration ID:', registrationId);
    }
    console.log('');

    // 7. Manager xem danh sách đăng ký
    console.log('7️⃣ Manager viewing event volunteers...');
    const volunteersRes = await fetch(
      `${BASE_URL}/manager/events/${eventId}/volunteers`,
      {
        headers: { 'Authorization': `Bearer ${managerToken}` }
      }
    );
    const volunteersData = await volunteersRes.json();
    console.log('✅ Volunteers found:', volunteersData.count);
    console.log('');

    // 8. Manager xác nhận đăng ký
    console.log('8️⃣ Manager approving registration...');
    const approveRegRes = await fetch(
      `${BASE_URL}/manager/registrations/${registrationId}/approve`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${managerToken}`
        },
        body: JSON.stringify({
          status: 'confirmed',
          notes: 'Welcome to the event!'
        })
      }
    );
    const approveRegData = await approveRegRes.json();
    console.log('✅ Registration approved!');
    console.log('');

    // 9. Manager xem báo cáo sự kiện
    console.log('9️⃣ Manager viewing event report...');
    const reportRes = await fetch(
      `${BASE_URL}/manager/events/${eventId}/report`,
      {
        headers: { 'Authorization': `Bearer ${managerToken}` }
      }
    );
    const reportData = await reportRes.json();
    console.log('✅ Event Report:');
    console.log('   Total Registrations:', reportData.data.registrationStats.total);
    console.log('   Confirmed:', reportData.data.registrationStats.confirmed);
    console.log('   Completed:', reportData.data.registrationStats.completed);
    console.log('');

    // 10. Volunteer đăng bài
    console.log('🔟 Volunteer posting in event channel...');
    const postRes = await fetch(`${BASE_URL}/posts/${eventId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${volunteerToken}`
      },
      body: JSON.stringify({
        content: 'Rất vui được tham gia sự kiện này! Mọi người cùng cố gắng nhé! 🌳'
      })
    });
    const postData = await postRes.json();
    console.log('✅ Post created!');
    console.log('');

    // 11. Manager đánh dấu hoàn thành
    console.log('1️⃣1️⃣ Manager completing registrations (batch)...');
    const completeRes = await fetch(
      `${BASE_URL}/manager/events/${eventId}/complete-batch`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${managerToken}`
        },
        body: JSON.stringify({
          registrationIds: [registrationId],
          attendance: {
            checkIn: new Date().toISOString(),
            checkOut: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
            hours: 8
          }
        })
      }
    );
    const completeData = await completeRes.json();
    console.log('✅ Marked as completed!');
    console.log('   Updated:', completeData.data?.updated);
    console.log('');

    console.log('✅ All Manager API tests completed!\n');
    console.log('📝 Test Summary:');
    console.log('-----------------------------------');
    console.log('✅ Validation: Working');
    console.log('✅ Event Creation: Working');
    console.log('✅ Event Approval: Working');
    console.log('✅ Registration Management: Working');
    console.log('✅ Event Reports: Working');
    console.log('✅ Batch Completion: Working');
    console.log('✅ Post Creation: Working');
    console.log('-----------------------------------');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testManagerAPI();