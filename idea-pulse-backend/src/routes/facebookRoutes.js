const express = require('express');
const router = express.Router();
const { saveToken, getStatus, disconnect, publishPost, syncEngagement, getPostDetails } = require('../controllers/facebookController');
const authMiddleware = require('../middlewares/auth');

router.post('/save-token', authMiddleware, saveToken);
router.get('/status', authMiddleware, getStatus);
router.post('/disconnect', authMiddleware, disconnect);
router.post('/post', authMiddleware, publishPost);
router.get('/sync-engagement', authMiddleware, syncEngagement);
router.get('/post-details/:fbPostId', authMiddleware, getPostDetails);

module.exports = router;
