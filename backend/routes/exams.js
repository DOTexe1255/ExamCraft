const express = require('express');
const connectToMySQL = require('../db');
const authMiddleware = require('./authMiddleware');

const router = express.Router();

// ====================== GET ALL EXAMS ======================
// GET /api/exams
// Students: returns exams assigned to them
// Department admins: returns exams they created
router.get('/', authMiddleware, async (req, res) => {
  const { user_id, role, department_id } = req.user;
  let conn;
  try {
    conn = await connectToMySQL();
    let rows;

    if (role === 'student') {
      [rows] = await conn.execute(
        `SELECT e.exam_id, e.title, e.description, e.start_datetime,
                e.duration_minutes, e.total_marks, e.status, ea.assignment_id,
                (SELECT COUNT(*) FROM exam_attempts at2
                  WHERE at2.student_id = ? AND at2.exam_id = e.exam_id
                  AND at2.is_submitted = 1) AS completed
         FROM exam_assignments ea
         JOIN exams e ON ea.exam_id = e.exam_id
         WHERE ea.student_id = ?
         ORDER BY e.start_datetime DESC`,
        [user_id, user_id]
      );
    } else if (role === 'department') {
      [rows] = await conn.execute(
        `SELECT exam_id, title, description, start_datetime,
                duration_minutes, total_marks, status, created_by
         FROM exams
         WHERE department_id = ?
         ORDER BY created_at DESC`,
        [department_id]
      );
    } else if (role === 'institute') {
      const { institute_id } = req.user;
      [rows] = await conn.execute(
        `SELECT e.exam_id, e.title, e.description, e.start_datetime,
                e.duration_minutes, e.total_marks, e.status, e.department_id,
                d.name AS department_name
         FROM exams e
         LEFT JOIN departments d ON e.department_id = d.department_id
         WHERE e.institute_id = ?
         ORDER BY e.created_at DESC`,
        [institute_id]
      );
    } else {
      await conn.end();
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    await conn.end();
    return res.status(200).json({ exams: rows });
  } catch (err) {
    if (conn) await conn.end();
    console.error('Get exams error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// ====================== CREATE EXAM ======================
// POST /api/exams
// Department admin only
router.post('/', authMiddleware, async (req, res) => {
  const { role, user_id, institute_id, department_id } = req.user;

  if (role !== 'department') {
    return res.status(403).json({ message: 'Only department admins can create exams' });
  }

  const {
    title,
    description,
    duration,
    total_marks,
    start_date,
    end_date,
    is_active
  } = req.body;

  if (!title || !duration || !total_marks || !start_date) {
    return res.status(400).json({
      message: 'title, duration, total_marks, and start_date are required'
    });
  }

  let conn;
  try {
    conn = await connectToMySQL();
    const status = is_active ? 'scheduled' : 'draft';

    const [result] = await conn.execute(
      `INSERT INTO exams
        (institute_id, department_id, title, description, start_datetime,
         duration_minutes, total_marks, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        institute_id,
        department_id,
        title,
        description || null,
        start_date,
        duration,
        total_marks,
        status,
        user_id
      ]
    );

    await conn.end();
    return res.status(201).json({
      message: 'Exam created successfully',
      exam_id: result.insertId
    });
  } catch (err) {
    if (conn) await conn.end();
    console.error('Create exam error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// ====================== GET EXAM BY ID ======================
// GET /api/exams/:examId
// Returns exam details with questions
router.get('/:examId', authMiddleware, async (req, res) => {
  const { examId } = req.params;
  const { user_id, role } = req.user;

  let conn;
  try {
    conn = await connectToMySQL();

    // Students must be assigned to the exam
    if (role === 'student') {
      const [assigned] = await conn.execute(
        'SELECT assignment_id FROM exam_assignments WHERE exam_id = ? AND student_id = ?',
        [examId, user_id]
      );
      if (assigned.length === 0) {
        await conn.end();
        return res.status(403).json({ message: 'You are not assigned to this exam' });
      }
    }

    const [examRows] = await conn.execute(
      `SELECT exam_id, title, description, duration_minutes, total_marks,
              status, instructions, start_datetime
       FROM exams WHERE exam_id = ?`,
      [examId]
    );

    if (examRows.length === 0) {
      await conn.end();
      return res.status(404).json({ message: 'Exam not found' });
    }

    const [questions] = await conn.execute(
      `SELECT question_id, question_text, options, max_marks, order_sequence
       FROM questions WHERE exam_id = ? ORDER BY order_sequence`,
      [examId]
    );

    await conn.end();

    const exam = examRows[0];
    exam.questions = questions.map((q) => ({
      ...q,
      options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
    }));

    return res.status(200).json({ exam });
  } catch (err) {
    if (conn) await conn.end();
    console.error('Get exam error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// ====================== SUBMIT EXAM ======================
// POST /api/exams/:examId/submit
// Student submits answers for an exam
router.post('/:examId/submit', authMiddleware, async (req, res) => {
  const { examId } = req.params;
  const { user_id } = req.user;
  const { answers } = req.body;

  let conn;
  try {
    conn = await connectToMySQL();

    // Verify student assignment
    const [assigned] = await conn.execute(
      'SELECT assignment_id FROM exam_assignments WHERE exam_id = ? AND student_id = ?',
      [examId, user_id]
    );
    if (assigned.length === 0) {
      await conn.end();
      return res.status(403).json({ message: 'You are not assigned to this exam' });
    }

    // Check for existing submitted attempt
    const [existing] = await conn.execute(
      'SELECT attempt_id FROM exam_attempts WHERE exam_id = ? AND student_id = ? AND is_submitted = 1',
      [examId, user_id]
    );
    if (existing.length > 0) {
      await conn.end();
      return res.status(409).json({ message: 'Exam already submitted' });
    }

    const assignment_id = assigned[0].assignment_id;

    const [examRows] = await conn.execute(
      'SELECT total_marks FROM exams WHERE exam_id = ?',
      [examId]
    );
    if (examRows.length === 0) {
      await conn.end();
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Create attempt record
    const [attemptResult] = await conn.execute(
      `INSERT INTO exam_attempts
        (assignment_id, student_id, exam_id, started_at, completed_at,
         total_marks, is_submitted)
       VALUES (?, ?, ?, NOW(), NOW(), ?, 1)`,
      [assignment_id, user_id, examId, examRows[0].total_marks]
    );
    const attempt_id = attemptResult.insertId;

    // Save each answer and compute marks
    if (answers && typeof answers === 'object') {
      for (const [question_id, selected_answer] of Object.entries(answers)) {
        const [questionRows] = await conn.execute(
          'SELECT correct_answer, max_marks FROM questions WHERE question_id = ?',
          [question_id]
        );

        let marks_obtained = 0;
        if (questionRows.length > 0) {
          const correctAnswer =
            typeof questionRows[0].correct_answer === 'string'
              ? JSON.parse(questionRows[0].correct_answer)
              : questionRows[0].correct_answer;

          // Check if selected_answer matches the correct option text
          if (
            Array.isArray(correctAnswer) &&
            correctAnswer.length > 0 &&
            correctAnswer[0].option === selected_answer
          ) {
            marks_obtained = questionRows[0].max_marks;
          }
        }

        await conn.execute(
          `INSERT INTO student_answers
            (attempt_id, question_id, selected_answer, marks_obtained)
           VALUES (?, ?, ?, ?)`,
          [attempt_id, question_id, JSON.stringify(selected_answer), marks_obtained]
        );
      }
    }

    // Compute and persist total score
    const [scoreResult] = await conn.execute(
      'SELECT SUM(marks_obtained) AS total_score FROM student_answers WHERE attempt_id = ?',
      [attempt_id]
    );
    const total_score = scoreResult[0].total_score || 0;

    await conn.execute(
      'UPDATE exam_attempts SET total_score = ? WHERE attempt_id = ?',
      [total_score, attempt_id]
    );

    await conn.end();
    return res.status(200).json({
      message: 'Exam submitted successfully',
      attempt_id,
      total_score
    });
  } catch (err) {
    if (conn) await conn.end();
    console.error('Submit exam error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
