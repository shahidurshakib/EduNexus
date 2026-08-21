const { pool } = require('../config/db');

// ----------------------------------------------------------------------------
// GET /api/dashboard  — returns the dashboard payload for the caller's role
// ----------------------------------------------------------------------------
async function getDashboard(req, res, next) {
  try {
    switch (req.user.role) {
      case 'platform_founder':
        return res.json({ success: true, data: await founderDashboard() });
      case 'admin':
        return res.json({ success: true, data: await adminDashboard() });
      case 'mentor':
        return res.json({ success: true, data: await mentorDashboard(req.user.id) });
      case 'investor':
        return res.json({ success: true, data: await investorDashboard(req.user.id) });
      default:
        return res.json({ success: true, data: await memberDashboard(req.user.id) });
    }
  } catch (err) {
    next(err);
  }
}

async function founderDashboard() {
  const [[userCounts]] = await pool.query(
    `SELECT
       SUM(role = 'admin') AS admins,
       SUM(role = 'mentor') AS mentors,
       SUM(role = 'investor') AS investors,
       SUM(role = 'member') AS members,
       COUNT(*) AS totalUsers
     FROM users`
  );
  const [[pending]] = await pool.query(
    `SELECT
       SUM(requested_role = 'admin') AS pendingAdmins,
       SUM(requested_role = 'mentor') AS pendingMentors,
       SUM(requested_role = 'investor') AS pendingInvestors,
       COUNT(*) AS totalPending
     FROM role_approvals WHERE status = 'pending'`
  );
  const [[startupCount]] = await pool.query(`SELECT COUNT(*) AS count FROM startups`);
  const [[researchCount]] = await pool.query(`SELECT COUNT(*) AS count FROM research`);
  const [[fundingTotal]] = await pool.query(`SELECT COALESCE(SUM(amount),0) AS total, COUNT(*) AS count FROM funding_rounds`);
  const [monthlySignups] = await pool.query(
    `SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, COUNT(*) AS count
     FROM users GROUP BY month ORDER BY month DESC LIMIT 12`
  );
  const [recentActivity] = await pool.query(
    `SELECT al.id, al.action, al.entity_type, al.entity_id, al.created_at, u.full_name AS actor
     FROM activity_logs al LEFT JOIN users u ON u.id = al.user_id
     ORDER BY al.created_at DESC LIMIT 15`
  );
  const [recentFunding] = await pool.query(
    `SELECT fr.id, fr.amount, fr.round_type, fr.funding_date, s.name AS startup_name
     FROM funding_rounds fr JOIN startups s ON s.id = fr.startup_id
     ORDER BY fr.funding_date DESC LIMIT 5`
  );

  return { userCounts, pendingApprovals: pending, startupCount: startupCount.count, researchCount: researchCount.count, fundingTotal, monthlySignups, recentActivity, recentFunding };
}

async function adminDashboard() {
  const [[pending]] = await pool.query(
    `SELECT SUM(requested_role = 'mentor') AS pendingMentors, SUM(requested_role = 'investor') AS pendingInvestors
     FROM role_approvals WHERE status = 'pending'`
  );
  const [[startupCount]] = await pool.query(`SELECT COUNT(*) AS count FROM startups`);
  const [[researchCount]] = await pool.query(`SELECT COUNT(*) AS count FROM research`);
  const [[userCount]] = await pool.query(`SELECT COUNT(*) AS count FROM users WHERE role = 'member'`);
  const [recentFunding] = await pool.query(
    `SELECT fr.id, fr.amount, fr.round_type, fr.funding_date, s.name AS startup_name
     FROM funding_rounds fr JOIN startups s ON s.id = fr.startup_id ORDER BY fr.funding_date DESC LIMIT 5`
  );
  const [recentActivity] = await pool.query(
    `SELECT al.id, al.action, al.entity_type, al.entity_id, al.created_at, u.full_name AS actor
     FROM activity_logs al LEFT JOIN users u ON u.id = al.user_id ORDER BY al.created_at DESC LIMIT 15`
  );

  return { pendingApprovals: pending, startupCount: startupCount.count, researchCount: researchCount.count, memberCount: userCount.count, recentFunding, recentActivity };
}

async function mentorDashboard(userId) {
  const [[mentorRow]] = await pool.query(`SELECT id FROM mentors WHERE user_id = ? LIMIT 1`, [userId]);
  if (!mentorRow) return { assignedStartups: [], assignedCount: 0 };

  const [startups] = await pool.query(
    `SELECT s.id, s.name, s.industry, s.current_stage, s.status
     FROM startup_mentors sm JOIN startups s ON s.id = sm.startup_id
     WHERE sm.mentor_id = ? ORDER BY sm.assigned_at DESC`,
    [mentorRow.id]
  );
  const [notifications] = await pool.query(
    `SELECT id, title, message, is_read, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 10`,
    [userId]
  );

  return { assignedStartups: startups, assignedCount: startups.length, recentNotifications: notifications };
}

async function investorDashboard(userId) {
  const [[investorRow]] = await pool.query(`SELECT id FROM investors WHERE user_id = ? LIMIT 1`, [userId]);
  if (!investorRow) return { linkedStartups: [], totalInvested: 0, fundingHistory: [] };

  const [linkedStartups] = await pool.query(
    `SELECT s.id, s.name, s.industry, s.current_stage
     FROM startup_investors si JOIN startups s ON s.id = si.startup_id
     WHERE si.investor_id = ? ORDER BY si.linked_at DESC`,
    [investorRow.id]
  );
  const [fundingHistory] = await pool.query(
    `SELECT fr.id, fr.amount, fr.round_type, fr.funding_date, s.name AS startup_name
     FROM funding_rounds fr JOIN startups s ON s.id = fr.startup_id
     WHERE fr.investor_id = ? ORDER BY fr.funding_date DESC`,
    [investorRow.id]
  );
  const totalInvested = fundingHistory.reduce((sum, f) => sum + Number(f.amount), 0);

  return { linkedStartups, totalInvested, fundingHistory };
}

async function memberDashboard(userId) {
  const [ownStartups] = await pool.query(
    `SELECT s.id, s.name, s.current_stage, s.status
     FROM startup_founders sf JOIN startups s ON s.id = sf.startup_id
     WHERE sf.user_id = ? ORDER BY s.created_at DESC`,
    [userId]
  );
  const [ownResearch] = await pool.query(
    `SELECT id, title, publication_status, patent_status FROM research WHERE created_by = ? ORDER BY created_at DESC`,
    [userId]
  );
  const [[unread]] = await pool.query(
    `SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND is_read = 0`,
    [userId]
  );
  const [pendingRequests] = await pool.query(
    `SELECT requested_role, status FROM role_approvals WHERE user_id = ? ORDER BY created_at DESC`,
    [userId]
  );

  return { ownStartups, ownResearch, unreadNotifications: unread.count, myRoleRequests: pendingRequests };
}

module.exports = { getDashboard };
