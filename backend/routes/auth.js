const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  savePushSubscription
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Validation rules
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Tên không được để trống'),
  body('email').isEmail().withMessage('Email không hợp lệ'),
  body('password').isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự')
];

// @route   POST /api/auth/register
router.post('/register', registerValidation, register);

// @route   POST /api/auth/login
router.post('/login', login);

// @route   GET /api/auth/me
router.get('/me', protect, getMe);

// @route   PUT /api/auth/profile
router.put('/profile', protect, updateProfile);

// @route   PUT /api/auth/password
router.put('/password', protect, changePassword);

// @route   POST /api/auth/push-subscription
router.post('/push-subscription', protect, savePushSubscription);

module.exports = router;