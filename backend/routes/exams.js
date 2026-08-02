const express = require('express');
const connectToMySQL = require('../db');
const authMiddleware = require('./authMiddleware');

const router = express.Router();

const parseBool = (value) => value === true || value === 'true' || value === 1 || value === '1';

const toUtcDateFromLocalInput = (value, timezoneOffsetMinutes) => {
  const [datePart, timePart = '00:00'] = String(value || '').split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute, second = 0] = timePart.split(':').map(Number);

  if (!year || !month || !day || Number.isNaN(hour) || Number.isNaN(minute)) {
    return null;
  }

  const offsetMinutes = Number.isFinite(Number(timezoneOffsetMinutes)) ? Number(timezoneOffsetMinutes) : 0;
  return new Date(Date.UTC(year, month - 1, day, hour, minute, Number(second)) + (offsetMinutes * 60000));
};

const toMysqlUtcString = (date) => date.toISOString().slice(0, 19).replace('T', ' ');

const normalizeJsonArray = (value) => (Array.isArray(value) ? value : []);

router.get('/', authMiddleware, async (req, res) => {
  let conn;

  try {
    conn = await connectToMySQL();

    const baseQuery = `
          SELECT exam_id, institute_id, department_id, title, description, start_datetime,
            duration_minutes, total_marks, max_attempts, status, exam_mode, subject_label,
            domain_label, sections_json, seb_required,
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
    question_bank,
    timezone_offset_minutes,
    exam_mode,
    subject_label,
    domain_label,
    sections,
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

  const startDatetime = toUtcDateFromLocalInput(start_date, timezone_offset_minutes);
  if (!startDatetime || Number.isNaN(startDatetime.getTime())) {
    return res.status(400).json({ message: 'Invalid start_date' });
  }

  const status = parseBool(is_active)
    ? (startDatetime <= new Date() ? 'active' : 'scheduled')
    : 'draft';

  const structuredQuestionBank = Array.isArray(question_bank) ? question_bank : [];
  const structuredSections = normalizeJsonArray(sections);
  const resolvedExamMode = exam_mode === 'offline' ? 'offline' : 'online';

  const instructions = [
    question_count ? `Question count: ${question_count}` : null,
    exam_type ? `Exam type: ${exam_type}` : null,
    resolvedExamMode ? `Exam mode: ${resolvedExamMode}` : null,
    subject_label ? `Subject: ${subject_label}` : null,
    domain_label ? `Domain: ${domain_label}` : null,
    passing_marks ? `Passing marks: ${passing_marks}` : null,
    end_date ? `End date: ${end_date}` : null,
    structuredSections.length ? `Sections: ${JSON.stringify(structuredSections)}` : null,
    structuredQuestionBank.length ? `Question bank: ${JSON.stringify(structuredQuestionBank)}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  let conn;

  try {
    conn = await connectToMySQL();

    const [result] = await conn.execute(
      `INSERT INTO exams
        (institute_id, department_id, title, description, start_datetime, duration_minutes,
         total_marks, max_attempts, status, seb_required, seb_quit_password, instructions, created_by,
         exam_mode, subject_label, domain_label, sections_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        resolvedInstituteId,
        resolvedDepartmentId,
        title.trim(),
        description.trim(),
        toMysqlUtcString(startDatetime),
        Number(duration),
        Number(total_marks),
        1,
        status,
        true,
        null,
        instructions || null,
        req.user.user_id,
        resolvedExamMode,
        subject_label ? String(subject_label).trim() : null,
        domain_label ? String(domain_label).trim() : null,
        structuredSections.length ? JSON.stringify(structuredSections) : null,
      ]
    );

    if (structuredQuestionBank.length) {
      await conn.execute(
        `INSERT INTO question_bank_groups
          (institute_id, department_id, group_name, description, questions_json, question_count,
           created_by, subject_label, domain_label, source_exam_id, source_type, exam_mode, sections_json)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          resolvedInstituteId,
          resolvedDepartmentId,
          `${title.trim()} - Auto Bank`,
          description.trim(),
          JSON.stringify(structuredQuestionBank),
          structuredQuestionBank.length,
          req.user.user_id,
          subject_label ? String(subject_label).trim() : null,
          domain_label ? String(domain_label).trim() : null,
          result.insertId,
          'exam',
          resolvedExamMode,
          structuredSections.length ? JSON.stringify(structuredSections) : null,
        ]
      );
    }

    return res.status(201).json({
      message: 'Exam created successfully',
      exam_id: result.insertId,
      exam: {
        exam_id: result.insertId,
        institute_id: resolvedInstituteId,
        department_id: resolvedDepartmentId,
        title: title.trim(),
        description: description.trim(),
        start_datetime: startDatetime.toISOString(),
        duration_minutes: Number(duration),
        total_marks: Number(total_marks),
        status,
        exam_mode: resolvedExamMode,
        subject_label: subject_label ? String(subject_label).trim() : null,
        domain_label: domain_label ? String(domain_label).trim() : null,
        sections: structuredSections,
        instructions: instructions || null,
        question_bank: structuredQuestionBank,
      },
    });
  } catch (err) {
    console.error('Create exam error:', err);
    return res.status(500).json({ message: 'Database error', error: err.message });
  } finally {
    if (conn) conn.release();
  }
});

