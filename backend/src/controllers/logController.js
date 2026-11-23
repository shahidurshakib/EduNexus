const { pool } = require('../config/db');
const { getPagination } = require('../utils/query');

// GET /api/logs/activity  (founder, admin) — all logs except logins
// query: entityType, userId, from, to, page, limit
async function getActivityLogs(req, res, next) {
  try {
    const { entityType, userId, from, to } = req.query;
    const { page, limit, offset } = getPagination(req, 30, 200);

    const where = [`al.entity_type <> 'login'`];
    const params = [];
    if (entityType) { where.push('al.entity_type = ?'); params.push(entityType); }
    if (userId) { where.push('al.user_id = ?'); params.push(userId); }
    if (from) { where.push('al.created_at >= ?'); params.push(from); }
    if (to) { where.push('al.created_at <= ?'); params.push(to); }

    const [rows] = await pool.query(
      `SELECT al.id, al.action, al.entity_type, al.entity_id, al.created_at, u.full_name AS actor
       FROM activity_logs al LEFT JOIN users u ON u.id = al.user_id
       WHERE ${where.join(' AND ')} ORDER BY al.created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM activity_logs al WHERE ${where.join(' AND ')}`, params);

    return res.json({ success: true, data: { logs: rows, page, limit, total } });
  } catch (err) {
    next(err);
  }
}

// GET /api/logs/login  (founder, admin)
// query: userId, from, to, page, limit
async function getLoginLogs(req, res, next) {
  try {
    const { userId, from, to } = req.query;
    const { page, limit, offset } = getPagination(req, 30, 200);

    const where = [`al.entity_type = 'login'`];
    const params = [];
    if (userId) { where.push('al.user_id = ?'); params.push(userId); }
    if (from) { where.push('al.created_at >= ?'); params.push(from); }
    if (to) { where.push('al.created_at <= ?'); params.push(to); }

    const [rows] = await pool.query(
      `SELECT al.id, al.created_at, u.id AS user_id, u.full_name, u.email, u.role
       FROM activity_logs al JOIN users u ON u.id = al.user_id
       WHERE ${where.join(' AND ')} ORDER BY al.created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM activity_logs al WHERE ${where.join(' AND ')}`, params);

    return res.json({ success: true, data: { logs: rows, page, limit, total } });
  } catch (err) {
    next(err);
  }
}

module.exports = { getActivityLogs, getLoginLogs };
