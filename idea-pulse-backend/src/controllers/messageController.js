const { Message, Friendship, Notification, Streak, User } = require('../models/databaseModels');
const { logActivity } = require('../utils/activityLogger');

exports.sendIdea = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user.id;

    if (!receiverId || !content?.trim()) {
      return res.status(400).json({ message: 'receiverId and content are required' });
    }
    if (senderId === receiverId) {
      return res.status(400).json({ message: 'Cannot send an idea to yourself' });
    }

    const status = await Friendship.getStatus(senderId, receiverId);
    if (status !== 'accepted') {
      return res.status(403).json({ message: 'You can only send ideas to accepted friends' });
    }

    const messageId = await Message.send(senderId, receiverId, content.trim(), 'idea');
    const streak = await Streak.update(senderId, receiverId);

    const sender = await User.findById(senderId);
    const senderName = sender?.username || sender?.email?.split('@')[0] || 'A friend';

    await Notification.create(
      receiverId,
      'idea_received',
      `${senderName} sent you an idea! 🔥 Streak: ${streak.count} days`,
      '/friends'
    );

    await logActivity(senderId, 'idea_sent', `Sent an idea to ${senderName}`, { receiverId, streak: streak.count });
    await logActivity(receiverId, 'idea_received', `Received an idea from ${senderName}`, { senderId, streak: streak.count });

    res.status(201).json({ message: 'Idea sent!', messageId, streak: streak.count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getConversation = async (req, res) => {
  try {
    const friendId = parseInt(req.params.friendId, 10);
    const messages = await Message.getConversation(req.user.id, friendId);
    const streak = await Streak.get(req.user.id, friendId);
    res.json({ messages, streak });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getInbox = async (req, res) => {
  try {
    const inbox = await Message.getInbox(req.user.id);
    res.json(inbox);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getFriendStreaks = async (req, res) => {
  try {
    const friends = await Friendship.getFriends(req.user.id);
    const streaks = await Promise.all(
      friends.map(async (f) => ({
        ...f,
        streak: await Streak.get(req.user.id, f.id),
      }))
    );
    res.json(streaks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
