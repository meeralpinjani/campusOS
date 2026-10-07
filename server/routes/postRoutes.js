const express = require('express');
const router = express.Router();
const { getPosts, createPost, getPostById, deletePost, votePost, getNoticeSequence } = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getPosts);
router.get('/notice-sequence', protect, getNoticeSequence);
router.get('/:id', getPostById);

// Protected routes
router.post('/', protect, createPost);
router.post('/:id/vote', protect, votePost);
router.delete('/:id', protect, deletePost);

module.exports = router;
