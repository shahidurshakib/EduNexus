const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

async function protect(req, res, next) {
  try {
    let token;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authenticated. No token provided.' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (err) {
      const message = err.name === 'TokenExpiredError' ? 'Access token expired' : 'Invalid access token';
      return res.status(401).json({ success: false, message });
    }

    const [rows] = await pool.query(
      `SELECT id, full_name, email, role, is_email_verified, is_active, token_version, profile_image
       FROM users WHERE id = ? LIMIT 1`,
      [decoded.id]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'User no longer exists' });
    }

    const user = rows[0];

    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'This account has been blocked' });
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { protect };
