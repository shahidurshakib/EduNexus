const express = require('express');
const router = express.Router();

const logController = require('../controllers/logController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.get('/activity', protect, authorize('platform_founder', 'admin'), logController.getActivityLogs);
router.get('/login', protect, authorize('platform_founder', 'admin'), logController.getLoginLogs);

module.exports = router;
