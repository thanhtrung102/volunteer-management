const path = require('path');
const fs = require('fs');
const { processAvatar, processEventImage, processPostImage } = require('../utils/imageProcessing');
const { deleteFile, getFileUrl } = require('../middleware/upload');
const User = require('../models/User');

// @desc    Upload avatar
// @route   POST /api/upload/avatar
// @access  Private
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn file để upload'
      });
    }

    // Process image
    const processedPath = await processAvatar(req.file.path);
    const filename = path.basename(processedPath);
    const relativePath = path.join('avatars', filename);

    // Cập nhật avatar của user
    const user = await User.findById(req.user._id);
    
    // Xóa avatar cũ nếu có
    if (user.avatar) {
      const oldPath = path.join(process.env.UPLOAD_PATH || './uploads', user.avatar);
      deleteFile(oldPath);
    }

    user.avatar = relativePath;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Upload avatar thành công',
      data: {
        filename: filename,
        path: relativePath,
        url: getFileUrl(req, relativePath)
      }
    });
  } catch (error) {
    console.error(error);
    // Xóa file nếu có lỗi
    if (req.file) {
      deleteFile(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: 'Lỗi khi upload avatar',
      error: error.message
    });
  }
};

// @desc    Upload event images
// @route   POST /api/upload/event-images
// @access  Private (Manager, Admin)
exports.uploadEventImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn ít nhất 1 file'
      });
    }

    const processedImages = [];

    // Process từng image
    for (const file of req.files) {
      try {
        const processedPath = await processEventImage(file.path);
        const filename = path.basename(processedPath);
        const relativePath = path.join('events', filename);

        processedImages.push({
          filename: filename,
          path: relativePath,
          url: getFileUrl(req, relativePath)
        });
      } catch (error) {
        console.error('Error processing image:', error);
        deleteFile(file.path);
      }
    }

    res.status(200).json({
      success: true,
      message: `Upload ${processedImages.length} ảnh thành công`,
      data: processedImages
    });
  } catch (error) {
    console.error(error);
    // Xóa tất cả files nếu có lỗi
    if (req.files) {
      req.files.forEach(file => deleteFile(file.path));
    }
    res.status(500).json({
      success: false,
      message: 'Lỗi khi upload ảnh',
      error: error.message
    });
  }
};

// @desc    Upload post images
// @route   POST /api/upload/post-images
// @access  Private
exports.uploadPostImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn ít nhất 1 file'
      });
    }

    const processedImages = [];

    // Process từng image
    for (const file of req.files) {
      try {
        const processedPath = await processPostImage(file.path);
        const filename = path.basename(processedPath);
        const relativePath = path.join('posts', filename);

        processedImages.push({
          filename: filename,
          path: relativePath,
          url: getFileUrl(req, relativePath)
        });
      } catch (error) {
        console.error('Error processing image:', error);
        deleteFile(file.path);
      }
    }

    res.status(200).json({
      success: true,
      message: `Upload ${processedImages.length} ảnh thành công`,
      data: processedImages
    });
  } catch (error) {
    console.error(error);
    // Xóa tất cả files nếu có lỗi
    if (req.files) {
      req.files.forEach(file => deleteFile(file.path));
    }
    res.status(500).json({
      success: false,
      message: 'Lỗi khi upload ảnh',
      error: error.message
    });
  }
};

// @desc    Delete image
// @route   DELETE /api/upload/:path
// @access  Private
exports.deleteImage = async (req, res) => {
  try {
    const imagePath = req.params.path;
    const fullPath = path.join(process.env.UPLOAD_PATH || './uploads', imagePath);

    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({
        success: false,
        message: 'File không tồn tại'
      });
    }

    // Xóa file
    const deleted = deleteFile(fullPath);

    if (deleted) {
      res.status(200).json({
        success: true,
        message: 'Xóa file thành công'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Không thể xóa file'
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa file',
      error: error.message
    });
  }
};