const express = require('express');
const connectToMySQL = require('../db');
const authMiddleware = require('./authMiddleware');

const router = express.Router();
const requireDepartment = (req, res, next) => req.user.role === 'department' ? next() : res.status(403).json({ message: 'Department administrator access is required' });

router.get('/', authMiddleware, requireDepartment, async (req, res) => {
  let conn;
  try {
    conn = await connectToMySQL();
    const departmentId = req.user.department_id;
    const [[summary]] = await conn.execute(`SELECT
      (SELECT COUNT(*) FROM exams WHERE department_id = ?) AS total_exams,
      (SELECT COUNT(*) FROM exams WHERE department_id = ? AND status IN ('active', 'scheduled')) AS live_exams,
      (SELECT COUNT(*) FROM exams WHERE department_id = ? AND status = 'draft') AS draft_exams,
      (SELECT COUNT(*) FROM users WHERE department_id = ? AND role = 'student' AND is_active = 1) AS student_count`, [departmentId, departmentId, departmentId, departmentId]);
    const [students] = await conn.execute(`SELECT user_id, first_name, last_name, email, created_at FROM users WHERE department_id = ? AND role = 'student' AND is_active = 1 ORDER BY created_at DESC LIMIT 5`, [departmentId]);
    return res.json({ summary, students });
  } catch (error) { return res.status(500).json({ message: 'Could not load department dashboard', error: error.message }); }
  finally { if (conn) conn.release(); }
});

router.get('/report', authMiddleware, requireDepartment, async (req, res) => {
  let conn;
  try {
    conn = await connectToMySQL();
    const [rows] = await conn.execute('SELECT title, status, start_datetime, duration_minutes, total_marks FROM exams WHERE department_id = ? ORDER BY start_datetime DESC', [req.user.department_id]);
    const quote = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const csv = ['Title,Status,Start date,Duration (minutes),Total marks', ...rows.map((row) => [row.title, row.status, row.start_datetime, row.duration_minutes, row.total_marks].map(quote).join(','))].join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8'); res.setHeader('Content-Disposition', 'attachment; filename="department-exam-report.csv"'); return res.send(csv);
  } catch (error) { return res.status(500).json({ message: 'Could not create report', error: error.message }); }
  finally { if (conn) conn.release(); }
});
module.exports = router;
