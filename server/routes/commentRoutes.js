const express = require('express');
const router = express.Router();
const {
  getCommentsByPost,
  createComment,
  deleteComment,
} = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');

// Public route to fetch comments for a post
router.get('/post/:postId', getCommentsByPost);

// Protected routes
router.post('/post/:postId', protect, createComment);
router.delete('/:commentId', protect, deleteComment);

module.exports = router;
