const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();

const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
  }
  next();
}

// ---------------- User management (Founder + Admin) ----------------
router.get('/users', protect, authorize('platform_founder', 'admin'), userController.getAllUsers);
router.get('/users/:id', protect, authorize('platform_founder', 'admin'), userController.getUserById);
router.patch('/users/:id/suspend', protect, authorize('platform_founder', 'admin'), userController.suspendUser);
router.patch('/users/:id/activate', protect, authorize('platform_founder', 'admin'), userController.activateUser);
router.delete('/users/:id', protect, authorize('platform_founder', 'admin'), userController.deleteUser);

// Founder-only
router.patch('/users/:id/remove-admin', protect, authorize('platform_founder'), userController.removeAdmin);

// ---------------- Role approval workflow ----------------
router.post(
  '/approvals/request',
  protect,
  [body('requestedRole').isIn(['admin', 'mentor', 'investor']).withMessage('requestedRole must be admin, mentor, or investor')],
  validate,
  userController.requestRole
);
router.get('/approvals', protect, authorize('platform_founder', 'admin'), userController.getApprovals);
router.patch('/approvals/:id/approve', protect, authorize('platform_founder', 'admin'), userController.approveRequest);
router.patch('/approvals/:id/reject', protect, authorize('platform_founder', 'admin'), userController.rejectRequest);

// ---------------- Public directories ----------------
router.get('/mentors', userController.getPublicMentors);
router.get('/mentors/:id', userController.getMentorProfile);
router.get('/investors', userController.getPublicInvestors);
router.get('/investors/:id', userController.getInvestorProfile);

// ---------------- Self-service profile updates ----------------
router.patch('/mentors/me', protect, userController.updateMyMentorProfile);
router.patch('/investors/me', protect, userController.updateMyInvestorProfile);

module.exports = router;
