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

router.get('/live-exams', authMiddleware, async (req, res) => {

    let conn;

    try {

        conn = await connectToMySQL();

        const departmentId = req.user.department_id;

        const [rows] = await conn.execute(`

            SELECT

                e.exam_id,

                e.title,

                e.start_datetime,

                e.end_datetime,

                COUNT(DISTINCT ea.student_id) AS enrolled,

                SUM(
                    CASE
                        WHEN ea.assignment_status='STARTED'
                        THEN 1
                        ELSE 0
                    END
                ) AS started,

                SUM(
                    CASE
                        WHEN ea.assignment_status='SUBMITTED'
                        THEN 1
                        ELSE 0
                    END
                ) AS submitted,

                SUM(
                    CASE
                        WHEN ea.assignment_status='AUTO_SUBMITTED'
                        THEN 1
                        ELSE 0
                    END
                ) AS auto_submitted,

                SUM(
                    CASE
                        WHEN ea.assignment_status='ENROLLED'
                        THEN 1
                        ELSE 0
                    END
                ) AS not_started

            FROM exams e

            JOIN exam_assignments ea
            ON ea.exam_id=e.exam_id

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

        const [students] = await conn.execute(`

            SELECT

                u.user_id,

                u.full_name,

                u.email,

                ea.assignment_status,

                at.started_at,

                at.completed_at,

                at.current_question,

                at.remaining_seconds,

                at.last_activity_at,

                at.tab_switch_count,

                at.fullscreen_exit_count,

                at.total_score,

                at.is_submitted

            FROM exam_assignments ea

            JOIN users u
            ON u.user_id = ea.student_id

            LEFT JOIN exam_attempts at
            ON at.exam_id = ea.exam_id
            AND at.student_id = ea.student_id

            WHERE ea.exam_id = ?

            ORDER BY u.full_name

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
module.exports = router;
