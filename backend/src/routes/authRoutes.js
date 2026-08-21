const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();

const authController = require('../controllers/authController');
const upload = require('../middleware/upload');
const { protect } = require('../middleware/auth');
const { authLimiter, otpLimiter } = require('../middleware/rateLimiter');

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
  }
  next();
}

router.post(
  '/register',
  authLimiter,
  upload.single('profileImage'),
  [
    body('fullName').trim().notEmpty().withMessage('Full name is required'),
    body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('role').optional().isIn(['member', 'mentor', 'investor']).withMessage('Invalid role selected'),
  ],
  validate,
  authController.register
);

router.post(
  '/verify-otp',
  otpLimiter,
  [
    body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
    body('otp').isLength({ min: 4, max: 6 }).withMessage('Invalid OTP'),
  ],
  validate,
  authController.verifyOtp
);

router.post(
  '/resend-otp',
  otpLimiter,
  [body('email').isEmail().withMessage('A valid email is required').normalizeEmail()],
  validate,
  authController.resendOtp
);

router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  authController.login
);

router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);
router.get('/me', protect, authController.me);

router.post(
  '/forgot-password',
  otpLimiter,
  [body('email').isEmail().withMessage('A valid email is required').normalizeEmail()],
  validate,
  authController.forgotPassword
);

router.post(
  '/reset-password',
  otpLimiter,
  [
    body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
    body('otp').isLength({ min: 4, max: 6 }).withMessage('Invalid OTP'),
    body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  validate,
  authController.resetPassword
);

module.exports = router;
