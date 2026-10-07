const Notification = require('../models/Notification');

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipientId: req.user._id })
      .populate('senderId', 'username avatarUrl role')
      .populate('postId', 'title')
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({
      recipientId: req.user._id,
      isRead: false,
    });

    return res.status(200).json({ notifications, unreadCount });
  } catch (error) {
    console.error('Get Notifications Error:', error);
    return res.status(500).json({ message: 'Server error fetching notifications' });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ recipientId: req.user._id, isRead: false }, { isRead: true });
    return res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark Read Error:', error);
    return res.status(500).json({ message: 'Server error marking notifications read' });
  }
};

module.exports = {
  getNotifications,
  markAllAsRead,
};
