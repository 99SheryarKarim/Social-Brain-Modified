const express = require('express');
const authMiddleware = require('../middlewares/auth');
const controller = require('../controllers/trendController');

const router = express.Router();
router.get('/', authMiddleware, controller.getTrends);
router.get('/recommended-time', authMiddleware, controller.getRecommendedTime);
module.exports = router;