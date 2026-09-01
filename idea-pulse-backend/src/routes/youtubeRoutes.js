const express = require('express');
const multer = require('multer');
const fs = require('fs');
const authMiddleware = require('../middlewares/auth');
const controller = require('../controllers/youtubeController');

const router = express.Router();
fs.mkdirSync('uploads/youtube', { recursive: true });
const upload = multer({ dest: 'uploads/youtube/' });

router.get('/connect', authMiddleware, controller.getAuthorizationUrl);
router.get('/callback', controller.handleCallback);
router.get('/status', authMiddleware, controller.getStatus);
router.post('/disconnect', authMiddleware, controller.disconnect);
router.post('/videos', authMiddleware, upload.single('video'), controller.upload);
router.get('/stats', authMiddleware, controller.stats);

module.exports = router;
