const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Tạo thư mục uploads nếu chưa có
const uploadDir = process.env.UPLOAD_PATH || './uploads';
const avatarDir = path.join(uploadDir, 'avatars');
const eventDir = path.join(uploadDir, 'events');
const postDir = path.join(uploadDir, 'posts');

[uploadDir, avatarDir, eventDir, postDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = uploadDir;
    
    if (req.path.includes('/avatar')) {
      folder = avatarDir;
    } else if (req.path.includes('/event')) {
      folder = eventDir;
    } else if (req.path.includes('/post')) {
      folder = postDir;
    }
    
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/jpg,image/webp').split(',');
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('File type không được hỗ trợ. Chỉ chấp nhận: ' + allowedTypes.join(', ')), false);
  }
};

// Multer config
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB default
  },
  fileFilter: fileFilter
});

// Export các upload types
exports.uploadAvatar = upload.single('avatar');
exports.uploadEventImages = upload.array('images', 10); // Max 10 images
exports.uploadPostImages = upload.array('images', 5); // Max 5 images
exports.uploadSingle = upload.single('image');

// Helper function để xóa file
exports.deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

// Helper function để lấy file URL
exports.getFileUrl = (req, filename) => {
  if (!filename) return null;
  const protocol = req.protocol;
  const host = req.get('host');
  return `${protocol}://${host}/uploads/${filename}`;
};