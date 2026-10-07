const CommunityRequest = require('../models/CommunityRequest');
const Channel = require('../models/Channel');
const Notification = require('../models/Notification');

/**
 * @desc    Submit a request to create a community channel
 * @route   POST /api/community-requests
 * @access  Private
 */
const createCommunityRequest = async (req, res) => {
  try {
    const { name, description, type, category, reason } = req.body;

    if (!name || !description) {
      return res.status(400).json({ message: 'Community name and description/purpose are required' });
    }

    const cleanName = name.trim();
    const slug = cleanName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if channel or existing request already exists with this slug
    const existingChannel = await Channel.findOne({ slug });
    if (existingChannel) {
      return res.status(400).json({ message: `A community named "${cleanName}" already exists` });
    }

    const existingPending = await CommunityRequest.findOne({ slug, status: 'pending' });
    if (existingPending) {
      return res.status(400).json({ message: `A pending request for "${cleanName}" is already under review` });
    }

    // If requester is already Faculty / Admin / Moderator, auto-approve and create channel directly!
    const isStaff = ['faculty', 'moderator', 'admin'].includes(req.user.role);

    if (isStaff) {
      const channel = await Channel.create({
        name: cleanName,
        slug,
        description: description.trim(),
        type: type || 'interest',
        category: category || 'Communities (Reddit-Style)',
        group: category || 'Communities (Reddit-Style)',
        icon: 'Users',
        createdBy: req.user._id,
      });

      const requestObj = await CommunityRequest.create({
        name: cleanName,
        slug,
        description: description.trim(),
        type: type || 'interest',
        category: category || 'Communities (Reddit-Style)',
        group: category || 'Communities (Reddit-Style)',
        requestedBy: req.user._id,
        reason: reason || 'Faculty/Admin direct community creation',
        status: 'approved',
        reviewedBy: req.user._id,
        reviewComment: 'Auto-approved for Faculty/Staff',
      });

      return res.status(201).json({
        message: 'Community created instantly!',
        channel,
        request: requestObj,
        autoApproved: true,
      });
    }

    // Submit request for Student
    const request = await CommunityRequest.create({
      name: cleanName,
      slug,
      description: description.trim(),
      type: type || 'interest',
      category: category || 'Communities (Reddit-Style)',
      group: category || 'Communities (Reddit-Style)',
      requestedBy: req.user._id,
      reason: reason ? reason.trim() : '',
      status: 'pending',
    });

    const populatedRequest = await CommunityRequest.findById(request._id).populate(
      'requestedBy',
      'username avatarUrl branch role email'
    );

    return res.status(201).json({
      message: 'Community creation request submitted for Faculty/Moderator approval',
      request: populatedRequest,
      autoApproved: false,
    });
  } catch (error) {
    console.error('[Create Community Request Error]:', error);
    return res.status(500).json({ message: error.message || 'Server error submitting community request' });
  }
};

/**
 * @desc    Get community requests (All for Faculty/Mods/Admins, or own for students)
 * @route   GET /api/community-requests
 * @access  Private
 */
const getCommunityRequests = async (req, res) => {
  try {
    const isStaff = ['faculty', 'moderator', 'admin'].includes(req.user.role);
    let query = {};

    if (!isStaff) {
      query.requestedBy = req.user._id;
    }

    const requests = await CommunityRequest.find(query)
      .sort({ createdAt: -1 })
      .populate('requestedBy', 'username avatarUrl branch role email')
      .populate('reviewedBy', 'username role');

    return res.status(200).json({ requests });
  } catch (error) {
    console.error('[Get Community Requests Error]:', error);
    return res.status(500).json({ message: 'Server error fetching community requests' });
  }
};

/**
 * @desc    Approve a pending community creation request
 * @route   POST /api/community-requests/:id/approve
 * @access  Private (Faculty / Moderator / Admin)
 */
const approveCommunityRequest = async (req, res) => {
  try {
    if (!['faculty', 'moderator', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Access restricted to Faculty and Moderators' });
    }

    const request = await CommunityRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: `Request is already ${request.status}` });
    }

    const { reviewComment } = req.body;

    // Create Channel document
    let channel = await Channel.findOne({ slug: request.slug });
    if (!channel) {
      channel = await Channel.create({
        name: request.name,
        slug: request.slug,
        description: request.description,
        type: request.type || 'interest',
        category: request.category || 'Communities (Reddit-Style)',
        group: request.group || 'Communities (Reddit-Style)',
        icon: 'Users',
        createdBy: request.requestedBy,
      });
    }

    request.status = 'approved';
    request.reviewedBy = req.user._id;
    request.reviewComment = reviewComment || 'Approved by Faculty/Moderator';
    await request.save();

    // Notify requester
    await Notification.create({
      recipientId: request.requestedBy,
      senderId: req.user._id,
      type: 'upvote', // system/alert notification
      message: `🎉 Great news! Your request to create community "${request.name}" was approved!`,
    });

    const populatedRequest = await CommunityRequest.findById(request._id)
      .populate('requestedBy', 'username avatarUrl branch role email')
      .populate('reviewedBy', 'username role');

    return res.status(200).json({
      message: `Community "${request.name}" approved and created successfully!`,
      request: populatedRequest,
      channel,
    });
  } catch (error) {
    console.error('[Approve Request Error]:', error);
    return res.status(500).json({ message: error.message || 'Server error approving community request' });
  }
};

/**
 * @desc    Reject a pending community creation request
 * @route   POST /api/community-requests/:id/reject
 * @access  Private (Faculty / Moderator / Admin)
 */
const rejectCommunityRequest = async (req, res) => {
  try {
    if (!['faculty', 'moderator', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Access restricted to Faculty and Moderators' });
    }

    const request = await CommunityRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: `Request is already ${request.status}` });
    }

    const { reviewComment } = req.body;

    request.status = 'rejected';
    request.reviewedBy = req.user._id;
    request.reviewComment = reviewComment || 'Declined by Faculty/Moderator review committee';
    await request.save();

    // Notify requester
    await Notification.create({
      recipientId: request.requestedBy,
      senderId: req.user._id,
      type: 'upvote',
      message: `Your community request for "${request.name}" was declined. Reason: ${request.reviewComment}`,
    });

    const populatedRequest = await CommunityRequest.findById(request._id)
      .populate('requestedBy', 'username avatarUrl branch role email')
      .populate('reviewedBy', 'username role');

    return res.status(200).json({
      message: `Community request for "${request.name}" declined`,
      request: populatedRequest,
    });
  } catch (error) {
    console.error('[Reject Request Error]:', error);
    return res.status(500).json({ message: 'Server error rejecting community request' });
  }
};

module.exports = {
  createCommunityRequest,
  getCommunityRequests,
  approveCommunityRequest,
  rejectCommunityRequest,
};
