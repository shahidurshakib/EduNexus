const { Parser: CsvParser } = require('json2csv');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const { pool } = require('../config/db');

const REPORT_QUERIES = {
  startups: `SELECT id, name, industry, domain, current_stage, status, funding_needed, location, created_at FROM startups ORDER BY created_at DESC`,
  research: `SELECT id, title, department, supervisor, publication_status, patent_status, created_at FROM research ORDER BY created_at DESC`,
  funding: `SELECT fr.id, s.name AS startup, fr.round_type, fr.amount, fr.funding_date, u.full_name AS investor
            FROM funding_rounds fr JOIN startups s ON s.id = fr.startup_id
            LEFT JOIN investors i ON i.id = fr.investor_id LEFT JOIN users u ON u.id = i.user_id
            ORDER BY fr.funding_date DESC`,
  mentors: `SELECT m.id, u.full_name, u.email, m.expertise, m.is_public, m.created_at
            FROM mentors m JOIN users u ON u.id = m.user_id ORDER BY m.created_at DESC`,
  investors: `SELECT i.id, u.full_name, u.email, i.investment_focus, i.min_ticket_size, i.max_ticket_size, i.created_at
              FROM investors i JOIN users u ON u.id = i.user_id ORDER BY i.created_at DESC`,
};

const REPORT_TITLES = {
  startups: 'Startup Report',
  research: 'Research Report',
  funding: 'Funding Report',
  mentors: 'Mentor Report',
  investors: 'Investor Report',
};

// GET /api/reports/:type  (founder, admin) — JSON report data (for on-screen viewing)
async function generateReport(req, res, next) {
  try {
    const { type } = req.params;
    if (!REPORT_QUERIES[type]) {
      return res.status(400).json({ success: false, message: `type must be one of ${Object.keys(REPORT_QUERIES).join(', ')}` });
    }
    const [rows] = await pool.query(REPORT_QUERIES[type]);
    return res.json({ success: true, data: { type, title: REPORT_TITLES[type], generatedAt: new Date().toISOString(), rows } });
  } catch (err) {
    next(err);
  }
}

// GET /api/reports/:type/export?format=csv|xlsx|pdf  (founder, admin)
async function exportReport(req, res, next) {
  try {
    const { type } = req.params;
    const { format = 'csv' } = req.query;
    if (!REPORT_QUERIES[type]) {
      return res.status(400).json({ success: false, message: `type must be one of ${Object.keys(REPORT_QUERIES).join(', ')}` });
    }
    const [rows] = await pool.query(REPORT_QUERIES[type]);
    const title = REPORT_TITLES[type];
    const filenameBase = `edunexus-${type}-report-${new Date().toISOString().slice(0, 10)}`;

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'No data available to export for this report' });
    }

    if (format === 'csv') {
      const parser = new CsvParser({ fields: Object.keys(rows[0]) });
      const csv = parser.parse(rows);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filenameBase}.csv"`);
      return res.send(csv);
    }

    if (format === 'xlsx') {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet(title);
      sheet.columns = Object.keys(rows[0]).map((key) => ({ header: key, key, width: 22 }));
      sheet.getRow(1).font = { bold: true };
      rows.forEach((r) => sheet.addRow(r));

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filenameBase}.xlsx"`);
      await workbook.xlsx.write(res);
      return res.end();
    }

    if (format === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filenameBase}.pdf"`);

      const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });
      doc.pipe(res);

      doc.fontSize(16).text(`EduNexus — ${title}`, { align: 'center' });
      doc.fontSize(9).fillColor('#666').text(`Generated ${new Date().toLocaleString()}`, { align: 'center' });
      doc.moveDown();

      const columns = Object.keys(rows[0]);
      const colWidth = (doc.page.width - 60) / columns.length;
      let y = doc.y;

      doc.fontSize(9).fillColor('#000');
      columns.forEach((col, i) => doc.text(col, 30 + i * colWidth, y, { width: colWidth, ellipsis: true }));
      y += 16;
      doc.moveTo(30, y).lineTo(doc.page.width - 30, y).stroke();
      y += 4;

      rows.forEach((row) => {
        if (y > doc.page.height - 50) {
          doc.addPage();
          y = 40;
        }
        columns.forEach((col, i) => {
          const val = row[col] === null || row[col] === undefined ? '' : String(row[col]);
          doc.text(val, 30 + i * colWidth, y, { width: colWidth, ellipsis: true });
        });
        y += 16;
      });

      doc.end();
      return;
    }

    return res.status(400).json({ success: false, message: 'format must be csv, xlsx, or pdf' });
  } catch (err) {
    next(err);
  }
}

module.exports = { generateReport, exportReport };
