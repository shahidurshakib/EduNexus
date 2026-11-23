const path = require('path');
const { pool } = require('../config/db');
const { getPagination, notifyUser, logActivity } = require('../utils/query');

const MANAGER_ROLES = ['platform_founder', 'admin'];
const TARGET_TYPES = ['startup', 'mentor', 'investor'];

// ----------------------------------------------------------------------------
// Resolve which user IDs are allowed to review applications sent to a target.
// ----------------------------------------------------------------------------
async function getTargetOwnerUserIds(targetType, targetId) {
  if (targetType === 'mentor') {
    const [rows] = await pool.query(`SELECT user_id FROM mentors WHERE id = ? LIMIT 1`, [targetId]);
    return rows.map((r) => r.user_id);
  }
  if (targetType === 'investor') {
    const [rows] = await pool.query(`SELECT user_id FROM investors WHERE id = ? LIMIT 1`, [targetId]);
    return rows.map((r) => r.user_id);
  }
  if (targetType === 'startup') {
    const [founders] = await pool.query(`SELECT user_id FROM startup_founders WHERE startup_id = ?`, [targetId]);
    const [investors] = await pool.query(
      `SELECT i.user_id FROM startup_investors si JOIN investors i ON i.id = si.investor_id WHERE si.startup_id = ?`,
      [targetId]
    );
    return [...founders.map((f) => f.user_id), ...investors.map((i) => i.user_id)];
  }
  return [];
}

async function targetLabel(targetType, targetId) {
  if (targetType === 'startup') {
    const [rows] = await pool.query(`SELECT name FROM startups WHERE id = ? LIMIT 1`, [targetId]);
    return rows[0]?.name || `Startup #${targetId}`;
  }
  if (targetType === 'mentor') {
    const [rows] = await pool.query(`SELECT u.full_name FROM mentors m JOIN users u ON u.id = m.user_id WHERE m.id = ? LIMIT 1`, [targetId]);
    return rows[0]?.full_name || `Mentor #${targetId}`;
  }
  const [rows] = await pool.query(`SELECT u.full_name FROM investors i JOIN users u ON u.id = i.user_id WHERE i.id = ? LIMIT 1`, [targetId]);
  return rows[0]?.full_name || `Investor #${targetId}`;
}

async function targetExists(targetType, targetId) {
  const table = targetType === 'startup' ? 'startups' : targetType === 'mentor' ? 'mentors' : 'investors';
  const [rows] = await pool.query(`SELECT id FROM ${table} WHERE id = ? LIMIT 1`, [targetId]);
  return rows.length > 0;
}

