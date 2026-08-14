const express = require('express');
const router = express.Router();
const { User, Friendship, Notification } = require('../models/databaseModels');
const auth = require('../middlewares/auth');

/**
 * List all platform users (for Add Friends page)
 */
router.get('/users', auth, async (req, res) => {
  try {
    const users = await User.listAll(req.user.id);
    const enrichedUsers = await Promise.all(users.map(async (u) => {
      const status = await Friendship.getStatus(req.user.id, u.id);
      return { ...u, friendshipStatus: status };
    }));
    res.json(enrichedUsers);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
});

/**
 * Search users
 */
router.get('/search', auth, async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.json([]);
    
    const users = await User.search(query, req.user.id);
    
    // Enrich with friendship status
    const enrichedUsers = await Promise.all(users.map(async (u) => {
      const status = await Friendship.getStatus(req.user.id, u.id);
      return { ...u, friendshipStatus: status };
    }));
    
    res.json(enrichedUsers);
  } catch (error) {
    res.status(500).json({ message: 'Search failed', error: error.message });
  }
});

/**
 * Send friend request
 */
router.post('/request', auth, async (req, res) => {
  try {
    const { friendId } = req.body;
    if (req.user.id === friendId) return res.status(400).json({ message: 'Cannot friend yourself' });
    
    await Friendship.request(req.user.id, friendId);
    
    // Create notification for receiver
    const sender = await User.findById(req.user.id);
    await Notification.create(
      friendId, 
      'friend_request', 
      `${sender.username || sender.email} sent you a friend request.`,
      '/add-friends'
    );
    
    res.json({ message: 'Friend request sent' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send request', error: error.message });
  }
});

/**
 * Accept friend request
 */
router.post('/accept', auth, async (req, res) => {
  try {
    const { friendId } = req.body;
    await Friendship.accept(req.user.id, friendId);
    
    const { logActivity } = require('../utils/activityLogger');
    const receiver = await User.findById(req.user.id);
    const receiverName = receiver?.username || receiver?.email?.split('@')[0] || 'Someone';
    await logActivity(req.user.id, 'friend_added', `Became friends with ${receiverName}`, { friendId });

    await Notification.create(
      friendId,
      'friend_accepted',
      `${receiverName} accepted your friend request!`,
      '/friends'
    );
    
    res.json({ message: 'Friend request accepted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to accept', error: error.message });
  }
});

/**
 * Reject friend request
 */
router.post('/reject', auth, async (req, res) => {
  try {
    const { friendId } = req.body;
    await Friendship.reject(req.user.id, friendId);
    res.json({ message: 'Friend request rejected' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to reject request', error: error.message });
  }
});

/**
 * Get friend list
 */
router.get('/list', auth, async (req, res) => {
  try {
    const friends = await Friendship.getFriends(req.user.id);
    res.json(friends);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch friends', error: error.message });
  }
});

/**
 * Get pending requests
 */
router.get('/pending', auth, async (req, res) => {
  try {
    const pending = await Friendship.getPendingRequests(req.user.id);
    res.json(pending);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch pending', error: error.message });
  }
});

module.exports = router;
