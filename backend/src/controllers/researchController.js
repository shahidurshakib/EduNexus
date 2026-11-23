const path = require('path');
const { pool } = require('../config/db');
const { getPagination, notifyUser, logActivity } = require('../utils/query');

const MANAGER_ROLES = ['platform_founder', 'admin'];

async function canManageResearch(req, createdBy) {
  return MANAGER_ROLES.includes(req.user.role) || createdBy === req.user.id;
}

// Anyone allowed to add a draft proposal / view a locked one: the creator,
// a listed author, an attached mentor, or an admin/founder.
async function getResearchCollaboratorIds(researchId) {
  const [research] = await pool.query('SELECT created_by FROM research WHERE id = ? LIMIT 1', [researchId]);
  const ids = research.length ? [research[0].created_by] : [];
  const [authors] = await pool.query('SELECT user_id FROM research_authors WHERE research_id = ? AND user_id IS NOT NULL', [researchId]);
  ids.push(...authors.map((a) => a.user_id));
  const [mentors] = await pool.query(
    `SELECT m.user_id FROM research_mentors rm JOIN mentors m ON m.id = rm.mentor_id WHERE rm.research_id = ?`,
    [researchId]
  );
  ids.push(...mentors.map((m) => m.user_id));
  return [...new Set(ids)];
}

