// routes/userdata.js
const express = require('express');
const jwt = require('jsonwebtoken');
const connectToMySQL = require('../db');
const { authMiddleware } = require('./authMiddleware');

const router = express.Router();



// GET /api/user  -> get user data from token
router.get('/getuserdata', authMiddleware, async (req, res) => {
  const userId = req.user.user_id;

  let conn;
  try {
    conn = await connectToMySQL();

    const [rows] = await conn.execute(
      'SELECT user_id, email, role, first_name, last_name, phone, institute_id, department_id, is_active, created_at FROM users WHERE user_id = ?',
      [userId]
    ); // [web:159][web:170]

    await conn.end();

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ user: rows[0] });
  } catch (err) {
    if (conn) await conn.end();
    console.error('Get user data error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
