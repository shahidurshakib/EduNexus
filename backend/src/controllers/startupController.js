const { pool } = require('../config/db');
const { getPagination, notifyUser, logActivity } = require('../utils/query');

const MANAGER_ROLES = ['platform_founder', 'admin'];

async function isStartupFounder(startupId, userId) {
  const [rows] = await pool.query(
    `SELECT id FROM startup_founders WHERE startup_id = ? AND user_id = ? LIMIT 1`,
    [startupId, userId]
  );
  return rows.length > 0;
}

async function canManageStartup(req, startupId) {
  if (MANAGER_ROLES.includes(req.user.role)) return true;
  return isStartupFounder(startupId, req.user.id);
}

// ----------------------------------------------------------------------------
// POST /api/startups  (any authenticated user — becomes a startup founder)
// ----------------------------------------------------------------------------
async function createStartup(req, res, next) {
  const conn = await pool.getConnection();
  try {
    const { name, description, industry, domain, location, website, fundingNeeded } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Startup name is required' });

    await conn.beginTransaction();

    const [result] = await conn.query(
      `INSERT INTO startups (name, description, industry, domain, location, website, funding_needed, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, description || null, industry || null, domain || null, location || null, website || null, fundingNeeded || null, req.user.id]
    );
    const startupId = result.insertId;

    await conn.query(
      `INSERT INTO startup_founders (startup_id, user_id, role_title) VALUES (?, ?, 'Founder')`,
      [startupId, req.user.id]
    );

    await conn.commit();
    return res.status(201).json({ success: true, message: 'Startup created successfully', data: { id: startupId } });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
}

// ----------------------------------------------------------------------------
// GET /api/startups  (public)  — search, filter, pagination
// query: search, industry, stage, status, page, limit
// ----------------------------------------------------------------------------
async function listStartups(req, res, next) {
  try {
    const { search, industry, stage, status } = req.query;
    const { page, limit, offset } = getPagination(req);

    const where = [];
    const params = [];
    if (search) {
      where.push('(s.name LIKE ? OR s.description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    if (industry) {
      where.push('s.industry = ?');
      params.push(industry);
    }
    if (stage) {
      where.push('s.current_stage = ?');
      params.push(stage);
    }
    // Public listing defaults to active only, unless a manager explicitly asks otherwise
    if (status) {
      where.push('s.status = ?');
      params.push(status);
    } else if (!req.user || !MANAGER_ROLES.includes(req.user.role)) {
      where.push(`s.status = 'active'`);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [rows] = await pool.query(
      `SELECT s.id, s.name, s.description, s.industry, s.domain, s.current_stage,
              s.website, s.location, s.logo, s.funding_needed, s.status, s.created_at
       FROM startups s ${whereSql}
       ORDER BY s.created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM startups s ${whereSql}`, params);

    return res.json({ success: true, data: { startups: rows, page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    next(err);
  }
}

// ----------------------------------------------------------------------------
// GET /api/startups/:id  (public) — full detail incl. founders/mentors/investors/funding
// ----------------------------------------------------------------------------
async function getStartup(req, res, next) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`SELECT * FROM startups WHERE id = ? LIMIT 1`, [id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Startup not found' });
    const startup = rows[0];

    const [founders] = await pool.query(
      `SELECT u.id, u.full_name, u.profile_image, sf.role_title
       FROM startup_founders sf JOIN users u ON u.id = sf.user_id WHERE sf.startup_id = ?`,
      [id]
    );
    const [mentors] = await pool.query(
      `SELECT m.id, u.full_name, u.profile_image, m.expertise
       FROM startup_mentors sm JOIN mentors m ON m.id = sm.mentor_id JOIN users u ON u.id = m.user_id
       WHERE sm.startup_id = ?`,
      [id]
    );
    const [investors] = await pool.query(
      `SELECT i.id, u.full_name, u.profile_image, i.investment_focus
       FROM startup_investors si JOIN investors i ON i.id = si.investor_id JOIN users u ON u.id = i.user_id
       WHERE si.startup_id = ?`,
      [id]
    );
    const [funding] = await pool.query(
      `SELECT fr.id, fr.amount, fr.round_type, fr.funding_date, u.full_name AS investor_name
       FROM funding_rounds fr LEFT JOIN investors i ON i.id = fr.investor_id LEFT JOIN users u ON u.id = i.user_id
       WHERE fr.startup_id = ? ORDER BY fr.funding_date DESC`,
      [id]
    );

    return res.json({ success: true, data: { startup, founders, mentors, investors, fundingHistory: funding } });
  } catch (err) {
    next(err);
  }
}

// ----------------------------------------------------------------------------
// PUT /api/startups/:id  (owner founder, admin, platform_founder)
// ----------------------------------------------------------------------------
async function updateStartup(req, res, next) {
  try {
    const { id } = req.params;
    const [existing] = await pool.query('SELECT id FROM startups WHERE id = ? LIMIT 1', [id]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'Startup not found' });

    if (!(await canManageStartup(req, id))) {
      return res.status(403).json({ success: false, message: 'You do not have permission to edit this startup' });
    }

    const { name, description, industry, domain, location, website, fundingNeeded } = req.body;
    const fields = [];
    const params = [];
    const map = { name, description, industry, domain, location, website };
    for (const [col, val] of Object.entries(map)) {
      if (val !== undefined) {
        fields.push(`${col === 'name' ? 'name' : col} = ?`);
        params.push(val);
      }
    }
    if (fundingNeeded !== undefined) {
      fields.push('funding_needed = ?');
      params.push(fundingNeeded);
    }
    if (fields.length === 0) return res.status(400).json({ success: false, message: 'No fields to update' });

    params.push(id);
    await pool.query(`UPDATE startups SET ${fields.join(', ')} WHERE id = ?`, params);
    await logActivity(pool, req.user.id, `Updated startup #${id}`, 'startup', id);

    return res.json({ success: true, message: 'Startup updated successfully' });
  } catch (err) {
    next(err);
  }
}

// ----------------------------------------------------------------------------
// DELETE /api/startups/:id  (owner founder, admin, platform_founder)
// ----------------------------------------------------------------------------
async function deleteStartup(req, res, next) {
  try {
    const { id } = req.params;
    const [existing] = await pool.query('SELECT id FROM startups WHERE id = ? LIMIT 1', [id]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'Startup not found' });

    if (!(await canManageStartup(req, id))) {
      return res.status(403).json({ success: false, message: 'You do not have permission to delete this startup' });
    }

    await pool.query('DELETE FROM startups WHERE id = ?', [id]);
    await logActivity(pool, req.user.id, `Deleted startup #${id}`, 'startup', id);

    return res.json({ success: true, message: 'Startup deleted successfully' });
  } catch (err) {
    next(err);
  }
}

