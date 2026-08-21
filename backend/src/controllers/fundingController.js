const { pool } = require('../config/db');
const { getPagination, notifyUser, logActivity } = require('../utils/query');

const MANAGER_ROLES = ['platform_founder', 'admin'];
const ROUND_TYPES = ['pre_seed', 'seed', 'series_a', 'series_b', 'series_c', 'bridge', 'grant'];

// ----------------------------------------------------------------------------
// POST /api/funding  — record a funding round
// Allowed: founder/admin (any), the matching investor (own investorId),
// or a founder of the startup (e.g. recording a grant with no investor).
// ----------------------------------------------------------------------------
async function createFundingRound(req, res, next) {
  try {
    const { startupId, investorId, amount, roundType, fundingDate, notes } = req.body;
    if (!startupId || !amount || !roundType || !fundingDate) {
      return res.status(400).json({ success: false, message: 'startupId, amount, roundType, and fundingDate are required' });
    }
    if (!ROUND_TYPES.includes(roundType)) {
      return res.status(400).json({ success: false, message: `roundType must be one of ${ROUND_TYPES.join(', ')}` });
    }

    const [startup] = await pool.query('SELECT id FROM startups WHERE id = ? LIMIT 1', [startupId]);
    if (startup.length === 0) return res.status(404).json({ success: false, message: 'Startup not found' });

    let authorized = MANAGER_ROLES.includes(req.user.role);
    if (!authorized && req.user.role === 'investor' && investorId) {
      const [inv] = await pool.query('SELECT id FROM investors WHERE id = ? AND user_id = ? LIMIT 1', [investorId, req.user.id]);
      authorized = inv.length > 0;
    }
    if (!authorized) {
      const [founder] = await pool.query(
        'SELECT id FROM startup_founders WHERE startup_id = ? AND user_id = ? LIMIT 1',
        [startupId, req.user.id]
      );
      authorized = founder.length > 0;
    }
    if (!authorized) {
      return res.status(403).json({ success: false, message: 'You are not authorized to record funding for this startup' });
    }

    const [result] = await pool.query(
      `INSERT INTO funding_rounds (startup_id, investor_id, amount, round_type, funding_date, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [startupId, investorId || null, amount, roundType, fundingDate, notes || null]
    );
    // NOTE: trg_funding_rounds_after_insert (existing DB trigger) auto-advances
    // the startup's current_stage and writes an activity_logs row — no app code needed for that.

    const [creator] = await pool.query('SELECT created_by FROM startups WHERE id = ?', [startupId]);
    await notifyUser(pool, creator[0].created_by, 'New Funding Recorded', `A ${roundType.replace('_', ' ')} round of ${amount} was recorded for your startup.`);

    return res.status(201).json({ success: true, message: 'Funding round recorded successfully', data: { id: result.insertId } });
  } catch (err) {
    next(err);
  }
}

// ----------------------------------------------------------------------------
// GET /api/funding  — filter/paginate
// query: startupId, investorId, roundType, from, to, page, limit
// ----------------------------------------------------------------------------
async function listFundingRounds(req, res, next) {
  try {
    const { startupId, investorId, roundType, from, to } = req.query;
    const { page, limit, offset } = getPagination(req);

    const where = [];
    const params = [];
    if (startupId) { where.push('fr.startup_id = ?'); params.push(startupId); }
    if (investorId) { where.push('fr.investor_id = ?'); params.push(investorId); }
    if (roundType) { where.push('fr.round_type = ?'); params.push(roundType); }
    if (from) { where.push('fr.funding_date >= ?'); params.push(from); }
    if (to) { where.push('fr.funding_date <= ?'); params.push(to); }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [rows] = await pool.query(
      `SELECT fr.id, fr.amount, fr.round_type, fr.funding_date, fr.notes,
              s.id AS startup_id, s.name AS startup_name,
              u.full_name AS investor_name
       FROM funding_rounds fr
       JOIN startups s ON s.id = fr.startup_id
       LEFT JOIN investors i ON i.id = fr.investor_id
       LEFT JOIN users u ON u.id = i.user_id
       ${whereSql} ORDER BY fr.funding_date DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM funding_rounds fr ${whereSql}`, params);

    return res.json({ success: true, data: { fundingRounds: rows, page, limit, total } });
  } catch (err) {
    next(err);
  }
}

async function getFundingRound(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT fr.*, s.name AS startup_name, u.full_name AS investor_name
       FROM funding_rounds fr JOIN startups s ON s.id = fr.startup_id
       LEFT JOIN investors i ON i.id = fr.investor_id LEFT JOIN users u ON u.id = i.user_id
       WHERE fr.id = ? LIMIT 1`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Funding round not found' });
    return res.json({ success: true, data: { fundingRound: rows[0] } });
  } catch (err) {
    next(err);
  }
}

// PUT/DELETE restricted to founder/admin since this is a financial ledger
async function updateFundingRound(req, res, next) {
  try {
    if (!MANAGER_ROLES.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Only admins can edit funding records' });
    }
    const { amount, roundType, fundingDate, notes } = req.body;
    if (roundType && !ROUND_TYPES.includes(roundType)) {
      return res.status(400).json({ success: false, message: `roundType must be one of ${ROUND_TYPES.join(', ')}` });
    }
    const fields = [];
    const params = [];
    const map = { amount, round_type: roundType, funding_date: fundingDate, notes };
    for (const [col, val] of Object.entries(map)) {
      if (val !== undefined) {
        fields.push(`${col} = ?`);
        params.push(val);
      }
    }
    if (fields.length === 0) return res.status(400).json({ success: false, message: 'No fields to update' });
    params.push(req.params.id);
    await pool.query(`UPDATE funding_rounds SET ${fields.join(', ')} WHERE id = ?`, params);
    await logActivity(pool, req.user.id, `Updated funding round #${req.params.id}`, 'funding_round', req.params.id);
    return res.json({ success: true, message: 'Funding round updated successfully' });
  } catch (err) {
    next(err);
  }
}

async function deleteFundingRound(req, res, next) {
  try {
    if (!MANAGER_ROLES.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Only admins can delete funding records' });
    }
    await pool.query('DELETE FROM funding_rounds WHERE id = ?', [req.params.id]);
    await logActivity(pool, req.user.id, `Deleted funding round #${req.params.id}`, 'funding_round', req.params.id);
    return res.json({ success: true, message: 'Funding round deleted successfully' });
  } catch (err) {
    next(err);
  }
}

// ----------------------------------------------------------------------------
// GET /api/funding/analytics  — totals by round type, monthly trend, top startups
// ----------------------------------------------------------------------------
async function fundingAnalytics(req, res, next) {
  try {
    const [byRoundType] = await pool.query(
      `SELECT round_type, COUNT(*) AS count, SUM(amount) AS total FROM funding_rounds GROUP BY round_type`
    );
    const [monthly] = await pool.query(
      `SELECT DATE_FORMAT(funding_date, '%Y-%m') AS month, SUM(amount) AS total, COUNT(*) AS count
       FROM funding_rounds GROUP BY month ORDER BY month DESC LIMIT 12`
    );
    const [topStartups] = await pool.query(
      `SELECT s.id, s.name, SUM(fr.amount) AS total_funding
       FROM funding_rounds fr JOIN startups s ON s.id = fr.startup_id
       GROUP BY s.id, s.name ORDER BY total_funding DESC LIMIT 10`
    );
    const [[overall]] = await pool.query(`SELECT COUNT(*) AS totalRounds, COALESCE(SUM(amount),0) AS totalAmount FROM funding_rounds`);

    return res.json({ success: true, data: { overall, byRoundType, monthlyTrend: monthly, topStartups } });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createFundingRound,
  listFundingRounds,
  getFundingRound,
  updateFundingRound,
  deleteFundingRound,
  fundingAnalytics,
};
