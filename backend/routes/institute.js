const express = require('express');
const connectToMySQL = require('../db');

const router = express.Router();
const instituteregisterschema = require('../models/instituteregisterSchema');

// POST /api/institute
// Purpose: Create a new institute.
router.post('/', async (req, res) => {
  // Validate input body using Joi schema
  const { error, value } = instituteregisterschema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json({
      message: 'Validation error',
      details: error.details.map((d) => d.message),
    });
  }

  // Use validated data instead of raw req.body
  const { name, code, address, contact_email, phone } = value;

  let conn;
  try {
    // Get a pooled MySQL connection
    conn = await connectToMySQL();

    // Ensure institute code is unique
    const [existing] = await conn.execute(
      'SELECT institute_id FROM institutes WHERE code = ?',
      [code]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: 'Institute code already exists' });
    }

    // Insert the institute record
    const [result] = await conn.execute(
      `INSERT INTO institutes (name, code, address, contact_email, phone)
       VALUES (?, ?, ?, ?, ?)`,
      [name, code, address || null, contact_email || null, phone || null]
    );

    return res.status(201).json({
      message: 'Institute created successfully',
      institute_id: result.insertId,
    });
  } catch (err) {
    console.error('Create institute error:', err);
    return res.status(500).json({ message: 'Database error', error: err.message });
  } finally {
    // Release pooled connection back to MySQL
    if (conn) conn.release();
  }
});

module.exports = router;