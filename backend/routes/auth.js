const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const connectToMySQL = require('../db');
const registerSchema = require('../models/registerSchema.js');


// --------------------------------------------------------------------
// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { error, value } = registerSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      message: 'Validation error',
      details: error.details.map(d => d.message)
    });
  }

  const {
    first_name,
    last_name,
    email,
    password,
    role,
    institute_id,
    department_id,
    phone
  } = value;

  try {
    const conn = await connectToMySQL(); // Updated to use connectToMySQL directly

    try {
      const [existing] = await conn.execute(
        'SELECT user_id FROM users WHERE email = ?',
        [email]
      );
      if (existing.length > 0) {
        conn.end(); // Close the connection
        return res.status(409).json({ message: 'Email already registered' });
      }

      const password_hash = await bcrypt.hash(password, 10);

      const [result] = await conn.execute(
        `INSERT INTO users
          (institute_id, department_id, email, password_hash, role, first_name, last_name, phone, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [
          institute_id,
          department_id || null,
          email,
          password_hash,
          role,
          first_name,
          last_name,
          phone || null
        ]
      );

      conn.end(); // Close the connection

      return res.status(201).json({
        message: 'User registered successfully',
        user_id: result.insertId
      });
    } catch (err) {
      conn.end(); // Close the connection
      console.error('Registration DB error:', err); // <---
      return res.status(500).json({ message: 'Database error' });
    }
  } catch (err) {
    console.error('Server error (connection/connectToMySQL):', err); // <---
    return res.status(500).json({ message: 'Server error' });
  }
});
//-------------------------------------------------------------------------
// sample register request body
// {
//     "first_name": "John",
//     "last_name": "Doe",
//     "email": "john@example.com",
//     "password": "StrongPass123",
//     "role": "student",
//     "institute_id": 1,
//     "department_id": 2,
//     "phone": "123-456-7890"
// }
// ---------------------------------------------------------------------------
//----------------------------------------------------------------------------
// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Basic checks
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  let conn;
  try {
    conn = await connectToMySQL(); // get connection

    // 1) Find user by email
    const [rows] = await conn.execute(
      'SELECT user_id, email, password_hash, role, first_name, last_name, is_active FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      await conn.end();
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = rows[0];

    // 2) Check active flag
    if (!user.is_active) {
      await conn.end();
      return res.status(403).json({ message: 'Account is inactive' });
    }

    // 3) Compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      await conn.end();
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // 4) Optionally update last_login
    await conn.execute(
      'UPDATE users SET last_login = NOW() WHERE user_id = ?',
      [user.user_id]
    );

    await conn.end();

    // 5) Create JWT token (only minimal info inside)
    const payload = {
      user_id: user.user_id,
      role: user.role
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    ); // [web:146][web:144]

    // Return only token and maybe very small info
    return res.status(200).json({
      message: 'Login successful',
      token
    });
  } catch (err) {
    if (conn) await conn.end();
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

//------------------------------------------------------------------------
// sample login express.request
// {
//     "email": "abc@example.com",
//     "password": "StrongPass123"
// }
// ---------------------------------------------------------------------------
module.exports = router;