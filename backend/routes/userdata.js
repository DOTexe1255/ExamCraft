const express = require('express');
const connectToMySQL = require('../db');
const authMiddleware = require('./authMiddleware');

const router = express.Router();

// GET /api/user/getuserdata
// Purpose: Return the logged-in user's profile data from the JWT token.
router.get('/getuserdata', authMiddleware, async (req, res) => {
  // user_id is already attached to req.user by authMiddleware
  const userId = req.user.user_id;

  let conn;
  try {
    // Get a pooled MySQL connection
    conn = await connectToMySQL();

    // Fetch user details without password_hash
    const [rows] = await conn.execute(
      'SELECT user_id, email, role, first_name, last_name, phone, institute_id, department_id, is_active, created_at FROM users WHERE user_id = ?',
      [userId]
    );

    // If user does not exist, return 404
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Send user data to the client
    return res.status(200).json({ user: rows[0] });
  } catch (err) {
    console.error('Get user data error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  } finally {
    // Release pooled connection
    if (conn) conn.release();
  }
});

module.exports = router;