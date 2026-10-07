const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createCommunityRequest,
  getCommunityRequests,
  approveCommunityRequest,
  rejectCommunityRequest,
} = require('../controllers/communityRequestController');

router.use(protect);

router.route('/')
  .post(createCommunityRequest)
  .get(getCommunityRequests);

router.post('/:id/approve', approveCommunityRequest);
router.post('/:id/reject', rejectCommunityRequest);

module.exports = router;