function shapeApplication(row, canSeeFile) {
  return {
    id: row.id,
    applicantId: row.applicant_id,
    applicantName: row.applicant_name,
    applicantRole: row.applicant_role,
    targetType: row.target_type,
    targetId: row.target_id,
    title: row.title,
    message: row.message,
    hasProposal: !!row.proposal_file,
    isLocked: !!row.is_locked,
    proposalUrl: row.proposal_file && canSeeFile ? `/api/applications/${row.id}/proposal` : null,
    status: row.status,
    reviewNote: row.review_note,
    reviewedBy: row.reviewed_by,
    reviewedAt: row.reviewed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ----------------------------------------------------------------------------
// POST /api/applications
// Any registered member or mentor applies to a startup / mentor / investor.
// ----------------------------------------------------------------------------
async function createApplication(req, res, next) {
  try {
    const { targetType, targetId, title, message } = req.body;
    if (!TARGET_TYPES.includes(targetType)) {
      return res.status(400).json({ success: false, message: 'targetType must be startup, mentor, or investor' });
    }
    if (!targetId) return res.status(400).json({ success: false, message: 'targetId is required' });
    if (!(await targetExists(targetType, targetId))) {
      return res.status(404).json({ success: false, message: 'Target not found' });
    }

    const ownerIds = await getTargetOwnerUserIds(targetType, targetId);
    if (ownerIds.includes(req.user.id)) {
      return res.status(400).json({ success: false, message: 'You cannot apply to your own listing' });
    }

    const proposalFile = req.file ? `/uploads/proposals/${req.file.filename}` : null;
    const isLocked = req.body.isLocked === '1' || req.body.isLocked === 'true' || req.body.isLocked === true;

    const [result] = await pool.query(
      `INSERT INTO applications (applicant_id, target_type, target_id, title, message, proposal_file, is_locked, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [req.user.id, targetType, targetId, title || null, message || null, proposalFile, isLocked ? 1 : 0]
    );

    const label = await targetLabel(targetType, targetId);
    for (const ownerId of ownerIds) {
      await notifyUser(pool, ownerId, 'New application received', `${req.user.full_name} applied to ${label}.`);
    }
    await logActivity(pool, req.user.id, `Applied to ${targetType} "${label}"`, targetType, targetId);

    return res.status(201).json({ success: true, message: 'Application submitted — status: pending', data: { id: result.insertId } });
  } catch (err) {
    next(err);
  }
}

// ----------------------------------------------------------------------------
// GET /api/applications/mine — my submitted applications
// ----------------------------------------------------------------------------
async function listMine(req, res, next) {
  try {
    const { page, limit, offset } = getPagination(req);
    const [rows] = await pool.query(
      `SELECT a.*, u.full_name AS applicant_name, u.role AS applicant_role
       FROM applications a JOIN users u ON u.id = a.applicant_id
       WHERE a.applicant_id = ? ORDER BY a.created_at DESC LIMIT ? OFFSET ?`,
      [req.user.id, limit, offset]
    );
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM applications WHERE applicant_id = ?`, [req.user.id]);
    const data = rows.map((r) => shapeApplication(r, true));
    return res.json({ success: true, data: { applications: data, page, limit, total } });
  } catch (err) {
    next(err);
  }
}

// ----------------------------------------------------------------------------
// GET /api/applications/incoming — applications sent to things I own
// (my mentor profile, my investor profile, or startups I founded/invested in)
// ----------------------------------------------------------------------------
async function listIncoming(req, res, next) {
  try {
    const { page, limit, offset } = getPagination(req);
    const { status } = req.query;

    let targetFilter = '1=0';
    const params = [];

    if (MANAGER_ROLES.includes(req.user.role)) {
      targetFilter = '1=1'; // admins/founder see everything
    } else {
      const clauses = [];
      const [mentorRow] = await pool.query(`SELECT id FROM mentors WHERE user_id = ? LIMIT 1`, [req.user.id]);
      if (mentorRow.length) { clauses.push(`(a.target_type = 'mentor' AND a.target_id = ?)`); params.push(mentorRow[0].id); }

      const [investorRow] = await pool.query(`SELECT id FROM investors WHERE user_id = ? LIMIT 1`, [req.user.id]);
      if (investorRow.length) { clauses.push(`(a.target_type = 'investor' AND a.target_id = ?)`); params.push(investorRow[0].id); }

      const [startupRows] = await pool.query(
        `SELECT DISTINCT sf.startup_id AS id FROM startup_founders sf WHERE sf.user_id = ?
         UNION
         SELECT DISTINCT si.startup_id AS id FROM startup_investors si JOIN investors i ON i.id = si.investor_id WHERE i.user_id = ?`,
        [req.user.id, req.user.id]
      );
      if (startupRows.length) {
        const ids = startupRows.map((r) => r.id);
        clauses.push(`(a.target_type = 'startup' AND a.target_id IN (${ids.map(() => '?').join(',')}))`);
        params.push(...ids);
      }
      if (clauses.length) targetFilter = clauses.join(' OR ');
    }

    const statusFilter = status ? 'AND a.status = ?' : '';
    if (status) params.push(status);

    const [rows] = await pool.query(
      `SELECT a.*, u.full_name AS applicant_name, u.role AS applicant_role
       FROM applications a JOIN users u ON u.id = a.applicant_id
       WHERE (${targetFilter}) ${statusFilter}
       ORDER BY a.created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM applications a WHERE (${targetFilter}) ${statusFilter}`,
      params
    );
    const data = rows.map((r) => shapeApplication(r, true));
    return res.json({ success: true, data: { applications: data, page, limit, total } });
  } catch (err) {
    next(err);
  }
}

// ----------------------------------------------------------------------------
// PATCH /api/applications/:id/status  { status: approved|revised|rejected, reviewNote }
// Only the target owner (mentor/investor themselves, a startup's founders or
// its investors) or an admin/founder may decide.
// ----------------------------------------------------------------------------
async function reviewApplication(req, res, next) {
  try {
    const { status, reviewNote } = req.body;
    if (!['approved', 'revised', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'status must be approved, revised, or rejected' });
    }
    const [rows] = await pool.query(`SELECT * FROM applications WHERE id = ? LIMIT 1`, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Application not found' });
    const app = rows[0];

    const ownerIds = await getTargetOwnerUserIds(app.target_type, app.target_id);
    const canReview = MANAGER_ROLES.includes(req.user.role) || ownerIds.includes(req.user.id);
    if (!canReview) return res.status(403).json({ success: false, message: 'You are not authorized to review this application' });

    await pool.query(
      `UPDATE applications SET status = ?, review_note = ?, reviewed_by = ?, reviewed_at = NOW() WHERE id = ?`,
      [status, reviewNote || null, req.user.id, app.id]
    );

    // On approval into a startup, if the applicant is a mentor, attach them
    // to the startup's mentor list so they show up on its detail page.
    if (status === 'approved' && app.target_type === 'startup') {
      const [applicantRows] = await pool.query('SELECT role FROM users WHERE id = ? LIMIT 1', [app.applicant_id]);
      if (applicantRows[0]?.role === 'mentor') {
        const [mentorRow] = await pool.query('SELECT id FROM mentors WHERE user_id = ? LIMIT 1', [app.applicant_id]);
        if (mentorRow.length) {
          await pool.query('INSERT IGNORE INTO startup_mentors (startup_id, mentor_id) VALUES (?, ?)', [app.target_id, mentorRow[0].id]);
        }
      }
    }

    const label = await targetLabel(app.target_type, app.target_id);
    const noteSuffix = status === 'revised' && reviewNote ? ` Note: ${reviewNote}` : '';
    await notifyUser(pool, app.applicant_id, `Application ${status}`, `Your application to ${label} was marked ${status}.${noteSuffix}`);
    await logActivity(pool, req.user.id, `Marked application #${app.id} as ${status}`, app.target_type, app.target_id);

    return res.json({ success: true, message: `Application marked ${status}` });
  } catch (err) {
    next(err);
  }
}

// ----------------------------------------------------------------------------
// PATCH /api/applications/:id/resubmit — applicant updates & resubmits a
// "revised" application, putting it back to pending.
// ----------------------------------------------------------------------------
async function resubmitApplication(req, res, next) {
  try {
    const [rows] = await pool.query(`SELECT * FROM applications WHERE id = ? LIMIT 1`, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Application not found' });
    const app = rows[0];

    if (app.applicant_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Only the applicant can resubmit this application' });
    }
    if (app.status !== 'revised') {
      return res.status(400).json({ success: false, message: 'Only an application marked "revised" can be resubmitted' });
    }

    const { title, message } = req.body;
    const proposalFile = req.file ? `/uploads/proposals/${req.file.filename}` : app.proposal_file;

    await pool.query(
      `UPDATE applications SET title = ?, message = ?, proposal_file = ?, status = 'pending', review_note = NULL, reviewed_by = NULL, reviewed_at = NULL
       WHERE id = ?`,
      [title || app.title, message || app.message, proposalFile, app.id]
    );

    const ownerIds = await getTargetOwnerUserIds(app.target_type, app.target_id);
    const label = await targetLabel(app.target_type, app.target_id);
    for (const ownerId of ownerIds) {
      await notifyUser(pool, ownerId, 'Application resubmitted', `${req.user.full_name} resubmitted their application to ${label}.`);
    }

    return res.json({ success: true, message: 'Application resubmitted — status: pending' });
  } catch (err) {
    next(err);
  }
}

// ----------------------------------------------------------------------------
// GET /api/applications/:id/proposal — protected file download.
// Allowed: the applicant, the target owner(s), or admin/founder. A locked
// application additionally requires one of those roles even to know the file
// exists (list/detail responses already hide proposalUrl otherwise).
// ----------------------------------------------------------------------------
async function downloadProposal(req, res, next) {
  try {
    const [rows] = await pool.query(`SELECT * FROM applications WHERE id = ? LIMIT 1`, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Application not found' });
    const app = rows[0];
    if (!app.proposal_file) return res.status(404).json({ success: false, message: 'No proposal file on this application' });

    const ownerIds = await getTargetOwnerUserIds(app.target_type, app.target_id);
    const allowed = MANAGER_ROLES.includes(req.user.role) || req.user.id === app.applicant_id || ownerIds.includes(req.user.id);
    if (!allowed) return res.status(403).json({ success: false, message: 'You do not have access to this document' });

    const absolutePath = path.join(__dirname, '..', '..', app.proposal_file.replace(/^\/uploads/, 'uploads'));
    return res.download(absolutePath);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createApplication,
  listMine,
  listIncoming,
  reviewApplication,
  resubmitApplication,
  downloadProposal,
};
