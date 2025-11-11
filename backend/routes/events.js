const express = require('express');
const router = express.Router();
const {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  approveEvent,
  getMyEvents
} = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { eventSchema, updateEventSchema } = require('../utils/validators');

// Public routes
// @route   GET /api/events
router.get('/', getEvents);

// @route   GET /api/events/:id
router.get('/:id', getEvent);

// Protected routes
// @route   GET /api/events/my/list
router.get('/my/list', protect, authorize('manager', 'admin'), getMyEvents);

// @route   POST /api/events
router.post(
  '/',
  protect,
  authorize('manager', 'admin'),
  validate(eventSchema),
  createEvent
);

// @route   PUT /api/events/:id
router.put(
  '/:id',
  protect,
  authorize('manager', 'admin'),
  validate(updateEventSchema),
  updateEvent
);

// @route   DELETE /api/events/:id
router.delete('/:id', protect, authorize('manager', 'admin'), deleteEvent);

// @route   PUT /api/events/:id/approve
router.put('/:id/approve', protect, authorize('admin'), approveEvent);

module.exports = router;