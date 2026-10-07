const Comment = require('../models/Comment');
const Post = require('../models/Post');
const User = require('../models/User');

/**
 * @desc    Get all comments for a specific post structured as a tree
 * @route   GET /api/comments/post/:postId
 * @access  Public
 */
const getCommentsByPost = async (req, res) => {
  try {
    const { postId } = req.params;

    const comments = await Comment.find({ postId, isDeleted: false })
      .sort({ createdAt: 1 })
      .populate('authorId', 'username avatarUrl branch year role reputationScore');

    // Build comment tree (nesting children inside parents)
    const commentMap = {};
    const tree = [];

    comments.forEach((c) => {
      commentMap[c._id.toString()] = { ...c.toObject(), replies: [] };
    });

    comments.forEach((c) => {
      const cid = c._id.toString();
      if (c.parentCommentId && commentMap[c.parentCommentId.toString()]) {
        commentMap[c.parentCommentId.toString()].replies.push(commentMap[cid]);
      } else {
        tree.push(commentMap[cid]);
      }
    });

    return res.status(200).json({ comments: tree, totalComments: comments.length });
  } catch (error) {
    console.error('[Get Comments Error]:', error);
    return res.status(500).json({ message: 'Server error fetching comments' });
  }
};

/**
 * @desc    Create new comment or reply
 * @route   POST /api/comments/post/:postId
 * @access  Private (Logged-in User)
 */
const createComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, parentCommentId } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    const post = await Post.findById(postId);
    if (!post || post.isRemoved) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (parentCommentId) {
      const parent = await Comment.findById(parentCommentId);
      if (!parent) {
        return res.status(404).json({ message: 'Parent comment not found' });
      }
    }

    const comment = await Comment.create({
      postId,
      authorId: req.user._id,
      parentCommentId: parentCommentId || null,
      content: content.trim(),
    });

    // Increment comment count on Post
    post.commentCount = (post.commentCount || 0) + 1;
    await post.save();

    // Reward user +2 reputation points for commenting
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { reputationScore: 2 },
    });

    // Send Notification to Post Author
    if (post.authorId.toString() !== req.user._id.toString()) {
      const Notification = require('../models/Notification');
      await Notification.create({
        recipientId: post.authorId,
        senderId: req.user._id,
        type: 'comment',
        postId: post._id,
        message: `${req.user.username} commented on your post: "${post.title.substring(0, 30)}..."`,
      });
    }

    const populatedComment = await Comment.findById(comment._id).populate(
      'authorId',
      'username avatarUrl branch year role reputationScore'
    );

    return res.status(201).json({
      message: 'Comment created successfully',
      comment: { ...populatedComment.toObject(), replies: [] },
    });
  } catch (error) {
    console.error('[Create Comment Error]:', error);
    return res.status(500).json({ message: 'Server error creating comment' });
  }
};

/**
 * @desc    Delete comment
 * @route   DELETE /api/comments/:commentId
 * @access  Private (Author or Staff)
 */
const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const isAuthor = comment.authorId.toString() === req.user._id.toString();
    const isStaff = ['moderator', 'admin'].includes(req.user.role);

    if (!isAuthor && !isStaff) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    comment.isDeleted = true;
    await comment.save();

    // Decrement post commentCount
    await Post.findByIdAndUpdate(comment.postId, {
      $inc: { commentCount: -1 },
    });

    return res.status(200).json({ message: 'Comment deleted successfully', commentId });
  } catch (error) {
    console.error('[Delete Comment Error]:', error);
    return res.status(500).json({ message: 'Server error deleting comment' });
  }
};

module.exports = {
  getCommentsByPost,
  createComment,
  deleteComment,
};
