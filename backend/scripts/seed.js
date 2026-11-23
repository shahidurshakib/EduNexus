/**
 * Seeds the ONE Founder account, a sample admin, and sample verified
 * mentor/investor accounts — with correctly generated bcrypt hashes.
 *
 * Run AFTER schema.sql has been imported and .env is configured:
 *   npm run seed
 *
 * Default password for every seeded account: ChangeMe123!
 * CHANGE THE FOUNDER PASSWORD IMMEDIATELY AFTER YOUR FIRST LOGIN.
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('../src/config/db');

const DEFAULT_PASSWORD = 'ChangeMe123!';

async function upsertUser(conn, { fullName, email, phone, organization, role }) {
  const [existing] = await conn.query('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length > 0) {
    console.log(`↷ Skipping ${email} (already exists)`);
    return existing[0].id;
  }
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
  const [result] = await conn.query(
    `INSERT INTO users (full_name, email, password_hash, phone, organization, role, is_email_verified, is_active)
     VALUES (?, ?, ?, ?, ?, ?, 1, 1)`,
    [fullName, email, passwordHash, phone, organization, role]
  );
  console.log(`✔ Created ${role}: ${email} / ${DEFAULT_PASSWORD}`);
  return result.insertId;
}

async function run() {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const founderId = await upsertUser(conn, {
      fullName: 'EduNexus Founder',
      email: 'founder@edunexus.local',
      phone: '+8801000000000',
      organization: 'EduNexus HQ',
      role: 'platform_founder',
    });

    await upsertUser(conn, {
      fullName: 'Sample Admin',
      email: 'admin@edunexus.local',
      phone: '+8801111111111',
      organization: 'EduNexus HQ',
      role: 'admin',
    });

    await upsertUser(conn, {
      fullName: 'Nusrat Jahan',
      email: 'nusrat@example.com',
      phone: '+8801222222222',
      organization: 'SUST',
      role: 'member',
    });

    const mentorId = await upsertUser(conn, {
      fullName: 'Dr. Kamal Hossain',
      email: 'kamal.mentor@example.com',
      phone: '+8801333333333',
      organization: 'SUST',
      role: 'mentor',
    });

    const investorId = await upsertUser(conn, {
      fullName: 'Rafiul Islam',
      email: 'rafiul.investor@example.com',
      phone: '+8801444444444',
      organization: 'Bengal Angels',
      role: 'investor',
    });

    const [mentorProfile] = await conn.query('SELECT id FROM mentors WHERE user_id = ?', [mentorId]);
    if (mentorProfile.length === 0) {
      await conn.query(
        `INSERT INTO mentors (user_id, expertise, bio, is_public) VALUES (?, ?, ?, 1)`,
        [mentorId, 'AI/ML, Product Strategy', 'Ex-founder, now mentoring university startups.']
      );
    }

    const [investorProfile] = await conn.query('SELECT id FROM investors WHERE user_id = ?', [investorId]);
    if (investorProfile.length === 0) {
      await conn.query(
        `INSERT INTO investors (user_id, investment_focus, min_ticket_size, max_ticket_size, bio, is_public)
         VALUES (?, ?, ?, ?, ?, 1)`,
        [investorId, 'EdTech, FinTech', 5000.0, 100000.0, 'Angel investor focused on early university spinouts.']
      );
    }

    const [existingApproval1] = await conn.query(
      `SELECT id FROM role_approvals WHERE user_id = ? AND requested_role = 'mentor'`,
      [mentorId]
    );
    if (existingApproval1.length === 0) {
      await conn.query(
        `INSERT INTO role_approvals (user_id, requested_role, status, reviewed_by) VALUES (?, 'mentor', 'approved', ?)`,
        [mentorId, founderId]
      );
    }

    const [existingApproval2] = await conn.query(
      `SELECT id FROM role_approvals WHERE user_id = ? AND requested_role = 'investor'`,
      [investorId]
    );
    if (existingApproval2.length === 0) {
      await conn.query(
        `INSERT INTO role_approvals (user_id, requested_role, status, reviewed_by) VALUES (?, 'investor', 'approved', ?)`,
        [investorId, founderId]
      );
    }

    await conn.commit();
    console.log('\n✅ Seeding complete. Default password for all seeded accounts:', DEFAULT_PASSWORD);
    console.log('⚠️  Change the Founder password immediately after your first login.');
  } catch (err) {
    await conn.rollback();
    console.error('❌ Seeding failed:', err.message);
    process.exitCode = 1;
  } finally {
    conn.release();
    await pool.end();
  }
}

run();
