const express = require('express');
const router = express.Router();
const {
  sendIdea,
  getConversation,
  getInbox,
  getFriendStreaks,
} = require('../controllers/messageController');

router.post('/send-idea', sendIdea);
router.get('/inbox', getInbox);
router.get('/streaks', getFriendStreaks);
router.get('/with/:friendId', getConversation);

module.exports = router;
