const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createPoll,
  getPollById,
  votePoll,
} = require('../controllers/pollController');

router.post('/', protect, createPoll);
router.get('/:id', getPollById);
router.post('/:id/vote', protect, votePoll);

module.exports = router;
