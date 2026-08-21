const express = require('express');
const router = express.Router();

const notificationController = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.get('/', protect, notificationController.getMyNotifications);
router.patch('/read-all', protect, notificationController.markAllRead);
router.patch('/:id/read', protect, notificationController.markRead);
router.delete('/:id', protect, notificationController.deleteNotification);

router.post('/', protect, authorize('platform_founder', 'admin'), notificationController.createNotification);
router.post('/broadcast', protect, authorize('platform_founder', 'admin'), notificationController.broadcastNotification);

module.exports = router;
