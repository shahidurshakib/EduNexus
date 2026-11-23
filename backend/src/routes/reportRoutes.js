const express = require('express');
const router = express.Router();

const reportController = require('../controllers/reportController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.get('/:type', protect, authorize('platform_founder', 'admin'), reportController.generateReport);
router.get('/:type/export', protect, authorize('platform_founder', 'admin'), reportController.exportReport);

module.exports = router;