// ----------------------------------------------------------------------------
// POST /api/research
// ----------------------------------------------------------------------------
async function createResearch(req, res, next) {
  const conn = await pool.getConnection();
  try {
    const { title, abstract, department, supervisor, publicationStatus, patentStatus, authors, keywords } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Title is required' });

    await conn.beginTransaction();

    const [result] = await conn.query(
      `INSERT INTO research (title, abstract, department, supervisor, publication_status, patent_status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        abstract || null,
        department || null,
        supervisor || null,
        publicationStatus || 'draft',
        patentStatus || 'none',
        req.user.id,
      ]
    );
    const researchId = result.insertId;

    const authorList = Array.isArray(authors) && authors.length > 0 ? authors : [{ authorName: req.user.full_name, userId: req.user.id }];
    for (const a of authorList) {
      await conn.query(
        `INSERT INTO research_authors (research_id, user_id, author_name) VALUES (?, ?, ?)`,
        [researchId, a.userId || null, a.authorName || 'Unknown']
      );
    }

    await conn.commit();
    await logActivity(pool, req.user.id, `Created research "${title}"`, 'research', researchId);

    return res.status(201).json({ success: true, message: 'Research created successfully', data: { id: researchId, keywords: keywords || [] } });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
}

// ----------------------------------------------------------------------------
// GET /api/research  — search, filter, pagination
// query: search, department, publicationStatus, patentStatus, page, limit
// ----------------------------------------------------------------------------
async function listResearch(req, res, next) {
  try {
    const { search, department, publicationStatus, patentStatus } = req.query;
    const { page, limit, offset } = getPagination(req);

    const where = [];
    const params = [];
    if (search) {
      where.push('(r.title LIKE ? OR r.abstract LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    if (department) {
      where.push('r.department = ?');
      params.push(department);
    }
    if (publicationStatus) {
      where.push('r.publication_status = ?');
      params.push(publicationStatus);
    }
    if (patentStatus) {
      where.push('r.patent_status = ?');
      params.push(patentStatus);
    }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [rows] = await pool.query(
      `SELECT r.id, r.title, r.abstract, r.department, r.supervisor, r.publication_status,
              r.patent_status, r.pdf_file, r.created_at, u.full_name AS created_by_name
       FROM research r JOIN users u ON u.id = r.created_by
       ${whereSql} ORDER BY r.created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM research r ${whereSql}`, params);

    return res.json({ success: true, data: { research: rows, page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    next(err);
  }
}

// ----------------------------------------------------------------------------
// GET /api/research/:id  — includes authors + linked patents
// ----------------------------------------------------------------------------
async function getResearch(req, res, next) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT r.*, u.full_name AS created_by_name, u.organization AS created_by_organization
       FROM research r JOIN users u ON u.id = r.created_by WHERE r.id = ? LIMIT 1`,
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Research not found' });

    const [authors] = await pool.query(
      `SELECT ra.id, ra.author_name, ra.user_id FROM research_authors ra WHERE ra.research_id = ?`,
      [id]
    );
    const [patents] = await pool.query(`SELECT * FROM patents WHERE research_id = ?`, [id]);
    const [mentors] = await pool.query(
      `SELECT m.id AS mentor_id, u.full_name, m.expertise FROM research_mentors rm
       JOIN mentors m ON m.id = rm.mentor_id JOIN users u ON u.id = m.user_id
       WHERE rm.research_id = ?`,
      [id]
    );

    const collaboratorIds = req.user ? await getResearchCollaboratorIds(id) : [];
    const canSeeLocked = req.user && (MANAGER_ROLES.includes(req.user.role) || collaboratorIds.includes(req.user.id));

    const [docRows] = await pool.query(
      `SELECT d.id, d.doc_type, d.original_name, d.is_locked, d.created_at, u.full_name AS uploaded_by_name
       FROM documents d JOIN users u ON u.id = d.uploaded_by
       WHERE d.entity_type = 'research' AND d.entity_id = ? ORDER BY d.created_at DESC`,
      [id]
    );
    const documents = docRows.map((d) => ({
      id: d.id,
      docType: d.doc_type,
      originalName: d.original_name,
      isLocked: !!d.is_locked,
      uploadedByName: d.uploaded_by_name,
      createdAt: d.created_at,
      downloadUrl: !d.is_locked || canSeeLocked ? `/api/research/documents/${d.id}/download` : null,
    }));

    return res.json({ success: true, data: { research: rows[0], authors, patents, mentors, documents } });
  } catch (err) {
    next(err);
  }
}

// ----------------------------------------------------------------------------
// POST /api/research/:id/mentors  { mentorId } — owner or admin/founder attaches
// a mentor so the research detail page can show who is guiding it.
// ----------------------------------------------------------------------------
async function addResearchMentor(req, res, next) {
  try {
    const { id } = req.params;
    const { mentorId } = req.body;
    if (!mentorId) return res.status(400).json({ success: false, message: 'mentorId is required' });

    const [existing] = await pool.query('SELECT created_by FROM research WHERE id = ? LIMIT 1', [id]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'Research not found' });
    if (!(await canManageResearch(req, existing[0].created_by))) {
      return res.status(403).json({ success: false, message: 'You do not have permission to add a mentor to this research' });
    }

    const [mentorRows] = await pool.query('SELECT user_id FROM mentors WHERE id = ? LIMIT 1', [mentorId]);
    if (mentorRows.length === 0) return res.status(404).json({ success: false, message: 'Mentor not found' });

    await pool.query(
      `INSERT IGNORE INTO research_mentors (research_id, mentor_id) VALUES (?, ?)`,
      [id, mentorId]
    );
    await notifyUser(pool, mentorRows[0].user_id, 'Added to a research project', `You were added as a mentor on a research project.`);

    return res.status(201).json({ success: true, message: 'Mentor added to research' });
  } catch (err) {
    next(err);
  }
}

