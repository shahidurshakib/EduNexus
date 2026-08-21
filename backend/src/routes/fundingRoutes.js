const express = require('express');
const router = express.Router();

const fundingController = require('../controllers/fundingController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.get('/analytics', protect, authorize('platform_founder', 'admin'), fundingController.fundingAnalytics);
router.get('/', protect, fundingController.listFundingRounds);
router.get('/:id', protect, fundingController.getFundingRound);
router.post('/', protect, fundingController.createFundingRound);
router.put('/:id', protect, authorize('platform_founder', 'admin'), fundingController.updateFundingRound);
router.delete('/:id', protect, authorize('platform_founder', 'admin'), fundingController.deleteFundingRound);

module.exports = router;
