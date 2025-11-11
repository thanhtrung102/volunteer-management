const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Initialize express app
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketIO(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Make io accessible to routes
app.set('io', io);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Quá nhiều requests từ IP này, vui lòng thử lại sau'
});

app.use('/api/', limiter);

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, process.env.UPLOAD_PATH || 'uploads')));

// Socket.IO connection handling
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // User joins with their ID
  socket.on('user:join', (userId) => {
    onlineUsers.set(userId, socket.id);
    socket.userId = userId;
    
    // Broadcast online users count
    io.emit('users:online', onlineUsers.size);
    console.log(`User ${userId} joined. Online users: ${onlineUsers.size}`);
  });

  // User leaves
  socket.on('disconnect', () => {
    if (socket.userId) {
      onlineUsers.delete(socket.userId);
      io.emit('users:online', onlineUsers.size);
      console.log(`User ${socket.userId} left. Online users: ${onlineUsers.size}`);
    }
  });
});

// Export io for use in controllers
global.io = io;
global.onlineUsers = onlineUsers;

// Import routes
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const registrationRoutes = require('./routes/registrations');
const postRoutes = require('./routes/posts');
const dashboardRoutes = require('./routes/dashboard');
const managerRoutes = require('./routes/manager');
const adminRoutes = require('./routes/admin');
const uploadRoutes = require('./routes/upload');
const notificationRoutes = require('./routes/notifications');

// Welcome route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Volunteer Management API',
    version: '2.0.0',
    features: {
      imageUpload: 'enabled',
      realtime: 'enabled',
      notifications: 'enabled'
    },
    endpoints: {
      auth: '/api/auth',
      events: '/api/events',
      registrations: '/api/registrations',
      posts: '/api/posts',
      dashboard: '/api/dashboard',
      manager: '/api/manager',
      admin: '/api/admin',
      upload: '/api/upload',
      notifications: '/api/notifications',
      health: '/api/health'
    },
    documentation: 'See API_DOCUMENTATION.md for detailed API docs'
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    onlineUsers: onlineUsers.size
  });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/manager', managerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/notifications', notificationRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('✅ Socket.IO initialized');
  console.log('✅ File upload enabled');
  console.log('✅ Rate limiting enabled');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

module.exports = app;