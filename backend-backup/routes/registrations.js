const express = require('express');
const router = express.Router();
const {
  registerEvent,
  cancelRegistration,
  getMyRegistrations,
  getEventRegistrations,
  completeRegistration,
  addFeedback
} = require('../controllers/registrationController');
const { protect, authorize } = require('../middleware/auth');

// Volunteer routes
// @route   POST /api/registrations/:eventId
router.post('/:eventId', protect, authorize('volunteer'), registerEvent);

// @route   PUT /api/registrations/:id/cancel
router.put('/:id/cancel', protect, authorize('volunteer'), cancelRegistration);

// @route   GET /api/registrations/my-registrations
router.get('/my/list', protect, authorize('volunteer'), getMyRegistrations);

// @route   PUT /api/registrations/:id/feedback
router.put('/:id/feedback', protect, authorize('volunteer'), addFeedback);

// Manager/Admin routes
// @route   GET /api/registrations/event/:eventId
router.get('/event/:eventId', protect, authorize('manager', 'admin'), getEventRegistrations);

// @route   PUT /api/registrations/:id/complete
router.put('/:id/complete', protect, authorize('manager', 'admin'), completeRegistration);

module.exports = router;