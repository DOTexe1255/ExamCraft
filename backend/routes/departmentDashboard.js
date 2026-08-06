const express = require('express');
const connectToMySQL = require('../db');
const authMiddleware = require('./authMiddleware');

const router = express.Router();
const requireDepartment = (req, res, next) => req.user.role === 'department' ? next() : res.status(403).json({ message: 'Department administrator access is required' });
const getTableColumns = async (conn, tableName) => {
  const [rows] = await conn.execute(
    'SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?',
    [tableName]
  );
  return new Set(rows.map((row) => row.COLUMN_NAME));
};

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

router.get('/live-exams', authMiddleware, async (req, res) => {

    let conn;

    try {

        conn = await connectToMySQL();

        const departmentId = req.user.department_id;
        const attemptColumns = await getTableColumns(conn, 'exam_attempts');
        const submitted = attemptColumns.has('is_submitted') ? 'COALESCE(at.is_submitted, 0)' : '0';
        const autoSubmitted = attemptColumns.has('auto_submitted') ? 'COALESCE(at.auto_submitted, 0)' : '0';

        const [rows] = await conn.execute(`

            SELECT

                e.exam_id,

                e.title,

                e.start_datetime,

                e.end_datetime,

                COUNT(DISTINCT ea.student_id) AS enrolled,

                SUM(CASE WHEN at.attempt_id IS NOT NULL AND ${submitted} = 0 THEN 1 ELSE 0 END) AS started,

                SUM(CASE WHEN ${submitted} = 1 AND ${autoSubmitted} = 0 THEN 1 ELSE 0 END) AS submitted,

                SUM(CASE WHEN ${autoSubmitted} = 1 THEN 1 ELSE 0 END) AS auto_submitted,

                SUM(CASE WHEN at.attempt_id IS NULL THEN 1 ELSE 0 END) AS not_started

            FROM exams e

            JOIN exam_assignments ea
            ON ea.exam_id=e.exam_id

            LEFT JOIN exam_attempts at
            ON at.exam_id = ea.exam_id AND at.student_id = ea.student_id

            WHERE e.department_id=?

            GROUP BY e.exam_id

            ORDER BY e.start_datetime DESC

        `,[departmentId]);

        return res.json(rows);

    }

    catch(error){

        return res.status(500).json({

            message:error.message

        });

    }

    finally{

        if(conn) conn.release();

    }

});

router.get('/exams/:examId/live', authMiddleware, async (req, res) => {

    let conn;

    try {

        conn = await connectToMySQL();

        const examId = Number(req.params.examId);
        const attemptColumns = await getTableColumns(conn, 'exam_attempts');
        const attemptField = (name, fallback = 'NULL') => attemptColumns.has(name) ? `at.${name}` : fallback;
        const submitted = attemptColumns.has('is_submitted') ? 'COALESCE(at.is_submitted, 0)' : '0';
        const autoSubmitted = attemptColumns.has('auto_submitted') ? 'COALESCE(at.auto_submitted, 0)' : '0';

        const [students] = await conn.execute(`

            SELECT

                u.user_id,

                TRIM(CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, ''))) AS full_name,

                u.email,

                CASE
                  WHEN at.attempt_id IS NULL THEN 'ENROLLED'
                  WHEN ${autoSubmitted} = 1 THEN 'AUTO_SUBMITTED'
                  WHEN ${submitted} = 1 THEN 'SUBMITTED'
                  ELSE 'STARTED'
                END AS assignment_status,

                at.started_at,

                at.completed_at,

                ${attemptField('current_question', '0')} AS current_question,

                ${attemptField('remaining_seconds', 'NULL')} AS remaining_seconds,

                ${attemptField('last_activity')} AS last_activity_at,

                COALESCE(${attemptField('tab_switches', '0')}, 0) AS tab_switch_count,

                ${attemptField('fullscreen_exit_count', '0')} AS fullscreen_exit_count,

                (SELECT COUNT(*) FROM audit_logs al WHERE al.record_id = at.attempt_id AND al.table_name = 'exam_attempts' AND al.action IN ('EXAM_VIOLATION_COPY', 'EXAM_VIOLATION_CUT', 'EXAM_VIOLATION_PASTE')) AS copy_attempt_count,

                (SELECT COUNT(*) FROM audit_logs al WHERE al.record_id = at.attempt_id AND al.table_name = 'exam_attempts' AND al.action = 'EXAM_VIOLATION_DEVTOOLS') AS devtools_attempt_count,

                (SELECT COUNT(*) FROM audit_logs al WHERE al.record_id = at.attempt_id AND al.table_name = 'exam_attempts' AND al.action = 'EXAM_VIOLATION_IDLE') AS idle_warning_count,

                at.total_score,

                ${submitted} AS is_submitted

            FROM exam_assignments ea

            JOIN users u
            ON u.user_id = ea.student_id

            LEFT JOIN exam_attempts at
            ON at.exam_id = ea.exam_id
            AND at.student_id = ea.student_id

            WHERE ea.exam_id = ?

            ORDER BY u.first_name, u.last_name

        `,[examId]);

        return res.json({

            success:true,

            students

        });

    }

    catch(error){

        return res.status(500).json({

            success:false,

            message:error.message

        });

    }

    finally{

        if(conn)
            conn.release();

    }

});

router.post('/exams/:examId/students/:studentId/force-submit', authMiddleware, requireDepartment, async (req, res) => {
  let conn;
  try {
    conn = await connectToMySQL();
    const examId = Number(req.params.examId);
    const studentId = Number(req.params.studentId);
    const attemptColumns = await getTableColumns(conn, 'exam_attempts');
    const [[assignment]] = await conn.execute(
      `SELECT ea.assignment_id, at.attempt_id
       FROM exam_assignments ea
       JOIN exams e ON e.exam_id = ea.exam_id
       LEFT JOIN exam_attempts at ON at.exam_id = ea.exam_id AND at.student_id = ea.student_id AND at.is_submitted = 0
       WHERE ea.exam_id = ? AND ea.student_id = ? AND e.department_id = ? LIMIT 1`,
      [examId, studentId, req.user.department_id]
    );
    if (!assignment?.attempt_id) return res.status(404).json({ message: 'An active attempt was not found for this student.' });

    const submissionUpdates = ['is_submitted = 1'];
    if (attemptColumns.has('auto_submitted')) submissionUpdates.push('auto_submitted = 1');
    if (attemptColumns.has('completed_at')) submissionUpdates.push('completed_at = NOW()');
    await conn.execute(`UPDATE exam_attempts SET ${submissionUpdates.join(', ')} WHERE attempt_id = ?`, [assignment.attempt_id]);
    await conn.execute('INSERT INTO audit_logs (user_id, action, table_name, record_id, new_values) VALUES (?, ?, ?, ?, ?)', [req.user.user_id, 'EXAM_FORCE_SUBMITTED', 'exam_attempts', assignment.attempt_id, JSON.stringify({ examId, studentId })]);
    return res.json({ success: true, message: 'Exam force-submitted successfully.' });
  } catch (error) { return res.status(500).json({ message: 'Could not force-submit the exam.', error: error.message }); }
  finally { if (conn) conn.release(); }
});
module.exports = router;
