const { pool } = require('../config/db');
const { getPagination, notifyUser, logActivity } = require('../utils/query');

// ============================================================================
// USER MANAGEMENT (Founder + Admin)
// ============================================================================

// GET /api/users  (founder, admin)
// query: role, status(active|blocked), search, page, limit
async function getAllUsers(req, res, next) {
  try {
    const { role, status, search } = req.query;
    const { page, limit, offset } = getPagination(req);

    const where = [];
    const params = [];

    if (role) {
      where.push('role = ?');
      params.push(role);
    }
    if (status === 'active') where.push('is_active = 1');
    if (status === 'blocked') where.push('is_active = 0');
    if (search) {
      where.push('(full_name LIKE ? OR email LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [rows] = await pool.query(
      `SELECT id, full_name, email, phone, organization, profile_image, role,
              is_email_verified, is_active, created_at
       FROM users ${whereSql}
       ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM users ${whereSql}`, params);

    return res.json({ success: true, data: { users: rows, page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    next(err);
  }
}

// GET /api/users/:id  (founder, admin)
async function getUserById(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT id, full_name, email, phone, organization, profile_image, role,
              is_email_verified, is_active, created_at
       FROM users WHERE id = ? LIMIT 1`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'User not found' });
    return res.json({ success: true, data: { user: rows[0] } });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/users/:id/suspend  (founder, admin — "Block Users")
async function suspendUser(req, res, next) {
  try {
    const targetId = Number(req.params.id);
    if (targetId === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot suspend your own account' });
    }
    const [rows] = await pool.query('SELECT id, role, is_active FROM users WHERE id = ? LIMIT 1', [targetId]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'User not found' });
    if (rows[0].role === 'platform_founder') {
      return res.status(403).json({ success: false, message: 'The platform founder account cannot be suspended' });
    }

    await pool.query('UPDATE users SET is_active = 0, token_version = token_version + 1 WHERE id = ?', [targetId]);
    await notifyUser(pool, targetId, 'Account Suspended', 'Your account has been suspended by an administrator.');
    await logActivity(pool, req.user.id, `Suspended user #${targetId}`, 'user', targetId);

    return res.json({ success: true, message: 'User suspended successfully' });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/users/:id/activate  (founder, admin)
async function activateUser(req, res, next) {
  try {
    const targetId = Number(req.params.id);
    const [rows] = await pool.query('SELECT id FROM users WHERE id = ? LIMIT 1', [targetId]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'User not found' });

    await pool.query('UPDATE users SET is_active = 1 WHERE id = ?', [targetId]);
    await notifyUser(pool, targetId, 'Account Reactivated', 'Your account has been reactivated. You can now log in.');
    await logActivity(pool, req.user.id, `Activated user #${targetId}`, 'user', targetId);

    return res.json({ success: true, message: 'User activated successfully' });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/users/:id  (admin, founder — "Delete Users")
async function deleteUser(req, res, next) {
  try {
    const targetId = Number(req.params.id);
    if (targetId === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account' });
    }
    const [rows] = await pool.query('SELECT id, role FROM users WHERE id = ? LIMIT 1', [targetId]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'User not found' });
    if (rows[0].role === 'platform_founder') {
      return res.status(403).json({ success: false, message: 'The platform founder account cannot be deleted' });
    }

    try {
      await pool.query('DELETE FROM users WHERE id = ?', [targetId]);
    } catch (err) {
      if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.code === 'ER_ROW_IS_REFERENCED') {
        return res.status(409).json({
          success: false,
          message: 'This user owns records (e.g. a startup or research entry) and cannot be deleted. Suspend the account instead.',
        });
      }
      throw err;
    }

    await logActivity(pool, req.user.id, `Deleted user #${targetId}`, 'user', targetId);
    return res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/users/:id/remove-admin  (founder only — "Remove Admin")
async function removeAdmin(req, res, next) {
  try {
    const targetId = Number(req.params.id);
    const [rows] = await pool.query('SELECT id, role FROM users WHERE id = ? LIMIT 1', [targetId]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'User not found' });
    if (rows[0].role !== 'admin') {
      return res.status(400).json({ success: false, message: 'This user is not currently an admin' });
    }

    await pool.query('UPDATE users SET role = ?, token_version = token_version + 1 WHERE id = ?', ['member', targetId]);
    await notifyUser(pool, targetId, 'Admin Access Removed', 'Your admin privileges have been revoked by the platform founder.');
    await logActivity(pool, req.user.id, `Removed admin role from user #${targetId}`, 'user', targetId);

    return res.json({ success: true, message: 'Admin access removed successfully' });
  } catch (err) {
    next(err);
  }
}

<<<<<<< HEAD
// PATCH /api/users/:id/make-admin  (platform_founder only) — directly
// promotes any existing user to admin, no self-request needed.
async function makeAdmin(req, res, next) {
  try {
    const targetId = Number(req.params.id);
    const [rows] = await pool.query('SELECT id, role FROM users WHERE id = ? LIMIT 1', [targetId]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'User not found' });
    if (rows[0].role === 'platform_founder') {
      return res.status(400).json({ success: false, message: 'This user already holds the founder role' });
    }
    if (rows[0].role === 'admin') {
      return res.status(400).json({ success: false, message: 'This user is already an admin' });
    }

    await pool.query('UPDATE users SET role = ?, token_version = token_version + 1 WHERE id = ?', ['admin', targetId]);
    await notifyUser(pool, targetId, 'You are now an Admin', 'The platform founder added you as an admin.');
    await logActivity(pool, req.user.id, `Added user #${targetId} as admin`, 'user', targetId);

    return res.json({ success: true, message: 'User promoted to admin' });
  } catch (err) {
    next(err);
  }
}

=======
>>>>>>> d1cca0860ac39149356ef502b0bd42f16f6d9092
// ============================================================================
// ROLE APPROVAL WORKFLOW (admin / mentor / investor requests)
// ============================================================================

// POST /api/approvals/request  (any authenticated member — request to become admin/mentor/investor)
async function requestRole(req, res, next) {
  try {
    const { requestedRole } = req.body;
    if (!['admin', 'mentor', 'investor'].includes(requestedRole)) {
      return res.status(400).json({ success: false, message: 'requestedRole must be one of admin, mentor, investor' });
    }
    if (req.user.role === requestedRole || req.user.role === 'platform_founder') {
      return res.status(400).json({ success: false, message: 'You already hold this role or a higher one' });
    }

    const [pending] = await pool.query(
      `SELECT id FROM role_approvals WHERE user_id = ? AND requested_role = ? AND status = 'pending' LIMIT 1`,
      [req.user.id, requestedRole]
    );
    if (pending.length > 0) {
      return res.status(409).json({ success: false, message: 'You already have a pending request for this role' });
    }

    const [result] = await pool.query(
      `INSERT INTO role_approvals (user_id, requested_role, status) VALUES (?, ?, 'pending')`,
      [req.user.id, requestedRole]
    );

    await logActivity(pool, req.user.id, `Requested role: ${requestedRole}`, 'role_approval', result.insertId);
    return res.status(201).json({ success: true, message: 'Request submitted and is pending approval', data: { id: result.insertId } });
  } catch (err) {
    next(err);
  }
}

// GET /api/approvals  (founder, admin)  query: status(pending|approved|rejected), role
async function getApprovals(req, res, next) {
  try {
    const { status = 'pending', role } = req.query;
    const { page, limit, offset } = getPagination(req);

    const where = ['ra.status = ?'];
    const params = [status];

    // Admins may only manage mentor/investor requests, not admin requests
    if (req.user.role === 'admin') {
      where.push(`ra.requested_role IN ('mentor','investor')`);
    }
    if (role) {
      where.push('ra.requested_role = ?');
      params.push(role);
    }

    const [rows] = await pool.query(
      `SELECT ra.id, ra.requested_role, ra.status, ra.review_note, ra.created_at,
              u.id AS user_id, u.full_name, u.email, u.organization
       FROM role_approvals ra
       JOIN users u ON u.id = ra.user_id
       WHERE ${where.join(' AND ')}
       ORDER BY ra.created_at ASC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM role_approvals ra WHERE ${where.join(' AND ')}`,
      params
    );

    return res.json({ success: true, data: { approvals: rows, page, limit, total } });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/approvals/:id/approve  (founder for admin requests; founder+admin for mentor/investor)
async function approveRequest(req, res, next) {
  const conn = await pool.getConnection();
  try {
    const { id } = req.params;
    const { reviewNote } = req.body;

    const [rows] = await conn.query(`SELECT * FROM role_approvals WHERE id = ? LIMIT 1`, [id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Request not found' });
    const request = rows[0];

    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: `This request has already been ${request.status}` });
    }
    if (request.requested_role === 'admin' && req.user.role !== 'platform_founder') {
      return res.status(403).json({ success: false, message: 'Only the platform founder can approve admin requests' });
    }

    await conn.beginTransaction();

    await conn.query(
      `UPDATE role_approvals SET status = 'approved', reviewed_by = ?, review_note = ? WHERE id = ?`,
      [req.user.id, reviewNote || null, id]
    );
    await conn.query('UPDATE users SET role = ? WHERE id = ?', [request.requested_role, request.user_id]);

    if (request.requested_role === 'mentor') {
      await conn.query(
        `INSERT INTO mentors (user_id, is_public) VALUES (?, 1)
         ON DUPLICATE KEY UPDATE is_public = 1`,
        [request.user_id]
      );
    } else if (request.requested_role === 'investor') {
      await conn.query(
        `INSERT INTO investors (user_id, is_public) VALUES (?, 1)
         ON DUPLICATE KEY UPDATE is_public = 1`,
        [request.user_id]
      );
    }

    await conn.commit();

    await notifyUser(pool, request.user_id, 'Request Approved', `Your request to become ${request.requested_role} has been approved.`);
    await logActivity(pool, req.user.id, `Approved ${request.requested_role} request for user #${request.user_id}`, 'role_approval', request.id);

    return res.json({ success: true, message: 'Request approved successfully' });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
}

// PATCH /api/approvals/:id/reject  (founder for admin requests; founder+admin for mentor/investor)
async function rejectRequest(req, res, next) {
  try {
    const { id } = req.params;
    const { reviewNote } = req.body;

    const [rows] = await pool.query(`SELECT * FROM role_approvals WHERE id = ? LIMIT 1`, [id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Request not found' });
    const request = rows[0];

    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: `This request has already been ${request.status}` });
    }
    if (request.requested_role === 'admin' && req.user.role !== 'platform_founder') {
      return res.status(403).json({ success: false, message: 'Only the platform founder can reject admin requests' });
    }

    await pool.query(
      `UPDATE role_approvals SET status = 'rejected', reviewed_by = ?, review_note = ? WHERE id = ?`,
      [req.user.id, reviewNote || null, id]
    );

    await notifyUser(pool, request.user_id, 'Request Rejected', `Your request to become ${request.requested_role} was not approved.${reviewNote ? ` Note: ${reviewNote}` : ''}`);
    await logActivity(pool, req.user.id, `Rejected ${request.requested_role} request for user #${request.user_id}`, 'role_approval', request.id);

    return res.json({ success: true, message: 'Request rejected' });
  } catch (err) {
    next(err);
  }
}

// ============================================================================
// PUBLIC DIRECTORIES
// ============================================================================

// GET /api/mentors  (public)
async function getPublicMentors(req, res, next) {
  try {
    const { search } = req.query;
    const { page, limit, offset } = getPagination(req);
    const where = ['m.is_public = 1', 'u.is_active = 1'];
    const params = [];
    if (search) {
      where.push('(u.full_name LIKE ? OR m.expertise LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    const [rows] = await pool.query(
      `SELECT m.id, u.id AS user_id, u.full_name, u.organization, u.profile_image,
              m.expertise, m.bio, m.linkedin_url
       FROM mentors m JOIN users u ON u.id = m.user_id
       WHERE ${where.join(' AND ')} ORDER BY u.full_name ASC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM mentors m JOIN users u ON u.id = m.user_id WHERE ${where.join(' AND ')}`,
      params
    );
    return res.json({ success: true, data: { mentors: rows, page, limit, total } });
  } catch (err) {
    next(err);
  }
}

// GET /api/mentors/:id  (public)
async function getMentorProfile(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT m.id, u.id AS user_id, u.full_name, u.organization, u.profile_image,
              m.expertise, m.bio, m.linkedin_url, m.created_at
       FROM mentors m JOIN users u ON u.id = m.user_id
       WHERE m.id = ? AND m.is_public = 1 LIMIT 1`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Mentor not found' });
    return res.json({ success: true, data: { mentor: rows[0] } });
  } catch (err) {
    next(err);
  }
}

// GET /api/investors  (public)
async function getPublicInvestors(req, res, next) {
  try {
    const { search } = req.query;
    const { page, limit, offset } = getPagination(req);
    const where = ['i.is_public = 1', 'u.is_active = 1'];
    const params = [];
    if (search) {
      where.push('(u.full_name LIKE ? OR i.investment_focus LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    const [rows] = await pool.query(
      `SELECT i.id, u.id AS user_id, u.full_name, u.organization, u.profile_image,
              i.investment_focus, i.min_ticket_size, i.max_ticket_size, i.bio
       FROM investors i JOIN users u ON u.id = i.user_id
       WHERE ${where.join(' AND ')} ORDER BY u.full_name ASC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM investors i JOIN users u ON u.id = i.user_id WHERE ${where.join(' AND ')}`,
      params
    );
    return res.json({ success: true, data: { investors: rows, page, limit, total } });
  } catch (err) {
    next(err);
  }
}

// GET /api/investors/:id  (public)
async function getInvestorProfile(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT i.id, u.id AS user_id, u.full_name, u.organization, u.profile_image,
              i.investment_focus, i.min_ticket_size, i.max_ticket_size, i.bio, i.created_at
       FROM investors i JOIN users u ON u.id = i.user_id
       WHERE i.id = ? AND i.is_public = 1 LIMIT 1`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Investor not found' });
    return res.json({ success: true, data: { investor: rows[0] } });
  } catch (err) {
    next(err);
  }
}

<<<<<<< HEAD
// GET /api/members  (public) — directory of registered members
async function getPublicMembers(req, res, next) {
  try {
    const { search } = req.query;
    const { page, limit, offset } = getPagination(req);
    const where = [`role = 'member'`, 'is_active = 1'];
    const params = [];
    if (search) {
      where.push('(full_name LIKE ? OR organization LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    const [rows] = await pool.query(
      `SELECT id, full_name, organization, profile_image, created_at FROM users
       WHERE ${where.join(' AND ')} ORDER BY full_name ASC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM users WHERE ${where.join(' AND ')}`, params);
    return res.json({ success: true, data: { members: rows, page, limit, total } });
  } catch (err) {
    next(err);
  }
}

// GET /api/members/:id  (public)
async function getMemberProfile(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT id, full_name, organization, profile_image, created_at FROM users
       WHERE id = ? AND role = 'member' AND is_active = 1 LIMIT 1`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Member not found' });
    return res.json({ success: true, data: { member: rows[0] } });
  } catch (err) {
    next(err);
  }
}

=======
>>>>>>> d1cca0860ac39149356ef502b0bd42f16f6d9092
// PATCH /api/mentors/me  (mentor updates own public profile)
async function updateMyMentorProfile(req, res, next) {
  try {
    if (req.user.role !== 'mentor') return res.status(403).json({ success: false, message: 'Only mentors can update this profile' });
    const { expertise, bio, linkedinUrl } = req.body;
    await pool.query(
      `INSERT INTO mentors (user_id, expertise, bio, linkedin_url, is_public)
       VALUES (?, ?, ?, ?, 1)
       ON DUPLICATE KEY UPDATE expertise = VALUES(expertise), bio = VALUES(bio), linkedin_url = VALUES(linkedin_url)`,
      [req.user.id, expertise || null, bio || null, linkedinUrl || null]
    );
    return res.json({ success: true, message: 'Mentor profile updated' });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/investors/me  (investor updates own public profile)
async function updateMyInvestorProfile(req, res, next) {
  try {
    if (req.user.role !== 'investor') return res.status(403).json({ success: false, message: 'Only investors can update this profile' });
    const { investmentFocus, minTicketSize, maxTicketSize, bio } = req.body;
    await pool.query(
      `INSERT INTO investors (user_id, investment_focus, min_ticket_size, max_ticket_size, bio, is_public)
       VALUES (?, ?, ?, ?, ?, 1)
       ON DUPLICATE KEY UPDATE investment_focus = VALUES(investment_focus),
         min_ticket_size = VALUES(min_ticket_size), max_ticket_size = VALUES(max_ticket_size), bio = VALUES(bio)`,
      [req.user.id, investmentFocus || null, minTicketSize || null, maxTicketSize || null, bio || null]
    );
    return res.json({ success: true, message: 'Investor profile updated' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllUsers,
  getUserById,
  suspendUser,
  activateUser,
  deleteUser,
  removeAdmin,
<<<<<<< HEAD
  makeAdmin,
=======
>>>>>>> d1cca0860ac39149356ef502b0bd42f16f6d9092
  requestRole,
  getApprovals,
  approveRequest,
  rejectRequest,
  getPublicMentors,
  getMentorProfile,
  getPublicInvestors,
  getInvestorProfile,
<<<<<<< HEAD
  getPublicMembers,
  getMemberProfile,
=======
>>>>>>> d1cca0860ac39149356ef502b0bd42f16f6d9092
  updateMyMentorProfile,
  updateMyInvestorProfile,
};
