// routes/scheduledPostRoutes.js
const express = require('express');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();
const scheduledPostController = require('../controllers/scheduledPostController')


router.post('/schedule', upload.array('media', 5), scheduledPostController.schedulePost);

router.get('/get-posts', scheduledPostController.getMyScheduledPosts);

module.exports = router;
