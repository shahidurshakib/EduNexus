/**
 * Shared helpers for pagination and notification fan-out.
 * Kept separate from existing utils/* so nothing already-working is touched.
 */

function getPagination(req, defaultLimit = 20, maxLimit = 100) {
  let page = parseInt(req.query.page, 10);
  let limit = parseInt(req.query.limit, 10);
  if (!Number.isFinite(page) || page < 1) page = 1;
  if (!Number.isFinite(limit) || limit < 1) limit = defaultLimit;
  if (limit > maxLimit) limit = maxLimit;
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

async function notifyUser(pool, userId, title, message) {
  await pool.query(
    `INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)`,
    [userId, title, message]
  );
}

async function notifyRole(pool, role, title, message) {
  const [users] = await pool.query(`SELECT id FROM users WHERE role = ? AND is_active = 1`, [role]);
  if (users.length === 0) return;
  const values = users.map((u) => [u.id, title, message]);
  await pool.query(`INSERT INTO notifications (user_id, title, message) VALUES ?`, [values]);
}

async function logActivity(pool, userId, action, entityType = null, entityId = null) {
  await pool.query(
    `INSERT INTO activity_logs (user_id, action, entity_type, entity_id) VALUES (?, ?, ?, ?)`,
    [userId, action, entityType, entityId]
  );
}

module.exports = { getPagination, notifyUser, notifyRole, logActivity };
