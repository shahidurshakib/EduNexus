const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
<<<<<<< HEAD
const crypto = require('crypto');
=======
>>>>>>> d1cca0860ac39149356ef502b0bd42f16f6d9092
const { pool } = require('../config/db');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateTokens');
const { generateOtp, getOtpExpiry } = require('../utils/otp');
const { sendOtpEmail } = require('../utils/sendEmail');

<<<<<<< HEAD
// google-auth-library is an optional dependency: if `npm install` hasn't
// been re-run since it was added to package.json, requiring it directly
// here would throw and crash THIS ENTIRE FILE at load time — which would
// take down every auth route (register, login, everything), not just
// Google sign-in. Load it defensively so the rest of auth keeps working
// even when this one package isn't installed yet.
let OAuth2Client = null;
try {
  ({ OAuth2Client } = require('google-auth-library'));
} catch (e) {
  console.warn('[auth] google-auth-library is not installed — Google sign-in will be disabled until you run `npm install` in /backend.');
}
const googleClient = OAuth2Client ? new OAuth2Client(process.env.GOOGLE_CLIENT_ID) : null;

=======
>>>>>>> d1cca0860ac39149356ef502b0bd42f16f6d9092
const SELECTABLE_ROLES = ['member', 'mentor', 'investor'];

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// ----------------------------------------------------------------------------
// POST /api/auth/register
// ----------------------------------------------------------------------------
async function register(req, res, next) {
  const conn = await pool.getConnection();
  try {
    const { fullName, email, password, confirmPassword, phone, organization, role } = req.body;

    if (!fullName || !email || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'Full name, email, password and confirmPassword are required' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    }

    const requestedRole = SELECTABLE_ROLES.includes(role) ? role : 'member';
    // Members always register at signup; mentor/investor selection just
    // records their intent — actual mentor/investor status is granted only
    // after admin approval (see role_approvals).
    const signupRole = 'member';

    const [existing] = await conn.query('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const profileImage = req.file ? `/uploads/profile/${req.file.filename}` : null;

    await conn.beginTransaction();

    const [result] = await conn.query(
      `INSERT INTO users (full_name, email, password_hash, phone, organization, profile_image, role, is_email_verified)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
      [fullName, email, passwordHash, phone || null, organization || null, profileImage, signupRole]
    );
    const userId = result.insertId;

    // If they asked to be mentor/investor, log the intent as a pending request now
    // (it becomes actionable for admins once the email is verified).
    if (requestedRole !== 'member') {
      await conn.query(
        `INSERT INTO role_approvals (user_id, requested_role, status) VALUES (?, ?, 'pending')`,
        [userId, requestedRole]
      );
    }

    const otp = generateOtp();
    const expiresAt = getOtpExpiry();
    await conn.query(
      `INSERT INTO otps (user_id, otp_code, purpose, expires_at) VALUES (?, ?, 'registration', ?)`,
      [userId, otp, expiresAt]
    );

    await conn.commit();

    try {
      await sendOtpEmail(email, fullName, otp, 'registration');
    } catch (mailErr) {
      console.error('Failed to send OTP email:', mailErr.message);
      // Don't fail registration just because email delivery had an issue —
      // the user can hit /resend-otp.
    }

    return res.status(201).json({
      success: true,
      message: 'Registration successful. An OTP has been sent to your email for verification.',
      data: { userId, email, requestedRole },
    });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
}

// ----------------------------------------------------------------------------
// POST /api/auth/verify-otp
// ----------------------------------------------------------------------------
async function verifyOtp(req, res, next) {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }

    const [users] = await pool.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'No account found for this email' });
    }
    const user = users[0];

    if (user.is_email_verified) {
      return res.status(400).json({ success: false, message: 'Email is already verified' });
    }

    const [otps] = await pool.query(
      `SELECT * FROM otps WHERE user_id = ? AND purpose = 'registration' AND is_used = 0
       ORDER BY id DESC LIMIT 1`,
      [user.id]
    );

    if (otps.length === 0) {
      return res.status(400).json({ success: false, message: 'No pending OTP found. Please request a new one.' });
    }
    const record = otps[0];

    if (new Date(record.expires_at) < new Date()) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }
    if (record.otp_code !== String(otp)) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    await pool.query('UPDATE otps SET is_used = 1 WHERE id = ?', [record.id]);
    await pool.query('UPDATE users SET is_email_verified = 1 WHERE id = ?', [user.id]);

    await pool.query(
      `INSERT INTO notifications (user_id, title, message) VALUES (?, 'Welcome to EduNexus!', 'Your email has been verified. Your account is now active.')`,
      [user.id]
    );

    return res.json({ success: true, message: 'Email verified successfully. You can now log in.' });
  } catch (err) {
    next(err);
  }
}

// ----------------------------------------------------------------------------
// POST /api/auth/resend-otp
// ----------------------------------------------------------------------------
async function resendOtp(req, res, next) {
  try {
    const { email, purpose } = req.body;
    const otpPurpose = purpose === 'password_reset' ? 'password_reset' : 'registration';

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const [users] = await pool.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
    if (users.length === 0) {
      // Avoid leaking whether an email exists for password_reset flow
      return res.json({ success: true, message: 'If this account exists, a new OTP has been sent.' });
    }
    const user = users[0];

    if (otpPurpose === 'registration' && user.is_email_verified) {
      return res.status(400).json({ success: false, message: 'Email is already verified' });
    }

    const otp = generateOtp();
    const expiresAt = getOtpExpiry();
    await pool.query(
      `INSERT INTO otps (user_id, otp_code, purpose, expires_at) VALUES (?, ?, ?, ?)`,
      [user.id, otp, otpPurpose, expiresAt]
    );

    try {
      await sendOtpEmail(email, user.full_name, otp, otpPurpose);
    } catch (mailErr) {
      console.error('Failed to send OTP email:', mailErr.message);
      return res.status(502).json({
        success: false,
        message: 'Could not send the email right now. Please try again in a moment, or contact the site admin if this keeps happening.',
      });
    }

    return res.json({ success: true, message: 'A new OTP has been sent to your email.' });
  } catch (err) {
    next(err);
  }
}

// ----------------------------------------------------------------------------
// POST /api/auth/login
// ----------------------------------------------------------------------------
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const [users] = await pool.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    const user = users[0];

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.is_email_verified) {
      return res.status(403).json({ success: false, message: 'Please verify your email with the OTP sent to you before logging in.' });
    }
    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'This account has been blocked. Contact support.' });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie('refreshToken', refreshToken, cookieOptions);

    // Login log (reuses activity_logs; entity_type 'login' distinguishes it for reporting)
    pool
      .query(`INSERT INTO activity_logs (user_id, action, entity_type, entity_id) VALUES (?, 'Logged in', 'login', ?)`, [user.id, user.id])
      .catch((e) => console.error('Failed to write login log:', e.message));

    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        accessToken,
        user: {
          id: user.id,
          fullName: user.full_name,
          email: user.email,
          role: user.role,
          profileImage: user.profile_image,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

// ----------------------------------------------------------------------------
<<<<<<< HEAD
// POST /api/auth/google  { idToken }
// Sign in (or silently register) with a Google account. Google has already
// verified the email, so these accounts skip the OTP step entirely.
// ----------------------------------------------------------------------------
async function googleLogin(req, res, next) {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ success: false, message: 'idToken is required' });
    if (!googleClient || !process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({ success: false, message: 'Google sign-in is not configured on this server' });
    }

    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID });
      payload = ticket.getPayload();
    } catch (e) {
      return res.status(401).json({ success: false, message: 'Invalid Google credential' });
    }
    if (!payload?.email) {
      return res.status(401).json({ success: false, message: 'Google account has no verified email' });
    }

    const [existing] = await pool.query('SELECT * FROM users WHERE email = ? LIMIT 1', [payload.email]);
    let user;

    if (existing.length > 0) {
      user = existing[0];
      if (!user.is_active) {
        return res.status(403).json({ success: false, message: 'This account has been blocked. Contact support.' });
      }
      // A Google sign-in confirms the email; lift any pending OTP gate.
      if (!user.is_email_verified) {
        await pool.query('UPDATE users SET is_email_verified = 1 WHERE id = ?', [user.id]);
        user.is_email_verified = 1;
      }
    } else {
      const randomPassword = crypto.randomBytes(32).toString('hex');
      const passwordHash = await bcrypt.hash(randomPassword, 10);
      const [result] = await pool.query(
        `INSERT INTO users (full_name, email, password_hash, profile_image, role, is_email_verified)
         VALUES (?, ?, ?, ?, 'member', 1)`,
        [payload.name || payload.email.split('@')[0], payload.email, passwordHash, payload.picture || null]
      );
      const [rows] = await pool.query('SELECT * FROM users WHERE id = ? LIMIT 1', [result.insertId]);
      user = rows[0];
    }

    const accessToken = generateAccessToken(user);
    const refreshTokenValue = generateRefreshToken(user);
    res.cookie('refreshToken', refreshTokenValue, cookieOptions);

    pool
      .query(`INSERT INTO activity_logs (user_id, action, entity_type, entity_id) VALUES (?, 'Logged in with Google', 'login', ?)`, [user.id, user.id])
      .catch((e) => console.error('Failed to write login log:', e.message));

    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        accessToken,
        user: {
          id: user.id,
          fullName: user.full_name,
          email: user.email,
          role: user.role,
          profileImage: user.profile_image,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

// ----------------------------------------------------------------------------
=======
>>>>>>> d1cca0860ac39149356ef502b0bd42f16f6d9092
// POST /api/auth/refresh-token
// ----------------------------------------------------------------------------
async function refreshToken(req, res, next) {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({ success: false, message: 'No refresh token provided' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    }

    const [users] = await pool.query('SELECT * FROM users WHERE id = ? LIMIT 1', [decoded.id]);
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'User no longer exists' });
    }
    const user = users[0];

    if (user.token_version !== decoded.tokenVersion) {
      return res.status(401).json({ success: false, message: 'Refresh token has been revoked' });
    }
    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'This account has been blocked' });
    }

    const accessToken = generateAccessToken(user);
    return res.json({ success: true, data: { accessToken } });
  } catch (err) {
    next(err);
  }
}

// ----------------------------------------------------------------------------
// POST /api/auth/logout
// ----------------------------------------------------------------------------
async function logout(req, res, next) {
  try {
    // Bump token_version if we know who this is, so old refresh tokens die immediately
    const token = req.cookies?.refreshToken;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        await pool.query('UPDATE users SET token_version = token_version + 1 WHERE id = ?', [decoded.id]);
      } catch (_) {
        /* token already invalid, nothing to bump */
      }
    }
    res.clearCookie('refreshToken', { ...cookieOptions, maxAge: undefined });
    return res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
}

// ----------------------------------------------------------------------------
// GET /api/auth/me
// ----------------------------------------------------------------------------
async function me(req, res) {
  return res.json({ success: true, data: { user: req.user } });
}

// ----------------------------------------------------------------------------
// POST /api/auth/forgot-password
// ----------------------------------------------------------------------------
async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    const [users] = await pool.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
    if (users.length === 0) {
      return res.json({ success: true, message: 'If this account exists, a reset code has been sent.' });
    }
    const user = users[0];

    const otp = generateOtp();
    const expiresAt = getOtpExpiry();
    await pool.query(
      `INSERT INTO otps (user_id, otp_code, purpose, expires_at) VALUES (?, ?, 'password_reset', ?)`,
      [user.id, otp, expiresAt]
    );
    try {
      await sendOtpEmail(email, user.full_name, otp, 'password_reset');
    } catch (mailErr) {
      console.error('Failed to send OTP email:', mailErr.message);
      return res.status(502).json({
        success: false,
        message: 'Could not send the email right now. Please try again in a moment, or contact the site admin if this keeps happening.',
      });
    }

    return res.json({ success: true, message: 'If this account exists, a reset code has been sent.' });
  } catch (err) {
    next(err);
  }
}

// ----------------------------------------------------------------------------
// POST /api/auth/reset-password
// ----------------------------------------------------------------------------
async function resetPassword(req, res, next) {
  try {
    const { email, otp, newPassword, confirmNewPassword } = req.body;
    if (!email || !otp || !newPassword || !confirmNewPassword) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    }

    const [users] = await pool.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
    if (users.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid email or OTP' });
    }
    const user = users[0];

    const [otps] = await pool.query(
      `SELECT * FROM otps WHERE user_id = ? AND purpose = 'password_reset' AND is_used = 0
       ORDER BY id DESC LIMIT 1`,
      [user.id]
    );
    if (otps.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid email or OTP' });
    }
    const record = otps[0];

    if (new Date(record.expires_at) < new Date() || record.otp_code !== String(otp)) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE otps SET is_used = 1 WHERE id = ?', [record.id]);
    // Bump token_version too, so any existing refresh tokens are invalidated on password change
    await pool.query(
      'UPDATE users SET password_hash = ?, token_version = token_version + 1 WHERE id = ?',
      [passwordHash, user.id]
    );

    return res.json({ success: true, message: 'Password reset successful. Please log in with your new password.' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  verifyOtp,
  resendOtp,
  login,
<<<<<<< HEAD
  googleLogin,
=======
>>>>>>> d1cca0860ac39149356ef502b0bd42f16f6d9092
  refreshToken,
  logout,
  me,
  forgotPassword,
  resetPassword,
};