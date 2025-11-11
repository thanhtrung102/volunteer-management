// Test API Script
// Chạy: node test-api.js

const BASE_URL = 'http://localhost:5000/api';
let token = '';

async function testAPI() {
  console.log('🚀 Starting API Tests...\n');

  try {
    // 1. Test Health
    console.log('1️⃣ Testing Health Check...');
    const healthRes = await fetch(`${BASE_URL}/health`);
    const health = await healthRes.json();
    console.log('✅ Health:', health);
    console.log('');

    // 2. Register User
    console.log('2️⃣ Registering new user...');
    const registerRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: `test${Date.now()}@example.com`,
        password: 'password123',
        role: 'volunteer'
      })
    });
    const registerData = await registerRes.json();
    
    if (registerData.success) {
      token = registerData.data.token;
      console.log('✅ Register successful!');
      console.log('📝 Token:', token.substring(0, 50) + '...');
    } else {
      console.log('❌ Register failed:', registerData.message);
    }
    console.log('');

    // 3. Get My Profile
    console.log('3️⃣ Getting user profile...');
    const meRes = await fetch(`${BASE_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const meData = await meRes.json();
    console.log('✅ Profile:', meData.data?.name, meData.data?.email);
    console.log('');

    // 4. Get Events
    console.log('4️⃣ Getting events list...');
    const eventsRes = await fetch(`${BASE_URL}/events`);
    const eventsData = await eventsRes.json();
    console.log('✅ Events found:', eventsData.count || 0);
    console.log('');

    // 5. Register Manager
    console.log('5️⃣ Registering Manager account...');
    const managerRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Manager',
        email: `manager${Date.now()}@example.com`,
        password: 'password123',
        role: 'manager'
      })
    });
    const managerData = await managerRes.json();
    
    if (managerData.success) {
      const managerToken = managerData.data.token;
      console.log('✅ Manager registered!');
      
      // Create Event
      console.log('6️⃣ Creating event...');
      const createEventRes = await fetch(`${BASE_URL}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${managerToken}`
        },
        body: JSON.stringify({
          title: 'Test Event - Trồng cây',
          description: 'Sự kiện trồng cây test',
          category: 'tree_planting',
          location: {
            address: 'Hà Nội'
          },
          startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
          maxParticipants: 50
        })
      });
      const eventData = await createEventRes.json();
      console.log('✅ Event created:', eventData.data?.title);
      console.log('');
    }

    // 7. Register Admin
    console.log('7️⃣ Registering Admin account...');
    const adminRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Admin User',
        email: `admin${Date.now()}@example.com`,
        password: 'password123',
        role: 'admin'
      })
    });
    const adminData = await adminRes.json();
    
    if (adminData.success) {
      console.log('✅ Admin registered!');
      console.log('📧 Admin Email:', adminData.data.email);
      console.log('🔑 Admin Password: password123');
    }
    console.log('');

    console.log('✅ All tests completed!\n');
    console.log('📝 Save these credentials:');
    console.log('-----------------------------------');
    console.log('Volunteer Email:', registerData.data?.email);
    console.log('Manager Email:', managerData.data?.email);
    console.log('Admin Email:', adminData.data?.email);
    console.log('Password (all): password123');
    console.log('-----------------------------------');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAPI();