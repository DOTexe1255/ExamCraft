const express = require('express');
const connectToMySQL = require('../db');

const router = express.Router();
const departmentregisterschema = require('../models/departmentregisterSchema');

// POST /api/department
// Purpose: Create a department under an existing institute.
//
// Sample JSON:
// {
//   "institute_id": 1,
//   "name": "Computer Science",
//   "code": "CS",
//   "head_email": "cshead@techinst.com"
// }
router.post('/', async (req, res) => {
        const { error, value } = departmentregisterschema.validate(req.body, { abortEarly: false });
    if (error) {
    return res.status(400).json({
      message: 'Validation error',
      details: error.details.map(d => d.message)
    });
  }
  
  const { institute_id, name, code, head_email } = req.body;

  if (!institute_id || !name || !code) {
    return res.status(400).json({
      message: 'institute_id, name, and code are required'
    });
  }

  let conn;
  try {
    conn = await connectToMySQL();

    // Verify institute exists
    const [instRows] = await conn.execute(
      'SELECT institute_id FROM institutes WHERE institute_id = ?',
      [institute_id]
    );
    if (instRows.length === 0) {
      await conn.end();
      return res.status(400).json({ message: 'Invalid institute_id' });
    }

    // Ensure department code unique within that institute
    const [existing] = await conn.execute(
      'SELECT department_id FROM departments WHERE institute_id = ? AND code = ?',
      [institute_id, code]
    );
    if (existing.length > 0) {
      await conn.end();
      return res.status(409).json({
        message: 'Department code already exists for this institute'
      });
    }

    const [result] = await conn.execute(
      `INSERT INTO departments (institute_id, name, code, head_email)
       VALUES (?, ?, ?, ?)`,
      [institute_id, name, code, head_email || null]
    );

    await conn.end();

    return res.status(201).json({
      message: 'Department created successfully',
      department_id: result.insertId
    });
  } catch (err) {
    if (conn) await conn.end();
    console.error('Create department error:', err);
    return res.status(500).json({ message: 'Database error' });
  }
});

module.exports = router;
