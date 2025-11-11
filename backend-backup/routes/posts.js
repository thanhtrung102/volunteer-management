const express = require('express');
const router = express.Router();
const {
  createPost,
  getEventPosts,
  updatePost,
  deletePost,
  toggleLike,
  addComment,
  deleteComment
} = require('../controllers/postController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { postSchema, commentSchema } = require('../utils/validators');

// All routes require authentication

// @route   POST /api/posts/:eventId
router.post('/:eventId', protect, validate(postSchema), createPost);

// @route   GET /api/posts/:eventId
router.get('/:eventId', protect, getEventPosts);

// @route   PUT /api/posts/:id
router.put('/:id', protect, validate(postSchema), updatePost);

// @route   DELETE /api/posts/:id
router.delete('/:id', protect, deletePost);

// @route   PUT /api/posts/:id/like
router.put('/:id/like', protect, toggleLike);

// @route   POST /api/posts/:id/comments
router.post('/:id/comments', protect, validate(commentSchema), addComment);

// @route   DELETE /api/posts/:id/comments/:commentId
router.delete('/:id/comments/:commentId', protect, deleteComment);

module.exports = router;