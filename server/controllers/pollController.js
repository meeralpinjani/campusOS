const Poll = require('../models/Poll');
const Post = require('../models/Post');

/**
 * @desc    Create a campus pulse poll
 * @route   POST /api/polls
 * @access  Private (Faculty, Admin, Moderator, or Student Council)
 */
const createPoll = async (req, res) => {
  try {
    const { question, options, targetRoles, targetBranches, postId } = req.body;

    if (!question || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ message: 'Poll question and at least 2 options are required' });
    }

    const formattedOptions = options.map((opt) => ({
      text: typeof opt === 'string' ? opt.trim() : opt.text.trim(),
      votes: 0,
    }));

    const poll = await Poll.create({
      question: question.trim(),
      options: formattedOptions,
      createdBy: req.user._id,
      postId: postId || null,
      targetRoles: Array.isArray(targetRoles) ? targetRoles : [],
      targetBranches: Array.isArray(targetBranches) ? targetBranches : [],
      voters: [],
      totalVotes: 0,
    });

    const populatedPoll = await Poll.findById(poll._id).populate(
      'createdBy',
      'username avatarUrl role branch'
    );

    return res.status(201).json({
      message: 'Poll created successfully',
      poll: populatedPoll,
    });
  } catch (error) {
    console.error('[Create Poll Error]:', error);
    return res.status(500).json({ message: error.message || 'Server error creating poll' });
  }
};

/**
 * @desc    Get poll details by ID
 * @route   GET /api/polls/:id
 * @access  Public
 */
const getPollById = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id).populate(
      'createdBy',
      'username avatarUrl role branch'
    );

    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    return res.status(200).json({ poll });
  } catch (error) {
    console.error('[Get Poll Error]:', error);
    return res.status(500).json({ message: 'Server error fetching poll' });
  }
};

/**
 * @desc    Vote on a poll (Anti-Tamper Database-Level Single Vote Enforcement)
 * @route   POST /api/polls/:id/vote
 * @access  Private (Role & Branch Gated)
 */
const votePoll = async (req, res) => {
  try {
    const { optionId } = req.body;
    const userId = req.user._id;

    if (!optionId) {
      return res.status(400).json({ message: 'Option selection is required' });
    }

    const poll = await Poll.findById(req.params.id);
    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    // Role Gating Check
    if (poll.targetRoles && poll.targetRoles.length > 0) {
      if (!poll.targetRoles.includes(req.user.role)) {
        return res.status(403).json({
          message: `Voting restricted to roles: ${poll.targetRoles.join(', ')}`,
        });
      }
    }

    // Branch Gating Check
    if (poll.targetBranches && poll.targetBranches.length > 0) {
      if (!poll.targetBranches.includes(req.user.branch)) {
        return res.status(403).json({
          message: `Voting restricted to department branch: ${poll.targetBranches.join(', ')}`,
        });
      }
    }

    // Anti-Tamper Check 1: In-Memory / Array check
    const hasVoted = poll.voters.some((v) => v.userId.toString() === userId.toString());
    if (hasVoted) {
      return res.status(400).json({ message: 'Anti-Tamper Security: You have already voted in this poll' });
    }

    // Anti-Tamper Check 2: Atomic Mongoose update enforcing 'voters.userId' !== userId
    const updatedPoll = await Poll.findOneAndUpdate(
      {
        _id: poll._id,
        'voters.userId': { $ne: userId },
        'options._id': optionId,
      },
      {
        $push: {
          voters: {
            userId,
            optionId,
            votedAt: new Date(),
          },
        },
        $inc: {
          'options.$.votes': 1,
          totalVotes: 1,
        },
      },
      { new: true }
    ).populate('createdBy', 'username avatarUrl role branch');

    if (!updatedPoll) {
      return res.status(400).json({ message: 'Vote failed or you have already recorded a vote' });
    }

    return res.status(200).json({
      message: 'Vote cast successfully!',
      poll: updatedPoll,
      userVotedOptionId: optionId,
    });
  } catch (error) {
    console.error('[Vote Poll Error]:', error);
    return res.status(500).json({ message: 'Server error casting vote' });
  }
};

module.exports = {
  createPoll,
  getPollById,
  votePoll,
};
