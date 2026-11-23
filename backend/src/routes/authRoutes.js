
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
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array(),
    });
  }

  next();
}

// Register
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

// Google Login
router.post(
  '/google',
  authLimiter,
  [body('idToken').notEmpty().withMessage('idToken is required')],
  validate,
  authController.googleLogin
);

// Verify OTP
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

// Resend OTP
router.post(
  '/resend-otp',
  otpLimiter,
  [body('email').isEmail().withMessage('A valid email is required').normalizeEmail()],
  validate,
  authController.resendOtp
);

// Login
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

// Refresh Token
router.post('/refresh-token', authController.refreshToken);

// Logout
router.post('/logout', authController.logout);

// Current User
router.get('/me', protect, authController.me);

// Forgot Password
router.post(
  '/forgot-password',
  otpLimiter,
  [body('email').isEmail().withMessage('A valid email is required').normalizeEmail()],
  validate,
  authController.forgotPassword
);

// Reset Password
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
