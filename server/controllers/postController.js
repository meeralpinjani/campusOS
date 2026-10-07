const Post = require('../models/Post');
const Channel = require('../models/Channel');
const { calculateHotScore } = require('../services/scoring.service');

/**
 * @desc    Get paginated/filtered feed of posts
 * @route   GET /api/posts
 * @access  Public
 */
const getPosts = async (req, res) => {
  try {
    const { channel, tag, sort = 'hot', isNotice, page = 1, limit = 20 } = req.query;

    const query = { isRemoved: false };

    // Notice filter
    if (isNotice === 'true') {
      query.isNotice = true;
    }

    // Filter by Channel slug or ID
    if (channel) {
      if (channel.match(/^[0-9a-fA-F]{24}$/)) {
        query.channelId = channel;
      } else {
        const foundChannel = await Channel.findOne({ slug: channel });
        if (foundChannel) {
          query.channelId = foundChannel._id;
        } else {
          return res.status(200).json({ posts: [], page: 1, totalPages: 0 });
        }
      }
    }

    // Filter by Tag
    if (tag) {
      query.tags = tag;
    }

    let sortOptions = { isNotice: -1, isPinned: -1, hotScore: -1 };
    if (sort === 'new') {
      sortOptions = { isNotice: -1, isPinned: -1, createdAt: -1 };
    } else if (sort === 'top') {
      sortOptions = { isNotice: -1, isPinned: -1, score: -1, createdAt: -1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const posts = await Post.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('authorId', 'username avatarUrl branch year role reputationScore')
      .populate('channelId', 'name slug type');

    const totalPosts = await Post.countDocuments(query);

    return res.status(200).json({
      posts,
      page: parseInt(page),
      totalPages: Math.ceil(totalPosts / parseInt(limit)),
      totalPosts,
    });
  } catch (error) {
    console.error('[Get Posts Error]:', error);
    return res.status(500).json({ message: 'Server error fetching posts feed' });
  }
};

/**
 * @desc    Create new post with attachments (Images, Videos, PDFs) & notice flag
 * @route   POST /api/posts
 * @access  Private (Logged-in User)
 */
const NoticeSequence = require('../models/NoticeSequence');

/**
 * @desc    Get next sequential notice number for an academic year
 * @route   GET /api/posts/notice-sequence
 * @access  Private (Faculty / Moderator / Admin)
 */
const getNoticeSequence = async (req, res) => {
  try {
    const academicYear = req.query.academicYear || '2026-27';
    let seq = await NoticeSequence.findOne({ academicYear });
    let nextNum = 1;
    if (seq) {
      nextNum = seq.lastSequenceNumber + 1;
    }
    const formattedNoticeNo = `${academicYear}/${String(nextNum).padStart(3, '0')}`;
    return res.status(200).json({
      academicYear,
      nextSequenceNumber: nextNum,
      formattedNoticeNo,
    });
  } catch (error) {
    console.error('[Get Notice Sequence Error]:', error);
    return res.status(500).json({ message: 'Error fetching notice sequence' });
  }
};

/**
 * @desc    Create new post with attachments (Images, Videos, PDFs) & notice flag
 * @route   POST /api/posts
 * @access  Private (Logged-in User)
 */
const createPost = async (req, res) => {
  try {
    const { title, body, channelId, tags, attachments, isNotice, noticeMetadata } = req.body;

    if (!title || !body || !channelId) {
      return res.status(400).json({ message: 'Title, body, and channel are required' });
    }

    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({ message: 'Selected channel does not exist' });
    }

    // Check Official Announcements Channel posting permissions (Faculty, Moderator, Admin)
    const isOfficialChannel =
      channel.group === 'Official Announcements' ||
      channel.isRestricted ||
      ['official-notices', 'general-lounge'].includes(channel.slug);

    if (isOfficialChannel && !['faculty', 'moderator', 'admin'].includes(req.user.role)) {
      return res.status(403).json({
        message: 'Forbidden: Only Faculty, Moderators, and Admins are permitted to create posts in Official Announcements channels.',
      });
    }

    // Only faculty, moderator, or admin can publish official notices
    const canPublishNotice = ['faculty', 'moderator', 'admin'].includes(req.user.role);
    if (isNotice && !canPublishNotice) {
      return res.status(403).json({
        message: 'Forbidden: Only Faculty, Moderator, or Admin roles can create official notices.',
      });
    }
    const noticeFlag = isNotice && canPublishNotice;

    // Handle auto-incrementing notice number per academic year
    let finalNoticeMetadata = null;
    if (noticeFlag && noticeMetadata) {
      const academicYear = noticeMetadata.academicYear || '2026-27';
      const updatedSeq = await NoticeSequence.findOneAndUpdate(
        { academicYear },
        { $inc: { lastSequenceNumber: 1 } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      const generatedNoticeNo = `${academicYear}/${String(updatedSeq.lastSequenceNumber).padStart(3, '0')}`;
      finalNoticeMetadata = {
        ...noticeMetadata,
        academicYear,
        noticeNo: generatedNoticeNo,
      };
    }

    // Process tags
    let tagArray = [];
    if (Array.isArray(tags)) {
      tagArray = tags.map((t) => t.replace(/^#+/, '').trim()).filter(Boolean);
    } else if (typeof tags === 'string' && tags.trim()) {
      tagArray = tags.split(',').map((t) => t.replace(/^#+/, '').trim()).filter(Boolean);
    }

    const now = new Date();
    const hotScore = calculateHotScore(0, 0, now);

    const post = await Post.create({
      authorId: req.user._id,
      channelId,
      title: title.trim(),
      body: body.trim(),
      tags: tagArray,
      attachments: Array.isArray(attachments) ? attachments : [],
      noticeMetadata: finalNoticeMetadata,
      upvotes: 0,
      downvotes: 0,
      score: 0,
      hotScore,
      isNotice: noticeFlag,
      createdAt: now,
    });

    const populatedPost = await Post.findById(post._id)
      .populate('authorId', 'username avatarUrl branch year role reputationScore')
      .populate('channelId', 'name slug type');

    return res.status(201).json({
      message: 'Post created successfully',
      post: populatedPost,
    });
  } catch (error) {
    console.error('[Create Post Error]:', error);
    return res.status(500).json({ message: error.message || 'Server error creating post' });
  }
};

const getPostById = async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, isRemoved: false })
      .populate('authorId', 'username avatarUrl branch year role reputationScore')
      .populate('channelId', 'name slug type');

    if (!post) {
      return res.status(404).json({ message: 'Post not found or has been removed' });
    }

    return res.status(200).json({ post });
  } catch (error) {
    console.error('[Get Post By ID Error]:', error);
    return res.status(500).json({ message: 'Server error fetching post' });
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const isAuthor = post.authorId.toString() === req.user._id.toString();
    const isStaff = ['moderator', 'admin'].includes(req.user.role);

    if (!isAuthor && !isStaff) {
      return res.status(403).json({ message: 'Forbidden: You are not authorized to delete this post' });
    }

    post.isRemoved = true;
    await post.save();

    return res.status(200).json({ message: 'Post removed successfully', postId: post._id });
  } catch (error) {
    console.error('[Delete Post Error]:', error);
    return res.status(500).json({ message: 'Server error deleting post' });
  }
};

/**
 * @desc    Vote on a post (upvote / downvote / none)
 * @route   POST /api/posts/:id/vote
 * @access  Private (Logged-in User)
 */
const votePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { voteType } = req.body; // 'upvote', 'downvote', or 'none'
    const userId = req.user._id.toString();

    const post = await Post.findById(id);
    if (!post || post.isRemoved) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.authorId.toString() === userId) {
      return res.status(400).json({ message: 'You cannot vote on your own post' });
    }

    const hasUpvoted = post.upvotedBy.some((uid) => uid.toString() === userId);
    const hasDownvoted = post.downvotedBy.some((uid) => uid.toString() === userId);

    let reputationDelta = 0;

    // Remove existing vote states
    if (hasUpvoted) {
      post.upvotedBy = post.upvotedBy.filter((uid) => uid.toString() !== userId);
      reputationDelta -= 5;
    }
    if (hasDownvoted) {
      post.downvotedBy = post.downvotedBy.filter((uid) => uid.toString() !== userId);
      reputationDelta += 2;
    }

    // Apply new vote state
    if (voteType === 'upvote' && !hasUpvoted) {
      post.upvotedBy.push(req.user._id);
      reputationDelta += 5;

      // Notification
      if (post.authorId.toString() !== userId) {
        const Notification = require('../models/Notification');
        await Notification.create({
          recipientId: post.authorId,
          senderId: req.user._id,
          type: 'upvote',
          postId: post._id,
          message: `${req.user.username} upvoted your post: "${post.title.substring(0, 30)}..."`,
        });
      }
    } else if (voteType === 'downvote' && !hasDownvoted) {
      post.downvotedBy.push(req.user._id);
      reputationDelta -= 2;
    }

    post.upvotes = post.upvotedBy.length;
    post.downvotes = post.downvotedBy.length;
    post.score = post.upvotes - post.downvotes;
    post.hotScore = calculateHotScore(post.upvotes, post.downvotes, post.createdAt);

    await post.save();

    // Update post author reputation
    if (reputationDelta !== 0 && post.authorId.toString() !== userId) {
      const User = require('../models/User');
      await User.findByIdAndUpdate(post.authorId, {
        $inc: { reputationScore: reputationDelta },
      });
    }

    const effectiveUserVote = post.upvotedBy.some((uid) => uid.toString() === userId)
      ? 'upvote'
      : post.downvotedBy.some((uid) => uid.toString() === userId)
      ? 'downvote'
      : 'none';

    return res.status(200).json({
      message: 'Vote updated successfully',
      score: post.score,
      upvotes: post.upvotes,
      downvotes: post.downvotes,
      userVote: effectiveUserVote,
    });
  } catch (error) {
    console.error('[Vote Post Error]:', error);
    return res.status(500).json({ message: 'Server error processing vote' });
  }
};

module.exports = {
  getPosts,
  createPost,
  getPostById,
  deletePost,
  votePost,
  getNoticeSequence,
};

