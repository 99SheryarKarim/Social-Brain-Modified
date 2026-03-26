const express = require('express');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();
const postController = require('../controllers/postController');


router.post('/upload', upload.array('media', 5), postController.uploadPost);
router.get('/uploaded-posts', postController.getMyPosts);

module.exports = router;
