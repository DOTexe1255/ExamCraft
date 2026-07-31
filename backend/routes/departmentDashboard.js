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

router.get('/students', authMiddleware, requireDepartment, async (req, res) => {
  let conn;
  try {
    conn = await connectToMySQL();
    const [students] = await conn.execute(`SELECT user_id, first_name, last_name, email, phone, is_active, created_at FROM users WHERE department_id = ? AND role = 'student' ORDER BY first_name, last_name`, [req.user.department_id]);
    return res.json({ students });
  } catch (error) { return res.status(500).json({ message: 'Could not load students', error: error.message }); }
  finally { if (conn) conn.release(); }
});

router.patch('/students/:studentId/access', authMiddleware, requireDepartment, async (req, res) => {
  const isActive = req.body?.is_active;
  if (typeof isActive !== 'boolean') return res.status(400).json({ message: 'is_active must be true or false' });
  let conn;
  try {
    conn = await connectToMySQL();
    const [result] = await conn.execute('UPDATE users SET is_active = ? WHERE user_id = ? AND department_id = ? AND role = \'student\'', [isActive, Number(req.params.studentId), req.user.department_id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Student not found in this department' });
    await conn.execute('INSERT INTO audit_logs (user_id, action, table_name, record_id, new_values) VALUES (?, ?, ?, ?, ?)', [req.user.user_id, isActive ? 'STUDENT_ACCESS_UNFROZEN' : 'STUDENT_ACCESS_FROZEN', 'users', Number(req.params.studentId), JSON.stringify({ is_active: isActive })]);
    return res.json({ message: `Student access ${isActive ? 'unfrozen' : 'frozen'} successfully`, is_active: isActive });
  } catch (error) { return res.status(500).json({ message: 'Could not update student access', error: error.message }); }
  finally { if (conn) conn.release(); }
});
module.exports = router;