// ----------------------------------------------------------------------------
// POST /api/research/:id/documents  (multipart: proposal) { docType, isLocked }
// A member or mentor collaborator uploads the full paper or a draft proposal.
// ----------------------------------------------------------------------------
async function uploadResearchDocument(req, res, next) {
  try {
    const { id } = req.params;
    const [existing] = await pool.query('SELECT id FROM research WHERE id = ? LIMIT 1', [id]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'Research not found' });

    const collaboratorIds = await getResearchCollaboratorIds(id);
    const allowed = MANAGER_ROLES.includes(req.user.role) || collaboratorIds.includes(req.user.id);
    if (!allowed) return res.status(403).json({ success: false, message: 'Only the research owner, its authors, or its mentors can upload here' });
    if (!req.file) return res.status(400).json({ success: false, message: 'No PDF file uploaded' });

    const { docType } = req.body;
    const isLocked = req.body.isLocked === '1' || req.body.isLocked === 'true' || req.body.isLocked === true;
    const filePath = `/uploads/proposals/${req.file.filename}`;

    const [result] = await pool.query(
      `INSERT INTO documents (entity_type, entity_id, file_path, original_name, doc_type, is_locked, uploaded_by)
       VALUES ('research', ?, ?, ?, ?, ?, ?)`,
      [id, filePath, req.file.originalname, docType === 'full_paper' ? 'full_paper' : 'draft_proposal', isLocked ? 1 : 0, req.user.id]
    );

    return res.status(201).json({ success: true, message: 'Document uploaded successfully', data: { id: result.insertId } });
  } catch (err) {
    next(err);
  }
}

// ----------------------------------------------------------------------------
// GET /api/research/documents/:docId/download — protected when locked.
// ----------------------------------------------------------------------------
async function downloadResearchDocument(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT * FROM documents WHERE id = ? AND entity_type = "research" LIMIT 1', [req.params.docId]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Document not found' });
    const doc = rows[0];

    if (doc.is_locked) {
      if (!req.user) return res.status(401).json({ success: false, message: 'Please log in to access this document' });
      const collaboratorIds = await getResearchCollaboratorIds(doc.entity_id);
      const allowed = MANAGER_ROLES.includes(req.user.role) || collaboratorIds.includes(req.user.id);
      if (!allowed) return res.status(403).json({ success: false, message: 'This document is locked — access restricted to the research team' });
    }

    const absolutePath = path.join(__dirname, '..', '..', doc.file_path.replace(/^\/uploads/, 'uploads'));
    return res.download(absolutePath, doc.original_name || undefined);
  } catch (err) {
    next(err);
  }
}

// ----------------------------------------------------------------------------
// PUT /api/research/:id
// ----------------------------------------------------------------------------
async function updateResearch(req, res, next) {
  try {
    const { id } = req.params;
    const [existing] = await pool.query('SELECT created_by FROM research WHERE id = ? LIMIT 1', [id]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'Research not found' });
    if (!(await canManageResearch(req, existing[0].created_by))) {
      return res.status(403).json({ success: false, message: 'You do not have permission to edit this research' });
    }

    const { title, abstract, department, supervisor, publicationStatus, patentStatus } = req.body;
    const fields = [];
    const params = [];
    const map = { title, abstract, department, supervisor, publication_status: publicationStatus, patent_status: patentStatus };
    for (const [col, val] of Object.entries(map)) {
      if (val !== undefined) {
        fields.push(`${col} = ?`);
        params.push(val);
      }
    }
    if (fields.length === 0) return res.status(400).json({ success: false, message: 'No fields to update' });

    params.push(id);
    await pool.query(`UPDATE research SET ${fields.join(', ')} WHERE id = ?`, params);
    await logActivity(pool, req.user.id, `Updated research #${id}`, 'research', id);

    return res.json({ success: true, message: 'Research updated successfully' });
  } catch (err) {
    next(err);
  }
}

// ----------------------------------------------------------------------------
// DELETE /api/research/:id
// ----------------------------------------------------------------------------
async function deleteResearch(req, res, next) {
  try {
    const { id } = req.params;
    const [existing] = await pool.query('SELECT created_by FROM research WHERE id = ? LIMIT 1', [id]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'Research not found' });
    if (!(await canManageResearch(req, existing[0].created_by))) {
      return res.status(403).json({ success: false, message: 'You do not have permission to delete this research' });
    }

    await pool.query('DELETE FROM research WHERE id = ?', [id]);
    await logActivity(pool, req.user.id, `Deleted research #${id}`, 'research', id);

    return res.json({ success: true, message: 'Research deleted successfully' });
  } catch (err) {
    next(err);
  }
}

