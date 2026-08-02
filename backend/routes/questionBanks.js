const express = require('express');
const connectToMySQL = require('../db');
const authMiddleware = require('./authMiddleware');

const router = express.Router();

const parseQuestions = (value) => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === 'object') {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

router.get('/', authMiddleware, async (req, res) => {
  let conn;

  try {
    conn = await connectToMySQL();

    let query = `
      SELECT qbg.question_bank_group_id, qbg.institute_id, qbg.department_id, qbg.group_name,
             qbg.description, qbg.questions_json, qbg.question_count, qbg.subject_label,
             qbg.domain_label, qbg.source_exam_id, qbg.source_type, qbg.exam_mode, qbg.sections_json,
             qbg.created_by, qbg.created_at,
             u.first_name, u.last_name
      FROM question_bank_groups qbg
      LEFT JOIN users u ON u.user_id = qbg.created_by
    `;

    const params = [];

    if (req.user.role === 'department') {
      query += ' WHERE qbg.department_id = ?';
      params.push(req.user.department_id);
    } else {
      query += ' WHERE qbg.institute_id = ?';
      params.push(req.user.institute_id);
    }

    query += ' ORDER BY qbg.created_at DESC';

    const [rows] = await conn.execute(query, params);

    return res.json({
      question_banks: rows.map((row) => ({
        ...row,
        questions: parseQuestions(row.questions_json),
        sections: parseQuestions(row.sections_json),
      })),
    });
  } catch (error) {
    console.error('List question banks error:', error);
    return res.status(500).json({ message: 'Database error', error: error.message });
  } finally {
    if (conn) conn.release();
  }
});

router.post('/', authMiddleware, async (req, res) => {
  const { group_name, description, questions, institute_id, department_id, subject_label, domain_label, sections } = req.body;

  if (!group_name || !String(group_name).trim()) {
    return res.status(400).json({ message: 'group_name is required' });
  }

  const normalizedQuestions = parseQuestions(questions);
  const normalizedSections = parseQuestions(sections);

  if (!normalizedQuestions.length) {
    return res.status(400).json({ message: 'At least one question is required' });
  }

  const resolvedInstituteId = Number(req.user.institute_id || institute_id);
  const resolvedDepartmentId = Number(
    req.user.role === 'department' ? req.user.department_id : department_id
  );

  if (!resolvedInstituteId || !resolvedDepartmentId) {
    return res.status(400).json({ message: 'institute_id and department_id are required' });
  }

  let conn;

  try {
    conn = await connectToMySQL();

    const [result] = await conn.execute(
      `INSERT INTO question_bank_groups
        (institute_id, department_id, group_name, description, questions_json, question_count, created_by,
         subject_label, domain_label, source_exam_id, source_type, exam_mode, sections_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        resolvedInstituteId,
        resolvedDepartmentId,
        String(group_name).trim(),
        description ? String(description).trim() : null,
        JSON.stringify(normalizedQuestions),
        normalizedQuestions.length,
        req.user.user_id,
        subject_label ? String(subject_label).trim() : null,
        domain_label ? String(domain_label).trim() : null,
        null,
        'manual',
        null,
        normalizedSections.length ? JSON.stringify(normalizedSections) : null,
      ]
    );

    return res.status(201).json({
      message: 'Question bank saved successfully',
      question_bank: {
        question_bank_group_id: result.insertId,
        institute_id: resolvedInstituteId,
        department_id: resolvedDepartmentId,
        group_name: String(group_name).trim(),
        description: description ? String(description).trim() : null,
        subject_label: subject_label ? String(subject_label).trim() : null,
        domain_label: domain_label ? String(domain_label).trim() : null,
        sections: normalizedSections,
        questions: normalizedQuestions,
        question_count: normalizedQuestions.length,
      },
    });
  } catch (error) {
    console.error('Create question bank error:', error);
    return res.status(500).json({ message: 'Database error', error: error.message });
  } finally {
    if (conn) conn.release();
  }
});

module.exports = router;