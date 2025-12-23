const express = require('express');
const connectToMySQL = require('../db');

const router = express.Router();
const instituteregisterschema = require('../models/instituteregisterSchema');

// POST /api/institute
// Purpose: Create a new institute.
//
// Sample JSON:
// {
//   "name": "Tech Institute Pune",
//   "code": "TI001",
//   "address": "Pune, Maharashtra",
//   "contact_email": "admin@techinst.com",
//   "phone": "9876543210"
// }
router.post('/', async (req, res) => {
     const { error, value } = instituteregisterschema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      message: 'Validation error',
      details: error.details.map(d => d.message)
    });
  }
  const { name, code, address, contact_email, phone } = req.body;

  if (!name || !code) {
    return res.status(400).json({ message: 'name and code are required' });
  }

  let conn;
  try {
    conn = await connectToMySQL();

    // Ensure institute code is unique
    const [existing] = await conn.execute(
      'SELECT institute_id FROM institutes WHERE code = ?',
      [code]
    );
    if (existing.length > 0) {
      await conn.end();
      return res.status(409).json({ message: 'Institute code already exists' });
    }

    const [result] = await conn.execute(
      `INSERT INTO institutes (name, code, address, contact_email, phone)
       VALUES (?, ?, ?, ?, ?)`,
      [name, code, address || null, contact_email || null, phone || null]
    );

    await conn.end();

    return res.status(201).json({
      message: 'Institute created successfully',
      institute_id: result.insertId
    });
  } catch (err) {
    if (conn) await conn.end();
    console.error('Create institute error:', err);
    return res.status(500).json({ message: 'Database error' });
  }
});

module.exports = router;