// ----------------------------------------------------------------------------
// PATCH /api/research/:id/pdf
// ----------------------------------------------------------------------------
async function uploadPdf(req, res, next) {
  try {
    const { id } = req.params;
    const [existing] = await pool.query('SELECT created_by FROM research WHERE id = ? LIMIT 1', [id]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'Research not found' });
    if (!(await canManageResearch(req, existing[0].created_by))) {
      return res.status(403).json({ success: false, message: 'You do not have permission to edit this research' });
    }
    if (!req.file) return res.status(400).json({ success: false, message: 'No PDF file uploaded' });

    const pdfPath = `/uploads/research/${req.file.filename}`;
    await pool.query('UPDATE research SET pdf_file = ? WHERE id = ?', [pdfPath, id]);

    return res.json({ success: true, message: 'PDF uploaded successfully', data: { pdfFile: pdfPath } });
  } catch (err) {
    next(err);
  }
}

// ----------------------------------------------------------------------------
// Patents
// ----------------------------------------------------------------------------
async function createPatent(req, res, next) {
  try {
    const { researchId, title, patentNumber, filingDate, status } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Patent title is required' });

    if (researchId) {
      const [research] = await pool.query('SELECT created_by FROM research WHERE id = ? LIMIT 1', [researchId]);
      if (research.length === 0) return res.status(404).json({ success: false, message: 'Linked research not found' });
      if (!(await canManageResearch(req, research[0].created_by))) {
        return res.status(403).json({ success: false, message: 'You do not have permission to attach a patent to this research' });
      }
    } else if (!MANAGER_ROLES.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Only admins can create a standalone patent record' });
    }

    const [result] = await pool.query(
      `INSERT INTO patents (research_id, title, patent_number, filing_date, status) VALUES (?, ?, ?, ?, ?)`,
      [researchId || null, title, patentNumber || null, filingDate || null, status || 'pending']
    );
    return res.status(201).json({ success: true, message: 'Patent created successfully', data: { id: result.insertId } });
  } catch (err) {
    next(err);
  }
}

async function listPatents(req, res, next) {
  try {
    const { status } = req.query;
    const { page, limit, offset } = getPagination(req);
    const where = [];
    const params = [];
    if (status) {
      where.push('p.status = ?');
      params.push(status);
    }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const [rows] = await pool.query(
      `SELECT p.*, r.title AS research_title FROM patents p LEFT JOIN research r ON r.id = p.research_id
       ${whereSql} ORDER BY p.created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM patents p ${whereSql}`, params);
    return res.json({ success: true, data: { patents: rows, page, limit, total } });
  } catch (err) {
    next(err);
  }
}

async function updatePatent(req, res, next) {
  try {
    const { id } = req.params;
    if (!MANAGER_ROLES.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Only admins can update patent records' });
    }
    const { title, patentNumber, filingDate, status } = req.body;
    const fields = [];
    const params = [];
    const map = { title, patent_number: patentNumber, filing_date: filingDate, status };
    for (const [col, val] of Object.entries(map)) {
      if (val !== undefined) {
        fields.push(`${col} = ?`);
        params.push(val);
      }
    }
    if (fields.length === 0) return res.status(400).json({ success: false, message: 'No fields to update' });
    params.push(id);
    await pool.query(`UPDATE patents SET ${fields.join(', ')} WHERE id = ?`, params);
    return res.json({ success: true, message: 'Patent updated successfully' });
  } catch (err) {
    next(err);
  }
}

async function deletePatent(req, res, next) {
  try {
    if (!MANAGER_ROLES.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Only admins can delete patent records' });
    }
    await pool.query('DELETE FROM patents WHERE id = ?', [req.params.id]);
    return res.json({ success: true, message: 'Patent deleted successfully' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createResearch,
  listResearch,
  getResearch,
  updateResearch,
  deleteResearch,
  uploadPdf,
  addResearchMentor,
  uploadResearchDocument,
  downloadResearchDocument,
  createPatent,
  listPatents,
  updatePatent,
  deletePatent,
};
