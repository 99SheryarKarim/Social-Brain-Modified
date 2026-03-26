// routes/facebookRoutes.js
const express = require('express');
const router = express.Router();
const facebookController = require('../controllers/facebookController');
const upload = require('../middlewares/multer');

router.post('/upload', upload.array('files', 10), facebookController.uploadToFacebook);

module.exports = router;
