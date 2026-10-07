const express = require('express');
const router = express.Router();
const { getConversations, getMessagesWithUser, sendMessage } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.get('/conversations', protect, getConversations);
router.get('/:targetUserId', protect, getMessagesWithUser);
router.post('/', protect, sendMessage);

module.exports = router;
