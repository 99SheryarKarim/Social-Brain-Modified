const express = require('express');
const router = express.Router();
const { getPlan, upgradePlan, downgradePlan } = require('../controllers/subscriptionController');
const authMiddleware = require('../middlewares/auth');

router.get('/plan', authMiddleware, getPlan);
router.post('/upgrade', authMiddleware, upgradePlan);
router.post('/downgrade', authMiddleware, downgradePlan);

module.exports = router;
