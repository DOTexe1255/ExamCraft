const express = require('express');
const connectToMySQL = require('../db');
const authMiddleware = require('./authMiddleware');

const router = express.Router();

const requireInstituteAdmin = (req, res, next) => {
  if (req.user.role !== 'institute') return res.status(403).json({ message: 'Institute administrator access is required' });
  return next();
};

router.get('/', authMiddleware, requireInstituteAdmin, async (req, res) => {
  let conn;
  try {
    conn = await connectToMySQL();
    const instituteId = req.user.institute_id;
    const [departments] = await conn.execute(`
      SELECT d.department_id, d.name, d.code, d.head_email, d.created_at,
        CONCAT(COALESCE(hod.first_name, ''), CASE WHEN hod.user_id IS NULL THEN '' ELSE ' ' END, COALESCE(hod.last_name, '')) AS head_name,
        COUNT(DISTINCT CASE WHEN u.role = 'student' THEN u.user_id END) AS student_count,
        COUNT(DISTINCT CASE WHEN u.role = 'department' THEN u.user_id END) AS faculty_count,
        COUNT(DISTINCT CASE WHEN e.status = 'active' THEN e.exam_id END) AS active_exam_count,
        COUNT(DISTINCT e.exam_id) AS exam_count
      FROM departments d
      LEFT JOIN users hod ON hod.department_id = d.department_id AND hod.role = 'department' AND hod.is_active = 1
      LEFT JOIN users u ON u.department_id = d.department_id AND u.is_active = 1
      LEFT JOIN exams e ON e.department_id = d.department_id
      WHERE d.institute_id = ?
      GROUP BY d.department_id, d.name, d.code, d.head_email, d.created_at, hod.user_id, hod.first_name, hod.last_name
      ORDER BY d.created_at DESC`, [instituteId]);
    const [[summary]] = await conn.execute(`
      SELECT
        (SELECT COUNT(*) FROM users WHERE institute_id = ? AND role = 'student' AND is_active = 1) AS student_count,
        (SELECT COUNT(*) FROM departments WHERE institute_id = ?) AS department_count,
        (SELECT COUNT(*) FROM exams WHERE institute_id = ? AND status = 'active') AS active_exam_count,
        (SELECT COUNT(*) FROM users WHERE institute_id = ? AND role IN ('department', 'institute') AND is_active = 1) AS faculty_count,
        (SELECT COUNT(*) FROM exams WHERE institute_id = ?) AS total_exam_count`, [instituteId, instituteId, instituteId, instituteId, instituteId]);
    const [activity] = await conn.execute(`
      SELECT al.log_id, al.action, al.table_name, al.record_id, al.created_at,
        CONCAT(COALESCE(u.first_name, 'System'), ' ', COALESCE(u.last_name, '')) AS actor
      FROM audit_logs al LEFT JOIN users u ON u.user_id = al.user_id
      WHERE u.institute_id = ? OR al.user_id IS NULL
      ORDER BY al.created_at DESC LIMIT 6`, [instituteId]);
    const [settings] = await conn.execute('SELECT setting_key, setting_value, updated_at FROM institute_settings WHERE institute_id = ?', [instituteId]);
    return res.json({ summary, departments, activity, settings: Object.fromEntries(settings.map((item) => [item.setting_key, item.setting_value])) });
  } catch (err) {
    console.error('Institute dashboard error:', err);
    return res.status(500).json({ message: 'Could not load dashboard data', error: err.message });
  } finally { if (conn) conn.release(); }
});

router.get('/report', authMiddleware, requireInstituteAdmin, async (req, res) => {
  let conn;
  try {
    conn = await connectToMySQL();
    const instituteId = req.user.institute_id;
    const [rows] = await conn.execute(`SELECT d.name AS department, d.code, COUNT(DISTINCT CASE WHEN u.role = 'student' THEN u.user_id END) AS students, COUNT(DISTINCT CASE WHEN u.role = 'department' THEN u.user_id END) AS faculty, COUNT(DISTINCT CASE WHEN e.status = 'active' THEN e.exam_id END) AS active_exams FROM departments d LEFT JOIN users u ON u.department_id = d.department_id AND u.is_active = 1 LEFT JOIN exams e ON e.department_id = d.department_id WHERE d.institute_id = ? GROUP BY d.department_id, d.name, d.code ORDER BY d.name`, [instituteId]);
    const escape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const csv = ['Department,Code,Students,Faculty,Active Exams', ...rows.map((row) => [row.department, row.code, row.students, row.faculty, row.active_exams].map(escape).join(','))].join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="institute-report.csv"');
    return res.send(csv);
  } catch (err) { return res.status(500).json({ message: 'Could not create report', error: err.message }); }
  finally { if (conn) conn.release(); }
});

module.exports = router;
