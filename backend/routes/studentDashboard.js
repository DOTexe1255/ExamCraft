const express = require('express');
const connectToMySQL = require('../db');
const authMiddleware = require('./authMiddleware');

const router = express.Router();
const requireStudent = (req, res, next) => req.user.role === 'student' ? next() : res.status(403).json({ message: 'Student access is required' });

router.get('/', authMiddleware, requireStudent, async (req, res) => {
  let conn;
  try {
    conn = await connectToMySQL();
    const studentId = req.user.user_id;
    const [exams] = await conn.execute(`SELECT
    e.exam_id,
    e.title,
    e.description,
    e.start_datetime,
    COALESCE(e.end_datetime, DATE_ADD(e.start_datetime, INTERVAL e.duration_minutes MINUTE)) AS end_datetime,
    e.duration_minutes,
    e.total_marks,
    e.status,

    ea.assignment_id,
    ea.assigned_at,
    CASE
      WHEN at.auto_submitted = 1 THEN 'AUTO_SUBMITTED'
      WHEN at.is_submitted = 1 OR at.completed_at IS NOT NULL THEN 'SUBMITTED'
      ELSE 'ENROLLED'
    END AS assignment_status,

    TRUE AS allow_late_join,
    NULL AS late_join_until,

    at.started_at,
    at.completed_at AS submitted_at,
    at.is_submitted,
    NULL AS remaining_seconds,
    COALESCE(at.auto_submitted, FALSE) AS auto_submitted

FROM exam_assignments ea

JOIN exams e
ON e.exam_id = ea.exam_id

LEFT JOIN exam_attempts at
ON at.exam_id = e.exam_id
AND at.student_id = ea.student_id

WHERE ea.student_id = ?
AND e.status IN ('active','scheduled')

ORDER BY e.start_datetime ASC;`, [studentId]);
    const [[summary]] = await conn.execute(`SELECT COUNT(*) AS available_count, SUM(CASE WHEN e.status = 'active' THEN 1 ELSE 0 END) AS active_count, SUM(CASE WHEN e.status = 'scheduled' THEN 1 ELSE 0 END) AS scheduled_count FROM exam_assignments ea JOIN exams e ON e.exam_id = ea.exam_id WHERE ea.student_id = ? AND e.status IN ('active', 'scheduled')`, [studentId]);
    return res.json({ summary, exams });
  } catch (error) {
    console.error('Student dashboard error:', error);
    return res.status(500).json({ message: 'Could not load student dashboard', error: error.message });
  }
  finally { if (conn) conn.release(); }
});
module.exports = router;
