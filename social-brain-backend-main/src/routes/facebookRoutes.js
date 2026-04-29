const express = require('express');
const router = express.Router();
const { saveToken, getStatus, disconnect, publishPost, syncEngagement } = require('../controllers/facebookController');
const authMiddleware = require('../middlewares/auth');

router.post('/save-token', authMiddleware, saveToken);
router.get('/status', authMiddleware, getStatus);
router.post('/disconnect', authMiddleware, disconnect);
router.post('/post', authMiddleware, publishPost);
router.get('/sync-engagement', authMiddleware, syncEngagement);

module.exports = router;
