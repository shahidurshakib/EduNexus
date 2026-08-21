const { pool } = require('../config/db');
const { getPagination, notifyUser, notifyRole, logActivity } = require('../utils/query');

// GET /api/notifications  (protect — own notifications)
async function getMyNotifications(req, res, next) {
  try {
    const { unreadOnly } = req.query;
    const { page, limit, offset } = getPagination(req);
    const where = ['user_id = ?'];
    const params = [req.user.id];
    if (unreadOnly === 'true') where.push('is_read = 0');

    const [rows] = await pool.query(
      `SELECT id, title, message, is_read, created_at FROM notifications
       WHERE ${where.join(' AND ')} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM notifications WHERE ${where.join(' AND ')}`,
      params
    );
    const [[{ unread }]] = await pool.query(
      `SELECT COUNT(*) AS unread FROM notifications WHERE user_id = ? AND is_read = 0`,
      [req.user.id]
    );

    return res.json({ success: true, data: { notifications: rows, page, limit, total, unread } });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/notifications/:id/read  (owner only)
async function markRead(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT id FROM notifications WHERE id = ? AND user_id = ? LIMIT 1', [req.params.id, req.user.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Notification not found' });

    await pool.query('UPDATE notifications SET is_read = 1 WHERE id = ?', [req.params.id]);
    return res.json({ success: true, message: 'Notification marked as read' });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/notifications/read-all  (owner only)
async function markAllRead(req, res, next) {
  try {
    await pool.query('UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0', [req.user.id]);
    return res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/notifications/:id  (owner, or admin/founder for any)
async function deleteNotification(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT id, user_id FROM notifications WHERE id = ? LIMIT 1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Notification not found' });

    const isOwner = rows[0].user_id === req.user.id;
    const isManager = ['platform_founder', 'admin'].includes(req.user.role);
    if (!isOwner && !isManager) {
      return res.status(403).json({ success: false, message: 'You cannot delete this notification' });
    }

    await pool.query('DELETE FROM notifications WHERE id = ?', [req.params.id]);
    return res.json({ success: true, message: 'Notification deleted' });
  } catch (err) {
    next(err);
  }
}

// POST /api/notifications  { userId, title, message }  (admin, founder — targeted notification)
async function createNotification(req, res, next) {
  try {
    const { userId, title, message } = req.body;
    if (!userId || !title) return res.status(400).json({ success: false, message: 'userId and title are required' });

    const [user] = await pool.query('SELECT id FROM users WHERE id = ? LIMIT 1', [userId]);
    if (user.length === 0) return res.status(404).json({ success: false, message: 'User not found' });

    await notifyUser(pool, userId, title, message || null);
    await logActivity(pool, req.user.id, `Sent notification to user #${userId}`, 'notification', userId);

    return res.status(201).json({ success: true, message: 'Notification sent' });
  } catch (err) {
    next(err);
  }
}

// POST /api/notifications/broadcast  { role: 'all'|'admin'|'mentor'|'investor'|'member', title, message }
async function broadcastNotification(req, res, next) {
  try {
    const { role, title, message } = req.body;
    const validRoles = ['all', 'admin', 'mentor', 'investor', 'member'];
    if (!validRoles.includes(role) || !title) {
      return res.status(400).json({ success: false, message: `role must be one of ${validRoles.join(', ')}, and title is required` });
    }

    if (role === 'all') {
      const roles = ['admin', 'mentor', 'investor', 'member'];
      for (const r of roles) {
        await notifyRole(pool, r, title, message || null);
      }
    } else {
      await notifyRole(pool, role, title, message || null);
    }

    await logActivity(pool, req.user.id, `Broadcast notification to ${role}`, 'notification', null);
    return res.status(201).json({ success: true, message: 'Broadcast sent' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getMyNotifications,
  markRead,
  markAllRead,
  deleteNotification,
  createNotification,
  broadcastNotification,
};
