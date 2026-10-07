const express = require('express');
const router = express.Router();
const { signup, login, refresh, getMe, toggleBookmarkPost, getSavedPosts, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/refresh', refresh);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/bookmark/:postId', protect, toggleBookmarkPost);
router.get('/saved-posts', protect, getSavedPosts);

module.exports = router;