// ----------------------------------------------------------------------------
// PATCH /api/startups/:id/logo  (owner founder, admin, platform_founder)
// ----------------------------------------------------------------------------
async function uploadLogo(req, res, next) {
  try {
    const { id } = req.params;
    const [existing] = await pool.query('SELECT id FROM startups WHERE id = ? LIMIT 1', [id]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'Startup not found' });
    if (!(await canManageStartup(req, id))) {
      return res.status(403).json({ success: false, message: 'You do not have permission to edit this startup' });
    }
    if (!req.file) return res.status(400).json({ success: false, message: 'No logo file uploaded' });

    const logoPath = `/uploads/startups/${req.file.filename}`;
    await pool.query('UPDATE startups SET logo = ? WHERE id = ?', [logoPath, id]);

    return res.json({ success: true, message: 'Logo uploaded successfully', data: { logo: logoPath } });
  } catch (err) {
    next(err);
  }
}

// ----------------------------------------------------------------------------
// PATCH /api/startups/:id/status  (admin, platform_founder — "Track Startup Status")
// ----------------------------------------------------------------------------
async function updateStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['active', 'inactive', 'archived'].includes(status)) {
      return res.status(400).json({ success: false, message: 'status must be active, inactive, or archived' });
    }
    const [existing] = await pool.query('SELECT id, created_by FROM startups WHERE id = ? LIMIT 1', [id]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'Startup not found' });

    await pool.query('UPDATE startups SET status = ? WHERE id = ?', [status, id]);
    await notifyUser(pool, existing[0].created_by, 'Startup Status Updated', `Your startup's status was changed to "${status}".`);
    await logActivity(pool, req.user.id, `Set startup #${id} status to ${status}`, 'startup', id);

    return res.json({ success: true, message: 'Startup status updated' });
  } catch (err) {
    next(err);
  }
}