router.patch('/:examId', authMiddleware, async (req, res) => {
  const {
    title,
    description,
    start_date,
    timezone_offset_minutes,
    exam_mode,
    subject_label,
    domain_label,
    sections,
    status,
  } = req.body;

  const examId = Number(req.params.examId);
  if (!examId) {
    return res.status(400).json({ message: 'Invalid exam id' });
  }

  let conn;

  try {
    conn = await connectToMySQL();

    const updates = [];
    const params = [];

    if (typeof title === 'string') {
      updates.push('title = ?');
      params.push(title.trim());
    }

    if (typeof description === 'string') {
      updates.push('description = ?');
      params.push(description.trim());
    }

    if (typeof start_date === 'string' && start_date.trim()) {
      const rescheduledDate = toUtcDateFromLocalInput(start_date, timezone_offset_minutes);
      if (!rescheduledDate || Number.isNaN(rescheduledDate.getTime())) {
        return res.status(400).json({ message: 'Invalid start_date' });
      }

      updates.push('start_datetime = ?');
      params.push(toMysqlUtcString(rescheduledDate));

      if (!status) {
        updates.push('status = ?');
        params.push(rescheduledDate <= new Date() ? 'active' : 'scheduled');
      }
    }

    if (typeof exam_mode === 'string') {
      updates.push('exam_mode = ?');
      params.push(exam_mode === 'offline' ? 'offline' : 'online');
    }

    if (typeof subject_label === 'string') {
      updates.push('subject_label = ?');
      params.push(subject_label.trim() || null);
    }

    if (typeof domain_label === 'string') {
      updates.push('domain_label = ?');
      params.push(domain_label.trim() || null);
    }

    if (Array.isArray(sections)) {
      updates.push('sections_json = ?');
      params.push(sections.length ? JSON.stringify(sections) : null);
    }

    if (typeof status === 'string' && ['draft', 'scheduled', 'active', 'completed', 'cancelled'].includes(status)) {
      updates.push('status = ?');
      params.push(status);
    }

    if (!updates.length) {
      return res.status(400).json({ message: 'No update fields provided' });
    }

    params.push(examId);

    await conn.execute(`UPDATE exams SET ${updates.join(', ')} WHERE exam_id = ?`, params);

    const [rows] = await conn.execute(
      'SELECT exam_id, institute_id, department_id, title, description, start_datetime, duration_minutes, total_marks, max_attempts, status, exam_mode, subject_label, domain_label, sections_json, instructions, created_by, created_at FROM exams WHERE exam_id = ?',
      [examId]
    );

    const exam = rows[0];

    return res.json({
      message: 'Exam updated successfully',
      exam: {
        ...exam,
        sections: normalizeJsonArray(exam.sections_json),
      },
    });
  } catch (error) {
    console.error('Update exam error:', error);
    return res.status(500).json({ message: 'Database error', error: error.message });
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
