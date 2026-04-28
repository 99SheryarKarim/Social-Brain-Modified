const express = require('express');
const router = express.Router();
const { saveToken, getStatus, disconnect, publishPost } = require('../controllers/facebookController');
const authMiddleware = require('../middlewares/auth');
const upload = require('../middlewares/multer');

router.post('/save-token', authMiddleware, saveToken);
router.get('/status', authMiddleware, getStatus);
router.post('/disconnect', authMiddleware, disconnect);
router.post('/post', authMiddleware, publishPost);

module.exports = router;
