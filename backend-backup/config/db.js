const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Kiểm tra có MongoDB URI không
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in .env file');
    }

    console.log('Connecting to MongoDB...');
    console.log('URI:', process.env.MONGODB_URI.replace(/\/\/.*:.*@/, '//***:***@')); // Hide credentials

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📦 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:');
    console.error('Error:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.error('\n💡 Solutions:');
      console.error('1. Make sure MongoDB is installed');
      console.error('2. Start MongoDB service:');
      console.error('   - MacOS: brew services start mongodb-community');
      console.error('   - Linux: sudo systemctl start mongod');
      console.error('   - Windows: net start MongoDB');
      console.error('3. Or run: mongod');
    }
    
    process.exit(1);
  }
};

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected from MongoDB');
});

module.exports = connectDB;