const { pool } = require('../config/db');

// GET /api/search?q=...&type=all|startups|research|mentors|investors|users
async function globalSearch(req, res, next) {
  try {
    const { q, type = 'all' } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Query "q" must be at least 2 characters' });
    }
    const like = `%${q.trim()}%`;
    const results = {};

    if (type === 'all' || type === 'startups') {
      const [rows] = await pool.query(
        `SELECT id, name, industry, current_stage, logo FROM startups
         WHERE status = 'active' AND (name LIKE ? OR description LIKE ?) LIMIT 10`,
        [like, like]
      );
      results.startups = rows;
    }

    if (type === 'all' || type === 'research') {
      const [rows] = await pool.query(
        `SELECT id, title, department, publication_status FROM research
         WHERE title LIKE ? OR abstract LIKE ? LIMIT 10`,
        [like, like]
      );
      results.research = rows;
    }

    if (type === 'all' || type === 'mentors') {
      const [rows] = await pool.query(
        `SELECT m.id, u.full_name, m.expertise FROM mentors m JOIN users u ON u.id = m.user_id
         WHERE m.is_public = 1 AND (u.full_name LIKE ? OR m.expertise LIKE ?) LIMIT 10`,
        [like, like]
      );
      results.mentors = rows;
    }

    if (type === 'all' || type === 'investors') {
      const [rows] = await pool.query(
        `SELECT i.id, u.full_name, i.investment_focus FROM investors i JOIN users u ON u.id = i.user_id
         WHERE i.is_public = 1 AND (u.full_name LIKE ? OR i.investment_focus LIKE ?) LIMIT 10`,
        [like, like]
      );
      results.investors = rows;
    }

    // Founder-only: also search all platform users
    if ((type === 'all' || type === 'users') && req.user && ['platform_founder', 'admin'].includes(req.user.role)) {
      const [rows] = await pool.query(
        `SELECT id, full_name, email, role FROM users WHERE full_name LIKE ? OR email LIKE ? LIMIT 10`,
        [like, like]
      );
      results.users = rows;
    }

    return res.json({ success: true, data: { query: q, results } });
  } catch (err) {
    next(err);
  }
}

module.exports = { globalSearch };
