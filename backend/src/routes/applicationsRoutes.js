const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();

const applicationsController = require('../controllers/applicationsController');
const { protect } = require('../middleware/auth');
const uploadProposal = require('../middleware/uploadProposal');

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
  }
  next();
}

router.post(
  '/',
  protect,
  uploadProposal.single('proposal'),
  [
    body('targetType').isIn(['startup', 'mentor', 'investor']).withMessage('targetType must be startup, mentor, or investor'),
    body('targetId').notEmpty().withMessage('targetId is required'),
  ],
  validate,
  applicationsController.createApplication
);

router.get('/mine', protect, applicationsController.listMine);
router.get('/incoming', protect, applicationsController.listIncoming);
router.get('/:id/proposal', protect, applicationsController.downloadProposal);
router.patch('/:id/status', protect, applicationsController.reviewApplication);
router.patch('/:id/resubmit', protect, uploadProposal.single('proposal'), applicationsController.resubmitApplication);

module.exports = router;
