
const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();

const startupController = require('../controllers/startupController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const uploadStartupLogo = require('../middleware/uploadStartupLogo');
const { optionalAuth } = require('../middleware/optionalAuth');

function validate(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array()
    });
  }

  next();
}

// Startup listing and statistics
router.get('/', optionalAuth, startupController.listStartups);
router.get('/stats/summary', startupController.getStats);

// Startup details
router.get('/:id', startupController.getStartup);

// Create, update and delete startup
router.post(
  '/',
  protect,
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Startup name is required')
  ],
  validate,
  startupController.createStartup
);

router.put('/:id', protect, startupController.updateStartup);
router.delete('/:id', protect, startupController.deleteStartup);

// Startup logo and status
router.patch(
  '/:id/logo',
  protect,
  uploadStartupLogo.single('logo'),
  startupController.uploadLogo
);

router.patch(
  '/:id/status',
  protect,
  authorize('platform_founder', 'admin'),
  startupController.updateStatus
);

// Assign startup members
router.post('/:id/founders', protect, startupController.assignFounder);
router.post('/:id/mentors', protect, startupController.assignMentor);
router.post('/:id/investors', protect, startupController.assignInvestor);

module.exports = router;
