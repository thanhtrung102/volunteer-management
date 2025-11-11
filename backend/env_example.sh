# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/volunteer-management

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=30d

# Web Push Notifications (Generate from https://web-push-codelab.glitch.me/)
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
ADMIN_EMAIL=admin@volunteer.com

# CORS
CORS_ORIGIN=http://localhost:3000

# Upload Configuration (if using file uploads)
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads