const express = require('express');
const router = express.Router();
const { saveActivity, getActivity } = require('../controllers/activityController');
const authMiddleware = require('../middlewares/auth');

router.post('/', authMiddleware, saveActivity);
router.get('/', authMiddleware, getActivity);

module.exports = router;
