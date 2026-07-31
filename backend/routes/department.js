const express = require('express');
const connectToMySQL = require('../db');
const router = express.Router();
const departmentregisterschema = require('../models/departmentregisterSchema');
const authMiddleware = require('./authMiddleware');

// POST /api/department
// Purpose: Create a department under an existing institute.
router.post('/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'institute') {
    return res.status(403).json({ message: 'Only institute administrators can create departments' });
  }
  // Validate incoming request body using Joi schema
  const { error, value } = departmentregisterschema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json({
      message: 'Validation error',
      details: error.details.map((d) => d.message),
    });
  }

  // Use validated data instead of req.body
  const { institute_id, name, code, head_email } = value;

  if (Number(institute_id) !== Number(req.user.institute_id)) {
    return res.status(403).json({ message: 'You can only create departments in your own institute' });
  }

  let conn;
  try {
    // Get a MySQL pooled connection
    conn = await connectToMySQL();

    // Check whether the institute exists
    const [instRows] = await conn.execute(
      'SELECT institute_id FROM institutes WHERE institute_id = ?',
      [institute_id]
    );

    if (instRows.length === 0) {
      return res.status(400).json({ message: 'Invalid institute_id' });
    }

    // Ensure the same department code is not reused within the same institute
    const [existing] = await conn.execute(
      'SELECT department_id FROM departments WHERE institute_id = ? AND code = ?',
      [institute_id, code]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        message: 'Department code already exists for this institute',
      });
    }

    // Insert the new department
    const [result] = await conn.execute(
      `INSERT INTO departments (institute_id, name, code, head_email)
       VALUES (?, ?, ?, ?)`,
      [institute_id, name, code, head_email || null]
    );

    await conn.execute(
      'INSERT INTO audit_logs (user_id, action, table_name, record_id, new_values) VALUES (?, ?, ?, ?, ?)',
      [req.user.user_id, 'DEPARTMENT_CREATED', 'departments', result.insertId, JSON.stringify({ name, code })]
    );

    return res.status(201).json({
      message: 'Department created successfully',
      department_id: result.insertId,
    });
  } catch (err) {
    console.error('Create department error:', err);
    return res.status(500).json({ message: 'Database error', error: err.message });
  } finally {
    // Release pooled connection back to MySQL pool
    if (conn) conn.release();
  }
});

module.exports = router;
