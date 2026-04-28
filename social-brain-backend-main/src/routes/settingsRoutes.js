const express = require('express');
const router = express.Router();
const { getSettings, saveSettings } = require('../controllers/settingsController');
const authMiddleware = require('../middlewares/auth');

router.get('/', authMiddleware, getSettings);
router.post('/', authMiddleware, saveSettings);

module.exports = router;
