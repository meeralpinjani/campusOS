const Message = require('../models/Message');
const User = require('../models/User');

const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    // Find all users except current user
    const users = await User.find({ _id: { $ne: userId } })
      .select('username email avatarUrl role branch year reputationScore')
      .sort({ username: 1 });

    return res.status(200).json({ users });
  } catch (error) {
    console.error('Get Conversations Error:', error);
    return res.status(500).json({ message: 'Server error fetching chat users' });
  }
};

const getMessagesWithUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const { targetUserId } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: userId, recipientId: targetUserId },
        { senderId: targetUserId, recipientId: userId },
      ],
    })
      .sort({ createdAt: 1 })
      .limit(100);

    return res.status(200).json({ messages });
  } catch (error) {
    console.error('Get Messages Error:', error);
    return res.status(500).json({ message: 'Server error fetching messages' });
  }
};

const sendMessage = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { recipientId, content } = req.body;

    if (!recipientId || !content || !content.trim()) {
      return res.status(400).json({ message: 'Recipient and content are required' });
    }

    const message = await Message.create({
      senderId,
      recipientId,
      content: content.trim(),
    });

    const populated = await Message.findById(message._id)
      .populate('senderId', 'username avatarUrl')
      .populate('recipientId', 'username avatarUrl');

    return res.status(201).json({ message: populated });
  } catch (error) {
    console.error('Send Message Error:', error);
    return res.status(500).json({ message: 'Server error sending message' });
  }
};

module.exports = {
  getConversations,
  getMessagesWithUser,
  sendMessage,
};