// ----------------------------------------------------------------------------
// POST /api/startups/:id/mentors  { mentorId }  (owner founder, admin, platform_founder)
// ----------------------------------------------------------------------------
async function assignMentor(req, res, next) {
  try {
    const { id } = req.params;
    const { mentorId } = req.body;
    if (!mentorId) return res.status(400).json({ success: false, message: 'mentorId is required' });
    if (!(await canManageStartup(req, id))) {
      return res.status(403).json({ success: false, message: 'You do not have permission to manage this startup' });
    }
    const [mentor] = await pool.query('SELECT id, user_id FROM mentors WHERE id = ? AND is_public = 1 LIMIT 1', [mentorId]);
    if (mentor.length === 0) return res.status(404).json({ success: false, message: 'Approved mentor not found' });

    await pool.query(
      `INSERT IGNORE INTO startup_mentors (startup_id, mentor_id) VALUES (?, ?)`,
      [id, mentorId]
    );
    await notifyUser(pool, mentor[0].user_id, 'Assigned to a Startup', 'You have been assigned as a mentor to a startup.');

    return res.status(201).json({ success: true, message: 'Mentor assigned successfully' });
  } catch (err) {
    next(err);
  }
}

// ----------------------------------------------------------------------------
// POST /api/startups/:id/investors  { investorId }  (owner founder, admin, platform_founder)
// ----------------------------------------------------------------------------
async function assignInvestor(req, res, next) {
  try {
    const { id } = req.params;
    const { investorId } = req.body;
    if (!investorId) return res.status(400).json({ success: false, message: 'investorId is required' });
    if (!(await canManageStartup(req, id))) {
      return res.status(403).json({ success: false, message: 'You do not have permission to manage this startup' });
    }
    const [investor] = await pool.query('SELECT id, user_id FROM investors WHERE id = ? AND is_public = 1 LIMIT 1', [investorId]);
    if (investor.length === 0) return res.status(404).json({ success: false, message: 'Approved investor not found' });

    await pool.query(
      `INSERT IGNORE INTO startup_investors (startup_id, investor_id) VALUES (?, ?)`,
      [id, investorId]
    );
    await notifyUser(pool, investor[0].user_id, 'Linked to a Startup', 'You have been linked to a startup as an investor.');

    return res.status(201).json({ success: true, message: 'Investor assigned successfully' });
  } catch (err) {
    next(err);
  }
}

// ----------------------------------------------------------------------------
// POST /api/startups/:id/founders  { userId, roleTitle }  (owner founder, admin, platform_founder)
// ----------------------------------------------------------------------------
async function assignFounder(req, res, next) {
  try {
    const { id } = req.params;
    const { userId, roleTitle } = req.body;
    if (!userId) return res.status(400).json({ success: false, message: 'userId is required' });
    if (!(await canManageStartup(req, id))) {
      return res.status(403).json({ success: false, message: 'You do not have permission to manage this startup' });
    }
    const [user] = await pool.query('SELECT id FROM users WHERE id = ? AND is_active = 1 LIMIT 1', [userId]);
    if (user.length === 0) return res.status(404).json({ success: false, message: 'User not found' });

    await pool.query(
      `INSERT IGNORE INTO startup_founders (startup_id, user_id, role_title) VALUES (?, ?, ?)`,
      [id, userId, roleTitle || 'Co-Founder']
    );
    await notifyUser(pool, userId, 'Added as Startup Founder', 'You have been added as a founder of a startup.');

    return res.status(201).json({ success: true, message: 'Founder assigned successfully' });
  } catch (err) {
    next(err);
  }
}

// ----------------------------------------------------------------------------
// GET /api/startups/stats/summary  (public)
// "Running startups" = startups that have at least one investor attached.
// ----------------------------------------------------------------------------
async function getStats(req, res, next) {
  try {
    const [[running]] = await pool.query(
      `SELECT COUNT(DISTINCT startup_id) AS count FROM startup_investors`
    );
    const [[total]] = await pool.query(`SELECT COUNT(*) AS count FROM startups`);
    return res.json({
      success: true,
      message: 'Startup stats fetched',
      data: { runningStartups: running.count, totalStartups: total.count },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createStartup,
  listStartups,
  getStartup,
  updateStartup,
  deleteStartup,
  uploadLogo,
  updateStatus,
  assignMentor,
  assignInvestor,
  assignFounder,
  getStats,
};
