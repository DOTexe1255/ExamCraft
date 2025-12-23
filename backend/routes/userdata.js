const express = require('express');
const connectToMySQL = require('../db');
const authMiddleware = require('./authMiddleware'); // ✅ import function, not { authMiddleware }

const router = express.Router();

// GET /api/user/getuserdata  -> get user data from token
router.get('/getuserdata', authMiddleware, async (req, res) => {
  // 1) user_id comes from decoded JWT (set in authMiddleware)
  const userId = req.user.user_id;

  let conn;
  try {
    // 2) Open DB connection
    conn = await connectToMySQL();

    // 3) Fetch user by id (without password_hash)
    const [rows] = await conn.execute(
      'SELECT user_id, email, role, first_name, last_name, phone, institute_id, department_id, is_active, created_at FROM users WHERE user_id = ?',
      [userId]
    );

    // 4) Close connection
    await conn.end();

    // 5) If no user, return 404
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 6) Return user data
    return res.status(200).json({ user: rows[0] });
  } catch (err) {
    if (conn) await conn.end();
    console.error('Get user data error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
