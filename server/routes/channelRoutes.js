const express = require('express');
const router = express.Router();
const { getChannels, getChannelBySlug, createChannel, deleteChannel } = require('../controllers/channelController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Public route to view channels (optional protect to auto-seed if empty)
router.get('/', (req, res, next) => {
  if (req.headers.authorization) {
    return protect(req, res, () => getChannels(req, res));
  }
  return getChannels(req, res);
});

router.get('/:slug', getChannelBySlug);

// Faculty, Moderator, or Admin can create channels
router.post('/', protect, authorizeRoles('faculty', 'moderator', 'admin'), createChannel);

// Moderator or Admin can delete channels
router.delete('/:id', protect, authorizeRoles('moderator', 'admin'), deleteChannel);

module.exports = router;

