const express = require('express');
const connectToMySQL = require('../db');
const authMiddleware = require('./authMiddleware');

const router = express.Router();

const parseBool = (value) => value === true || value === 'true' || value === 1 || value === '1';

router.get('/', authMiddleware, async (req, res) => {
  let conn;

  try {
    conn = await connectToMySQL();

    const baseQuery = `
      SELECT exam_id, institute_id, department_id, title, description, start_datetime,
             duration_minutes, total_marks, max_attempts, status, seb_required,
             seb_quit_password, instructions, created_by, created_at
      FROM exams
    `;

    let query = baseQuery;
    const params = [];

    if (req.user.role === 'department') {
      query += ' WHERE department_id = ?';
      params.push(req.user.department_id);
    } else {
      query += ' WHERE institute_id = ?';
      params.push(req.user.institute_id);
    }

    query += ' ORDER BY start_datetime DESC, created_at DESC';

    const [rows] = await conn.execute(query, params);

    return res.json({ exams: rows });
  } catch (err) {
    console.error('List exams error:', err);
    return res.status(500).json({ message: 'Database error', error: err.message });
  } finally {
    if (conn) conn.release();
  }
});

router.post('/', authMiddleware, async (req, res) => {
  const {
    title,
    description,
    duration,
    total_marks,
    start_date,
    institute_id,
    department_id,
    question_count,
    exam_type,
    is_active,
    passing_marks,
    end_date,
  } = req.body;

  if (!title || !description || !duration || !total_marks || !start_date) {
    return res.status(400).json({
      message: 'title, description, duration, total_marks, and start_date are required',
    });
  }

  const resolvedInstituteId = Number(req.user.institute_id || institute_id);
  const resolvedDepartmentId = Number(
    req.user.role === 'department' ? req.user.department_id : department_id
  );

  if (!resolvedInstituteId || !resolvedDepartmentId) {
    return res.status(400).json({
      message: 'institute_id and department_id are required for exam creation',
    });
  }

  const startDatetime = new Date(start_date);
  if (Number.isNaN(startDatetime.getTime())) {
    return res.status(400).json({ message: 'Invalid start_date' });
  }

  const status = parseBool(is_active)
    ? (startDatetime <= new Date() ? 'active' : 'scheduled')
    : 'draft';

  const instructions = [
    question_count ? `Question count: ${question_count}` : null,
    exam_type ? `Exam type: ${exam_type}` : null,
    passing_marks ? `Passing marks: ${passing_marks}` : null,
    end_date ? `End date: ${end_date}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  let conn;

  try {
    conn = await connectToMySQL();

    const [result] = await conn.execute(
      `INSERT INTO exams
        (institute_id, department_id, title, description, start_datetime, duration_minutes,
         total_marks, max_attempts, status, seb_required, seb_quit_password, instructions, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        resolvedInstituteId,
        resolvedDepartmentId,
        title.trim(),
        description.trim(),
        startDatetime,
        Number(duration),
        Number(total_marks),
        1,
        status,
        true,
        null,
        instructions || null,
        req.user.user_id,
      ]
    );

    return res.status(201).json({
      message: 'Exam created successfully',
      exam_id: result.insertId,
      exam: {
        exam_id: result.insertId,
        institute_id: resolvedInstituteId,
        department_id: resolvedDepartmentId,
        title: title.trim(),
        description: description.trim(),
        start_datetime: startDatetime,
        duration_minutes: Number(duration),
        total_marks: Number(total_marks),
        status,
        instructions: instructions || null,
      },
    });
  } catch (err) {
    console.error('Create exam error:', err);
    return res.status(500).json({ message: 'Database error', error: err.message });
  } finally {
    if (conn) conn.release();
  }
});

router.get('/:examId/report', authMiddleware, async (req, res) => {
  let conn;
  try {
    conn = await connectToMySQL();
    const [examRows] = await conn.execute('SELECT exam_id, department_id, title, status FROM exams WHERE exam_id = ? AND institute_id = ?', [Number(req.params.examId), req.user.institute_id]);
    const exam = examRows[0];
    if (!exam || (req.user.role === 'department' && Number(exam.department_id) !== Number(req.user.department_id))) return res.status(404).json({ message: 'Exam not found' });
    if (exam.status !== 'completed') return res.status(409).json({ message: 'Exam report is available after the exam is completed' });
    const [rows] = await conn.execute(`SELECT u.first_name, u.last_name, u.email, ea.started_at, ea.completed_at, ea.total_score, ea.total_marks, ea.is_submitted FROM exam_assignments ass JOIN users u ON u.user_id = ass.student_id LEFT JOIN exam_attempts ea ON ea.assignment_id = ass.assignment_id WHERE ass.exam_id = ? ORDER BY u.first_name, u.last_name`, [exam.exam_id]);
    const quote = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const csv = ['Student name,Email,Started at,Completed at,Score,Total marks,Submitted', ...rows.map((row) => [`${row.first_name} ${row.last_name}`, row.email, row.started_at, row.completed_at, row.total_score, row.total_marks, row.is_submitted ? 'Yes' : 'No'].map(quote).join(','))].join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8'); res.setHeader('Content-Disposition', `attachment; filename="exam-${exam.exam_id}-report.csv"`); return res.send(csv);
  } catch (error) { return res.status(500).json({ message: 'Could not create exam report', error: error.message }); }
  finally { if (conn) conn.release(); }
});

module.exports = router;
