const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getListings,
  createListing,
  getListingById,
  updateListing,
  flagListing,
  getModerationQueue,
  moderateListing,
} = require('../controllers/marketplaceController');

router.route('/')
  .get(getListings)
  .post(protect, createListing);

router.get('/moderation/queue', protect, getModerationQueue);

router.route('/:id')
  .get(getListingById)
  .put(protect, updateListing);

router.post('/:id/flag', protect, flagListing);
router.post('/:id/moderate', protect, moderateListing);

module.exports = router;
