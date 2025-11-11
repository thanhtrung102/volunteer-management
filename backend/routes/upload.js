const express = require('express');
const router = express.Router();
const {
  uploadAvatar,
  uploadEventImages,
  uploadPostImages,
  deleteImage
} = require('../controllers/uploadController');
const { protect, authorize } = require('../middleware/auth');
const {
  uploadAvatar: uploadAvatarMiddleware,
  uploadEventImages: uploadEventImagesMiddleware,
  uploadPostImages: uploadPostImagesMiddleware
} = require('../middleware/upload');

// All routes require authentication
router.use(protect);

// @route   POST /api/upload/avatar
// @desc    Upload avatar
router.post('/avatar', uploadAvatarMiddleware, uploadAvatar);

// @route   POST /api/upload/event-images
// @desc    Upload event images (Manager, Admin)
router.post(
  '/event-images',
  authorize('manager', 'admin'),
  uploadEventImagesMiddleware,
  uploadEventImages
);

// @route   POST /api/upload/post-images
// @desc    Upload post images
router.post('/post-images', uploadPostImagesMiddleware, uploadPostImages);

// @route   DELETE /api/upload/:path
// @desc    Delete image
router.delete('/:path(*)', deleteImage);

module.exports = router;