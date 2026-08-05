const express = require('express');
const connectToMySQL = require('../db');
const authMiddleware = require('./authMiddleware');

const router = express.Router();
const tableColumnsCache = new Map();

const getTableColumns = async (conn, tableName) => {
  if (tableColumnsCache.has(tableName)) {
    return tableColumnsCache.get(tableName);
  }

  const [rows] = await conn.execute(
    `SELECT COLUMN_NAME
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
    [tableName]
  );

  const columns = new Set(rows.map((row) => row.COLUMN_NAME));
  tableColumnsCache.set(tableName, columns);
  return columns;
};

const parseBool = (value) => value === true || value === 'true' || value === 1 || value === '1';

const parseJsonArray = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (!value) {
    return [];
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  return [];
};

const extractInstructionNumber = (instructions, label) => {
  const match = String(instructions || '').match(new RegExp(`${label}:\s*([0-9]+)`, 'i'));
  return match ? Number(match[1]) : null;
};

const buildInstructions = ({ questionCount, examType, examMode, subjectLabel, domainLabel, passingMarks, endDate, sections, questionBank }) => [
  questionCount ? `Question count: ${questionCount}` : null,
  examType ? `Exam type: ${examType}` : null,
  examMode ? `Exam mode: ${examMode}` : null,
  subjectLabel ? `Subject: ${subjectLabel}` : null,
  domainLabel ? `Domain: ${domainLabel}` : null,
  passingMarks ? `Passing marks: ${passingMarks}` : null,
  endDate ? `End date: ${endDate}` : null,
  sections.length ? `Sections: ${JSON.stringify(sections)}` : null,
  questionBank.length ? `Question bank: ${JSON.stringify(questionBank)}` : null,
].filter(Boolean).join('\n');

const syncQuestionBankGroup = async (conn, {
  examId,
  instituteId,
  departmentId,
  title,
  description,
  questionBank,
  sections,
  subjectLabel,
  domainLabel,
  examMode,
  createdBy,
}) => {
  const groupColumns = await getTableColumns(conn, 'question_bank_groups');
  const [existingRows] = await conn.execute(
    'SELECT question_bank_group_id FROM question_bank_groups WHERE source_exam_id = ? LIMIT 1',
    [examId]
  );

  const groupName = `${title.trim()} - Auto Bank`;
  const sectionJson = sections.length ? JSON.stringify(sections) : null;
  const questionJson = JSON.stringify(questionBank || []);
  const questionCount = Array.isArray(questionBank) ? questionBank.length : 0;
  const includeSubjectLabel = groupColumns.has('subject_label');
  const includeDomainLabel = groupColumns.has('domain_label');
  const includeExamMode = groupColumns.has('exam_mode');
  const includeSectionsJson = groupColumns.has('sections_json');
  const insertColumns = ['institute_id', 'department_id', 'group_name', 'description', 'questions_json', 'question_count', 'created_by'];
  const insertValues = [instituteId, departmentId, groupName, description ? String(description).trim() : null, questionJson, questionCount, createdBy];

  if (includeSubjectLabel) {
    insertColumns.push('subject_label');
    insertValues.push(subjectLabel ? String(subjectLabel).trim() : null);
  }

  if (includeDomainLabel) {
    insertColumns.push('domain_label');
    insertValues.push(domainLabel ? String(domainLabel).trim() : null);
  }

  insertColumns.push('source_exam_id', 'source_type');
  insertValues.push(examId, 'exam');

  if (includeExamMode) {
    insertColumns.push('exam_mode');
    insertValues.push(examMode);
  }

  if (includeSectionsJson) {
    insertColumns.push('sections_json');
    insertValues.push(sectionJson);
  }

  if (existingRows.length > 0) {
    const updateParts = [
      'group_name = ?',
      'description = ?',
      'questions_json = ?',
      'question_count = ?',
    ];
    const updateValues = [
      groupName,
      description ? String(description).trim() : null,
      questionJson,
      questionCount,
    ];

    if (includeSubjectLabel) {
      updateParts.push('subject_label = ?');
      updateValues.push(subjectLabel ? String(subjectLabel).trim() : null);
    }

    if (includeDomainLabel) {
      updateParts.push('domain_label = ?');
      updateValues.push(domainLabel ? String(domainLabel).trim() : null);
    }

    if (includeExamMode) {
      updateParts.push('exam_mode = ?');
      updateValues.push(examMode);
    }

    if (includeSectionsJson) {
      updateParts.push('sections_json = ?');
      updateValues.push(sectionJson);
    }

    updateParts.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(existingRows[0].question_bank_group_id);

    await conn.execute(
      `UPDATE question_bank_groups
       SET ${updateParts.join(', ')}
       WHERE question_bank_group_id = ?`,
      updateValues
    );

    return existingRows[0].question_bank_group_id;
  }

  if (!questionCount && !sectionJson) {
    return null;
  }

  const [result] = await conn.execute(
    `INSERT INTO question_bank_groups (${insertColumns.join(', ')}) VALUES (${insertColumns.map(() => '?').join(', ')})`,
    insertValues
  );

  return result.insertId;
};

const syncExamAssignments = async (conn, examId, studentIds) => {
  if (!Array.isArray(studentIds)) {
    return;
  }

  const uniqueStudentIds = [...new Set(studentIds.map((value) => Number(value)).filter((value) => Number.isFinite(value) && value > 0))];

  await conn.execute('DELETE FROM exam_assignments WHERE exam_id = ?', [examId]);

  for (const studentId of uniqueStudentIds) {
    await conn.execute('INSERT INTO exam_assignments (exam_id, student_id) VALUES (?, ?)', [examId, studentId]);
  }
};

const fetchExamDetails = async (conn, examId, user) => {
  const examColumns = await getTableColumns(conn, 'exams');
  const selectColumns = [
    'exam_id',
    'institute_id',
    'department_id',
    'title',
    'description',
    'start_datetime',
    'duration_minutes',
    'total_marks',
    'max_attempts',
    'status',
    'instructions',
    'created_by',
    'created_at',
  ];

  if (examColumns.has('exam_mode')) selectColumns.push('exam_mode');
  if (examColumns.has('subject_label')) selectColumns.push('subject_label');
  if (examColumns.has('domain_label')) selectColumns.push('domain_label');
  if (examColumns.has('sections_json')) selectColumns.push('sections_json');

  const [examRows] = await conn.execute(
    `SELECT ${selectColumns.join(', ')} FROM exams WHERE exam_id = ?`,
    [examId]
  );

  const exam = examRows[0];
  if (!exam) {
    return null;
  }

  if (user.role === 'department' && Number(exam.department_id) !== Number(user.department_id)) {
    return null;
  }

  if (Number(exam.institute_id) !== Number(user.institute_id)) {
    return null;
  }

  const [groupRows] = await conn.execute(
    `SELECT question_bank_group_id, questions_json, sections_json, question_count, subject_label, domain_label, exam_mode
     FROM question_bank_groups
     WHERE source_exam_id = ?
     ORDER BY updated_at DESC
     LIMIT 1`,
    [examId]
  );

  const [assignmentRows] = await conn.execute(
    `SELECT ass.student_id, u.first_name, u.last_name, u.email
     FROM exam_assignments ass
     JOIN users u ON u.user_id = ass.student_id
     WHERE ass.exam_id = ?
     ORDER BY u.first_name, u.last_name`,
    [examId]
  );

  const group = groupRows[0] || {};
  const sections = parseJsonArray(group.sections_json || exam.sections_json);
  const questionBank = parseJsonArray(group.questions_json);

  return {
    ...exam,
    exam_mode: exam.exam_mode || 'online',
    subject_label: exam.subject_label || null,
    domain_label: exam.domain_label || null,
    sections_json: exam.sections_json || null,
    passing_marks: extractInstructionNumber(exam.instructions, 'Passing marks'),
    question_bank_group_id: group.question_bank_group_id || null,
    sections,
    question_bank: questionBank,
    assigned_student_ids: assignmentRows.map((row) => Number(row.student_id)),
    assigned_students: assignmentRows,
  };
};

const resolveExamMode = (value) => (value === 'offline' ? 'offline' : 'online');

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
          SELECT *
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
    student_ids,
    security_settings,
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
  const resolvedExamMode = resolveExamMode(exam_mode);
  const instructions = buildInstructions({
    questionCount: question_count || structuredQuestionBank.length,
    examType: exam_type,
    examMode: resolvedExamMode,
    subjectLabel: subject_label,
    domainLabel: domain_label,
    passingMarks: passing_marks,
    endDate: end_date,
    sections: structuredSections,
    questionBank: structuredQuestionBank,
  });

  const defaultSecuritySettings = {
    block_copy_paste: true,
    block_cut: true,
    block_right_click: true,
    block_devtools: true,
    block_print: true,
    block_text_selection: true,
    allow_paste_in_coding: false,
    detect_tab_switch: true,
    detect_window_blur: true,
    detect_fullscreen_exit: true,
    inactivity_timeout_seconds: 120,
    max_idle_warnings: 3,
    auto_submit_on_violation: true,
    track_mouse_movement: true,
    track_keyboard_activity: true,
  };

  const examSecuritySettings = {
    ...defaultSecuritySettings,
    ...(security_settings || {}),
  };

  let conn;

  try {
    conn = await connectToMySQL();
    const examColumns = await getTableColumns(conn, 'exams');
    const insertColumns = ['institute_id', 'department_id', 'title', 'description', 'start_datetime', 'duration_minutes', 'total_marks', 'max_attempts', 'status', 'seb_required', 'seb_quit_password', 'instructions', 'created_by'];
    const insertValues = [
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
    ];

    if (examColumns.has('exam_mode')) {
      insertColumns.push('exam_mode');
      insertValues.push(resolvedExamMode);
    }

    if (examColumns.has('subject_label')) {
      insertColumns.push('subject_label');
      insertValues.push(subject_label ? String(subject_label).trim() : null);
    }

    if (examColumns.has('domain_label')) {
      insertColumns.push('domain_label');
      insertValues.push(domain_label ? String(domain_label).trim() : null);
    }

    if (examColumns.has('sections_json')) {
      insertColumns.push('sections_json');
      insertValues.push(structuredSections.length ? JSON.stringify(structuredSections) : null);
    }

    const [result] = await conn.execute(
      `INSERT INTO exams (${insertColumns.join(', ')}) VALUES (${insertColumns.map(() => '?').join(', ')})`,
      insertValues
    );

    if (structuredQuestionBank.length) {
      await syncQuestionBankGroup(conn, {
        examId: result.insertId,
        instituteId: resolvedInstituteId,
        departmentId: resolvedDepartmentId,
        title,
        description,
        questionBank: structuredQuestionBank,
        sections: structuredSections,
        subjectLabel: subject_label,
        domainLabel: domain_label,
        examMode: resolvedExamMode,
        createdBy: req.user.user_id,
      });
    }

    if (Array.isArray(student_ids)) {
      await syncExamAssignments(conn, result.insertId, student_ids);
    }

    await conn.execute(
      `
  INSERT INTO exam_proctoring_settings
  (
      exam_id,
      block_copy_paste,
      block_cut,
      block_right_click,
      block_devtools,
      block_print,
      block_text_selection,
      allow_paste_in_coding,
      detect_tab_switch,
      detect_window_blur,
      detect_fullscreen_exit,
      inactivity_timeout_seconds,
      max_idle_warnings,
      auto_submit_on_violation,
      track_mouse_movement,
      track_keyboard_activity
  )
  VALUES
  (
      ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?
  )
`,
      [
        result.insertId,

        examSecuritySettings.block_copy_paste,
        examSecuritySettings.block_cut,
        examSecuritySettings.block_right_click,
        examSecuritySettings.block_devtools,
        examSecuritySettings.block_print,
        examSecuritySettings.block_text_selection,
        examSecuritySettings.allow_paste_in_coding,
        examSecuritySettings.detect_tab_switch,
        examSecuritySettings.detect_window_blur,
        examSecuritySettings.detect_fullscreen_exit,
        examSecuritySettings.inactivity_timeout_seconds,
        examSecuritySettings.max_idle_warnings,
        examSecuritySettings.auto_submit_on_violation,
        examSecuritySettings.track_mouse_movement,
        examSecuritySettings.track_keyboard_activity,
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

router.get('/:examId', authMiddleware, async (req, res) => {
  const examId = Number(req.params.examId);
  if (!examId) {
    return res.status(400).json({ message: 'Invalid exam id' });
  }

  let conn;

  try {
    conn = await connectToMySQL();
    const exam = await fetchExamDetails(conn, examId, req.user);
    const [[securitySettings]] = await conn.execute(
      `
  SELECT *
  FROM exam_proctoring_settings
  WHERE exam_id = ?
  LIMIT 1
`,
      [examId]
    );

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    return res.json({ exam });
  } catch (error) {
    console.error('Load exam details error:', error);
    return res.status(500).json({ message: 'Database error', error: error.message });
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
    duration,
    total_marks,
    passing_marks,
    end_date,
    question_bank,
    student_ids,
    question_count,
  } = req.body;

  const examId = Number(req.params.examId);
  if (!examId) {
    return res.status(400).json({ message: 'Invalid exam id' });
  }

  let conn;

  try {
    conn = await connectToMySQL();

    const currentExam = await fetchExamDetails(conn, examId, req.user);
    if (!currentExam) {
      return res.status(404).json({ message: 'Exam not found' });
    }
    const examColumns = await getTableColumns(conn, 'exams');

    const normalizedSections = Array.isArray(sections) ? sections : currentExam.sections || [];
    const normalizedQuestionBank = Array.isArray(question_bank) ? question_bank : currentExam.question_bank || [];
    const resolvedExamMode = resolveExamMode(exam_mode || currentExam.exam_mode);
    const resolvedTitle = typeof title === 'string' ? title.trim() : currentExam.title;
    const resolvedDescription = typeof description === 'string' ? description.trim() : currentExam.description;
    const resolvedStartDate = typeof start_date === 'string' && start_date.trim() ? start_date : null;
    const resolvedDuration = Number(duration || currentExam.duration_minutes);
    const resolvedTotalMarks = Number(total_marks || currentExam.total_marks);
    const resolvedPassingMarks = Number.isFinite(Number(passing_marks)) ? Number(passing_marks) : currentExam.passing_marks;
    const resolvedSubjectLabel = typeof subject_label === 'string' ? subject_label.trim() : currentExam.subject_label;
    const resolvedDomainLabel = typeof domain_label === 'string' ? domain_label.trim() : currentExam.domain_label;
    const resolvedStatus = typeof status === 'string' && ['draft', 'scheduled', 'active', 'completed', 'cancelled'].includes(status) ? status : null;

    const nextInstructions = buildInstructions({
      questionCount: question_count || normalizedQuestionBank.length,
      examType: null,
      examMode: resolvedExamMode,
      subjectLabel: resolvedSubjectLabel,
      domainLabel: resolvedDomainLabel,
      passingMarks: resolvedPassingMarks,
      endDate: end_date,
      sections: normalizedSections,
      questionBank: normalizedQuestionBank,
    });

    const updates = [];
    const params = [];

    if (resolvedTitle) {
      updates.push('title = ?');
      params.push(resolvedTitle);
    }

    if (resolvedDescription) {
      updates.push('description = ?');
      params.push(resolvedDescription);
    }

    if (resolvedStartDate) {
      const rescheduledDate = toUtcDateFromLocalInput(resolvedStartDate, timezone_offset_minutes);
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

    if (Number.isFinite(resolvedDuration) && resolvedDuration > 0) {
      updates.push('duration_minutes = ?');
      params.push(resolvedDuration);
    }

    if (Number.isFinite(resolvedTotalMarks) && resolvedTotalMarks > 0) {
      updates.push('total_marks = ?');
      params.push(resolvedTotalMarks);
    }

    if (examColumns.has('exam_mode') && resolvedExamMode) {
      updates.push('exam_mode = ?');
      params.push(resolvedExamMode);
    }

    if (examColumns.has('subject_label') && typeof resolvedSubjectLabel === 'string') {
      updates.push('subject_label = ?');
      params.push(resolvedSubjectLabel || null);
    }

    if (examColumns.has('domain_label') && typeof resolvedDomainLabel === 'string') {
      updates.push('domain_label = ?');
      params.push(resolvedDomainLabel || null);
    }

    if (examColumns.has('sections_json') && (Array.isArray(sections) || currentExam.sections.length)) {
      updates.push('sections_json = ?');
      params.push(normalizedSections.length ? JSON.stringify(normalizedSections) : null);
    }

    if (resolvedStatus) {
      updates.push('status = ?');
      params.push(resolvedStatus);
    }

    updates.push('instructions = ?');
    params.push(nextInstructions || null);

    if (!updates.length) {
      return res.status(400).json({ message: 'No update fields provided' });
    }

    params.push(examId);

    await conn.execute(`UPDATE exams SET ${updates.join(', ')} WHERE exam_id = ?`, params);

    await syncQuestionBankGroup(conn, {
      examId,
      instituteId: currentExam.institute_id,
      departmentId: currentExam.department_id,
      title: resolvedTitle,
      description: resolvedDescription,
      questionBank: normalizedQuestionBank,
      sections: normalizedSections,
      subjectLabel: resolvedSubjectLabel,
      domainLabel: resolvedDomainLabel,
      examMode: resolvedExamMode,
      createdBy: req.user.user_id,
    });

    if (Array.isArray(student_ids)) {
      await syncExamAssignments(conn, examId, student_ids);
    }

    const exam = await fetchExamDetails(conn, examId, req.user);

    return res.json({
      exam: {
        ...exam,
        security_settings: securitySettings || null,
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
router.get('/:examId/instructions', authMiddleware, async (req, res) => {
  let conn;

  try {
    conn = await connectToMySQL();

    const examId = Number(req.params.examId);

    const [rows] = await conn.execute(`
      SELECT
        exam_id,
        title,
        description,
        instructions,
        duration_minutes,
        total_marks,
        start_datetime,
        end_datetime
      FROM exams
      WHERE exam_id = ?
      LIMIT 1
    `, [examId]);

    if (!rows.length) {
      return res.status(404).json({
        message: 'Exam not found'
      });
    }

    const exam = rows[0];

    return res.json({
      exam
    });

  } catch (error) {

    return res.status(500).json({
      message: 'Unable to load instructions',
      error: error.message
    });

  } finally {

    if (conn) conn.release();

  }
});
router.post('/:examId/start', authMiddleware, async (req, res) => {
  let conn;

  try {

    conn = await connectToMySQL();

    const examId = Number(req.params.examId);
    const studentId = req.user.user_id;

    // ==========================
    // Check Assignment
    // ==========================

    const [[assignment]] = await conn.execute(`
      SELECT *
      FROM exam_assignments
      WHERE exam_id = ?
      AND student_id = ?
      LIMIT 1
    `, [examId, studentId]);

    if (!assignment) {
      return res.status(403).json({
        message: "You are not enrolled for this exam."
      });
    }

    // ==========================
    // Get Exam
    // ==========================

    const [[exam]] = await conn.execute(`
      SELECT *
      FROM exams
      WHERE exam_id = ?
      LIMIT 1
    `, [examId]);

    if (!exam) {
      return res.status(404).json({
        message: "Exam not found."
      });
    }

    const now = new Date();

    if (now < new Date(exam.start_datetime)) {
      return res.status(400).json({
        message: "Exam has not started yet."
      });
    }

    if (now > new Date(exam.end_datetime)) {
      return res.status(400).json({
        message: "Exam has already ended."
      });
    }

    // ==========================
    // Already Started?
    // ==========================

    const [[attempt]] = await conn.execute(`
      SELECT *
      FROM exam_attempts
      WHERE exam_id=?
      AND student_id=?
      LIMIT 1
    `, [examId, studentId]);

    // Resume

    if (attempt) {

      if (attempt.is_submitted) {

        return res.status(400).json({

          success: false,

          message: "This exam has already been submitted."

        });

      }

      const started = new Date(attempt.started_at);

      const elapsed = Math.floor(
        (Date.now() - started.getTime()) / 1000
      );

      const remainingSeconds = Math.max(
        0,
        exam.duration_minutes * 60 - elapsed
      );

      return res.json({

        success: true,

        resumed: true,

        attemptId: attempt.attempt_id,

        startedAt: attempt.started_at,

        remainingSeconds

      });

    }

    // ==========================
    // Create Attempt
    // ==========================

    const duration =
      exam.duration_minutes * 60;
    const {
      remainingSeconds,
      currentQuestion,
      tabSwitch = false,
      fullscreenExit = false,
      idleWarning = false,
    } = req.body;
    const [result] = await conn.execute(`
      INSERT INTO exam_attempts
      (
        exam_id,
        student_id,
        started_at,
        remaining_seconds,
        auto_submitted
      )
      VALUES
      (
        ?,
        ?,
        NOW(),
        ?,
        0
      )
    `, [examId, studentId, duration]);

    // ==========================
    // Update Assignment
    // ==========================

    await conn.execute(`
      UPDATE exam_assignments
      SET assignment_status='STARTED'
      WHERE assignment_id=?
    `, [assignment.assignment_id]);

    return res.json({

      message: "Exam Started",

      resumed: false,

      attemptId: result.insertId,

      startedAt: new Date(),

      remainingSeconds: duration

    });

  }

  catch (error) {

    console.error(error);

    return res.status(500).json({

      message: "Unable to start exam.",

      error: error.message

    });

  }

  finally {

    if (conn) conn.release();

  }

});

router.get('/:examId/status', authMiddleware, async (req, res) => {

  let conn;

  try {

    conn = await connectToMySQL();

    const examId = Number(req.params.examId);
    const studentId = req.user.user_id;

    const [[attempt]] = await conn.execute(`
      SELECT
        attempt_id,
        started_at,
        submitted_at,
        remaining_seconds,
        auto_submitted,
        current_question,
        last_activity
      FROM exam_attempts
      WHERE exam_id = ?
      AND student_id = ?
      LIMIT 1
    `, [examId, studentId]);

    if (!attempt) {

      return res.status(404).json({
        message: "Exam not started."
      });

    }

    const [[exam]] = await conn.execute(`
      SELECT
        duration_minutes,
        end_datetime
      FROM exams
      WHERE exam_id=?
      LIMIT 1
    `, [examId]);

    const now = new Date();

    const started = new Date(attempt.started_at);

    const durationEnd =
      new Date(
        started.getTime() +
        exam.duration_minutes * 60 * 1000
      );

    const examEnd =
      new Date(exam.end_datetime);

    const finalEnd =
      durationEnd < examEnd
        ? durationEnd
        : examEnd;

    let remaining =
      Math.floor(
        (finalEnd - now) / 1000
      );

    if (remaining < 0)
      remaining = 0;
    // ==========================================
    // Auto Submit
    // ==========================================

    if (
      remaining === 0 &&
      !attempt.submitted_at
    ) {

      await conn.execute(`
        UPDATE exam_attempts
        SET
            completed_at = NOW(),
            is_submitted = 1,
            auto_submitted = 1
        WHERE attempt_id = ?
    `, [attempt.attempt_id]);

      await conn.execute(`
        UPDATE exam_assignments
        SET assignment_status='AUTO_SUBMITTED'
        WHERE exam_id=?
        AND student_id=?
    `, [examId, studentId]);

      return res.json({

        status: "AUTO_SUBMITTED",

        remainingSeconds: 0,

        autoSubmitted: true

      });

    }
    return res.json({

      status:
        attempt.submitted_at
          ? "SUBMITTED"
          : remaining === 0
            ? "TIME_UP"
            : "IN_PROGRESS",

      remainingSeconds: remaining,

      startedAt: attempt.started_at,

      submitted: Boolean(attempt.submitted_at),

      autoSubmitted:
        Boolean(attempt.auto_submitted),

      currentQuestion:
        attempt.current_question

    });

  }

  catch (error) {

    return res.status(500).json({

      message: "Unable to fetch exam status.",

      error: error.message

    });

  }

  finally {

    if (conn)
      conn.release();

  }

});

router.post('/:examId/heartbeat', authMiddleware, async (req, res) => {

  let conn;

  try {

    conn = await connectToMySQL();

    const examId = Number(req.params.examId);
    const studentId = req.user.user_id;
    const {
      remainingSeconds,
      currentQuestion,
      tabSwitch = false,
      fullscreenExit = false,
      idleWarning = false,
    } = req.body;
    const [result] = await conn.execute(`
UPDATE exam_attempts
SET
    last_activity_at = NOW(),
    remaining_seconds = ?,
    current_question = ?,
    tab_switch_count = tab_switch_count + ?,
    fullscreen_exit_count = fullscreen_exit_count + ?,
    idle_warning_count = idle_warning_count + ?
WHERE
    exam_id = ?
AND
    student_id = ?
`, [
      remainingSeconds,
      currentQuestion,
      tabSwitch ? 1 : 0,
      fullscreenExit ? 1 : 0,
      idleWarning ? 1 : 0,
      examId,
      studentId
    ]);

    if (result.affectedRows === 0) {

      return res.status(404).json({

        message: "Exam attempt not found."

      });

    }

    return res.json({

      success: true

    });

  }

  catch (error) {

    return res.status(500).json({

      message: "Heartbeat failed.",

      error: error.message

    });

  }

  finally {

    if (conn)
      conn.release();

  }

});

router.post('/:examId/save-answer', authMiddleware, async (req, res) => {

  let conn;

  try {

    conn = await connectToMySQL();

    const examId = Number(req.params.examId);
    const studentId = req.user.user_id;

    const {
      questionId,
      answer,
      markedForReview = false
    } = req.body;

    // Verify attempt exists
    const [[attempt]] = await conn.execute(`
      SELECT attempt_id
      FROM exam_attempts
      WHERE exam_id = ?
      AND student_id = ?
      LIMIT 1
    `, [examId, studentId]);

    if (!attempt) {
      return res.status(404).json({
        message: "Exam attempt not found."
      });
    }

    // Insert or Update answer
    await conn.execute(`
      INSERT INTO student_answers
      (
        attempt_id,
        question_id,
        selected_answer,
        marked_for_review,
        answered_at
      )
      VALUES (?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        selected_answer = VALUES(selected_answer),
        marked_for_review = VALUES(marked_for_review),
        answered_at = NOW()
    `, [
      attempt.attempt_id,
      questionId,
      JSON.stringify(answer),
      markedForReview
    ]);

    return res.json({
      success: true,
      message: "Answer saved successfully."
    });

  } catch (error) {

    return res.status(500).json({
      message: "Unable to save answer.",
      error: error.message
    });

  } finally {

    if (conn) conn.release();

  }

});

router.post('/:examId/submit', authMiddleware, async (req, res) => {

  let conn;

  try {

    conn = await connectToMySQL();

    const examId = Number(req.params.examId);
    const studentId = req.user.user_id;

    // ==========================================
    // Get Attempt
    // ==========================================

    const [[attempt]] = await conn.execute(`
      SELECT *
      FROM exam_attempts
      WHERE exam_id = ?
      AND student_id = ?
      LIMIT 1
    `, [examId, studentId]);

    if (!attempt) {
      return res.status(404).json({
        message: "Exam attempt not found."
      });
    }

    // Already submitted
    if (attempt.is_submitted) {
      return res.status(400).json({
        message: "Exam already submitted."
      });
    }

    // ==========================================
    // Calculate Objective Score
    // ==========================================

    const [answers] = await conn.execute(`
      SELECT
          sa.selected_answer,
          q.correct_answer,
          q.question_type,
          q.marks
      FROM student_answers sa
      JOIN questions q
      ON q.question_id = sa.question_id
      WHERE sa.attempt_id = ?
    `, [attempt.attempt_id]);

    let totalScore = 0;

    for (const ans of answers) {

      if (
        ans.question_type === 'mcq' ||
        ans.question_type === 'msq'
      ) {

        if (
          JSON.stringify(ans.selected_answer)
          ===
          JSON.stringify(ans.correct_answer)
        ) {
          totalScore += Number(ans.marks);
        }

      }

    }

    // ==========================================
    // Update Attempt
    // ==========================================

    await conn.execute(`
    UPDATE exam_attempts
    SET
        completed_at = NOW(),
        total_score = ?,
        is_submitted = 1,
        auto_submitted = 0
    WHERE attempt_id = ?
`, [
      totalScore,
      attempt.attempt_id
    ]);


    // ==========================================
    // Update Assignment
    // ==========================================

    await conn.execute(`
      UPDATE exam_assignments
      SET
        assignment_status='SUBMITTED'
      WHERE
        exam_id=?
      AND
        student_id=?
    `, [examId, studentId]);

    return res.json({

      success: true,

      message: "Exam submitted successfully.",

      score: totalScore,

      pendingManualReview: true

    });

  }

  catch (error) {

    console.error(error);

    return res.status(500).json({

      message: "Unable to submit exam.",

      error: error.message

    });

  }

  finally {

    if (conn)
      conn.release();

  }

});
module.exports = router;
