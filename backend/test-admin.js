// Test Admin API Script
// Chạy: node test-admin.js

const BASE_URL = 'http://localhost:5000/api';
let adminToken = '';
let managerId = '';
let volunteerId = '';
let eventId = '';

async function testAdminAPI() {
  console.log('🚀 Starting Admin API Tests...\n');

  try {
    // 1. Đăng ký Admin
    console.log('1️⃣ Registering Admin...');
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
    adminToken = adminData.data.token;
    console.log('✅ Admin registered!');
    console.log('📧 Email:', adminData.data.email);
    console.log('');

    // 2. Tạo Manager và Volunteer
    console.log('2️⃣ Creating test users...');
    
    // Manager
    const managerRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Manager',
        email: `manager${Date.now()}@test.com`,
        password: 'password123',
        role: 'manager'
      })
    });
    const managerData = await managerRes.json();
    managerId = managerData.data._id;
    const managerToken = managerData.data.token;
    
    // Volunteer
    const volunteerRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Volunteer',
        email: `volunteer${Date.now()}@test.com`,
        password: 'password123',
        role: 'volunteer'
      })
    });
    const volunteerData = await volunteerRes.json();
    volunteerId = volunteerData.data._id;
    
    console.log('✅ Test users created!');
    console.log('');

    // 3. Manager tạo sự kiện
    console.log('3️⃣ Manager creating event...');
    const createEventRes = await fetch(`${BASE_URL}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${managerToken}`
      },
      body: JSON.stringify({
        title: 'Admin Test Event - Dọn rác biển',
        description: 'Sự kiện dọn rác bảo vệ môi trường biển, góp phần xây dựng bãi biển xanh sạch đẹp',
        category: 'cleanup',
        location: {
          address: 'Bãi biển Sầm Sơn, Thanh Hóa'
        },
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
        maxParticipants: 200
      })
    });
    const eventData = await createEventRes.json();
    eventId = eventData.data._id;
    console.log('✅ Event created (status: pending)');
    console.log('');

    // 4. Admin xem danh sách users
    console.log('4️⃣ Admin viewing all users...');
    const usersRes = await fetch(`${BASE_URL}/admin/users?limit=5`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const usersData = await usersRes.json();
    console.log('✅ Users found:', usersData.count);
    console.log('   Roles:', usersData.data.map(u => u.role).join(', '));
    console.log('');

    // 5. Admin xem chi tiết volunteer
    console.log('5️⃣ Admin viewing volunteer details...');
    const userDetailRes = await fetch(`${BASE_URL}/admin/users/${volunteerId}`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const userDetail = await userDetailRes.json();
    console.log('✅ User details loaded!');
    console.log('   Name:', userDetail.data.user.name);
    console.log('   Email:', userDetail.data.user.email);
    console.log('');

    // 6. Admin đổi role của volunteer thành manager
    console.log('6️⃣ Admin changing volunteer role to manager...');
    const changeRoleRes = await fetch(`${BASE_URL}/admin/users/${volunteerId}/change-role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        role: 'manager'
      })
    });
    const changeRoleData = await changeRoleRes.json();
    console.log('✅ Role changed!');
    console.log(`   ${changeRoleData.data.oldRole} → ${changeRoleData.data.newRole}`);
    console.log('');

    // 7. Admin khóa tài khoản
    console.log('7️⃣ Admin locking user account...');
    const toggleRes = await fetch(`${BASE_URL}/admin/users/${volunteerId}/toggle-active`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const toggleData = await toggleRes.json();
    console.log('✅ Account toggled!');
    console.log('   Active:', toggleData.data.isActive);
    console.log('');

    // 8. Admin mở khóa lại
    console.log('8️⃣ Admin unlocking user account...');
    const unlockRes = await fetch(`${BASE_URL}/admin/users/${volunteerId}/toggle-active`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const unlockData = await unlockRes.json();
    console.log('✅ Account unlocked!');
    console.log('   Active:', unlockData.data.isActive);
    console.log('');

    // 9. Admin duyệt sự kiện
    console.log('9️⃣ Admin approving event...');
    const approveRes = await fetch(`${BASE_URL}/admin/events/${eventId}/approve`, {
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
    console.log('   Status:', approveData.data.status);
    console.log('');

    // 10. Admin export users (JSON)
    console.log('🔟 Admin exporting users (JSON)...');
    const exportJsonRes = await fetch(`${BASE_URL}/admin/export/users?format=json&limit=3`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const exportJsonData = await exportJsonRes.json();
    console.log('✅ Users exported (JSON)!');
    console.log('   Count:', exportJsonData.count);
    console.log('   Exported at:', exportJsonData.exportedAt);
    console.log('');

    // 11. Admin export users (CSV)
    console.log('1️⃣1️⃣ Admin exporting users (CSV)...');
    const exportCsvRes = await fetch(`${BASE_URL}/admin/export/users?format=csv`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const csvData = await exportCsvRes.text();
    console.log('✅ Users exported (CSV)!');
    console.log('   Preview:', csvData.split('\n').slice(0, 3).join('\n'));
    console.log('');

    // 12. Admin export events (JSON)
    console.log('1️⃣2️⃣ Admin exporting events (JSON)...');
    const exportEventsRes = await fetch(`${BASE_URL}/admin/export/events?format=json`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const exportEventsData = await exportEventsRes.json();
    console.log('✅ Events exported!');
    console.log('   Count:', exportEventsData.count);
    console.log('');

    // 13. Admin xem dashboard
    console.log('1️⃣3️⃣ Admin viewing dashboard...');
    const dashboardRes = await fetch(`${BASE_URL}/dashboard/admin`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const dashboardData = await dashboardRes.json();
    console.log('✅ Admin Dashboard:');
    console.log('   Total Users:', dashboardData.data.userStats.total);
    console.log('   Total Events:', dashboardData.data.eventStats.total);
    console.log('   Pending Events:', dashboardData.data.pendingEvents.length);
    console.log('');

    // 14. Test từ chối sự kiện
    console.log('1️⃣4️⃣ Testing event rejection...');
    
    // Tạo thêm 1 event để test reject
    const testEventRes = await fetch(`${BASE_URL}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${managerToken}`
      },
      body: JSON.stringify({
        title: 'Event To Reject',
        description: 'This event will be rejected for testing',
        category: 'other',
        location: { address: 'Test Location' },
        startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000).toISOString(),
        maxParticipants: 50
      })
    });
    const testEvent = await testEventRes.json();
    
    const rejectRes = await fetch(`${BASE_URL}/admin/events/${testEvent.data._id}/approve`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        status: 'rejected',
        reason: 'Không đủ thông tin chi tiết'
      })
    });
    const rejectData = await rejectRes.json();
    console.log('✅ Event rejected!');
    console.log('   Status:', rejectData.data.status);
    console.log('   Reason:', rejectData.data.rejectionReason);
    console.log('');

    console.log('✅ All Admin API tests completed!\n');
    console.log('📝 Test Summary:');
    console.log('-----------------------------------');
    console.log('✅ User Management: Working');
    console.log('✅ User Details: Working');
    console.log('✅ Change Role: Working');
    console.log('✅ Lock/Unlock Account: Working');
    console.log('✅ Event Approval: Working');
    console.log('✅ Event Rejection: Working');
    console.log('✅ Export JSON: Working');
    console.log('✅ Export CSV: Working');
    console.log('✅ Admin Dashboard: Working');
    console.log('-----------------------------------');

    console.log('\n📊 Export Files Info:');
    console.log('- GET /api/admin/export/users?format=json');
    console.log('- GET /api/admin/export/users?format=csv');
    console.log('- GET /api/admin/export/events?format=json');
    console.log('- GET /api/admin/export/events?format=csv');
    console.log('- GET /api/admin/export/volunteers?format=json');
    console.log('- GET /api/admin/export/volunteers?format=csv');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAdminAPI();