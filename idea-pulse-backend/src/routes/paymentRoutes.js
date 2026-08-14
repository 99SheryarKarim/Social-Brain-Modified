const express = require('express');
const router = express.Router();
const { createCheckoutSession, handleWebhook, getPublishableKey } = require('../controllers/paymentController');
const authMiddleware = require('../middlewares/auth');

router.get('/config', getPublishableKey);
router.post('/create-checkout', authMiddleware, createCheckoutSession);
// Webhook needs raw body — registered separately in app.js
module.exports = router;
