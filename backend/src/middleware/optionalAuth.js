const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return next();

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (_) {
      return next(); // invalid/expired token — proceed as anonymous, don't error
    }

    const [rows] = await pool.query(
      `SELECT id, full_name, email, role, is_active FROM users WHERE id = ? LIMIT 1`,
      [decoded.id]
    );
    if (rows.length > 0 && rows[0].is_active) {
      req.user = rows[0];
    }
    next();
  } catch (err) {
    next(); // never fail the request just because optional auth had an issue
  }
}

module.exports = { optionalAuth };
