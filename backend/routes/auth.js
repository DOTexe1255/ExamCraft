const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const connectToMySQL = require('../db');
const studentregisterSchema = require('../models/studentregisterSchema.js');
const departmentAdminRegisterSchema = require('../models/departmentAdminRegisterSchema.js');
const instituteAdminRegisterSchema = require('../models/instituteAdminRegisterSchema.js');
const createFingerprint = require('../global/globalFunction.js');

const ensureStudentSemesterColumn = async (conn) => {
  const [columns] = await conn.execute(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'semester'`
  );
  if (!columns.length) {
    await conn.execute('ALTER TABLE users ADD COLUMN semester TINYINT NULL AFTER phone');
  }
};

// ====================== INSTITUTE ADMIN REGISTRATION ======================
router.post('/institute-admin-register', async (req, res) => {
  const { error, value } = instituteAdminRegisterSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json({
      message: 'Validation error',
      details: error.details.map((d) => d.message),
    });
  }

  const { first_name, last_name, email, password, institute_id, phone } = value;

  let conn;
  try {
    conn = await connectToMySQL();

    const [existing] = await conn.execute(
      'SELECT user_id FROM users WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const [instRows] = await conn.execute(
      'SELECT institute_id FROM institutes WHERE institute_id = ?',
      [institute_id]
    );

    if (instRows.length === 0) {
      return res.status(400).json({
        message: 'Invalid institute_id. Create institute first.',
      });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const [result] = await conn.execute(
      `INSERT INTO users
       (institute_id, department_id, email, password_hash, role, first_name, last_name, phone, is_active)
       VALUES (?, NULL, ?, ?, 'institute', ?, ?, ?, 1)`,
      [institute_id, email, password_hash, first_name, last_name, phone || null]
    );

    return res.status(201).json({
      message: 'Institute admin created successfully',
      user_id: result.insertId,
    });
  } catch (err) {
    console.error('Registration Error:', err);
    return res.status(500).json({
      message: 'Database error',
      error: err.message,
    });
  } finally {
    if (conn) await conn.end();
  }
});

// ====================== DEPARTMENT ADMIN REGISTRATION ======================
router.post('/department-admin-register', async (req, res) => {
  const { error, value } = departmentAdminRegisterSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json({
      message: 'Validation error',
      details: error.details.map((d) => d.message),
    });
  }

  const {
    first_name,
    last_name,
    email,
    password,
    institute_id,
    department_id,
    phone,
  } = value;

  let conn;
  try {
    conn = await connectToMySQL();

    const [existing] = await conn.execute(
      'SELECT user_id FROM users WHERE email = ?',
      [email]
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const [instRows] = await conn.execute(
      'SELECT institute_id FROM institutes WHERE institute_id = ?',
      [institute_id]
    );
    if (instRows.length === 0) {
      return res.status(400).json({
        message: 'Invalid institute_id. Create institute first.',
      });
    }

    const [deptRows] = await conn.execute(
      'SELECT department_id FROM departments WHERE department_id = ? AND institute_id = ?',
      [department_id, institute_id]
    );
    if (deptRows.length === 0) {
      return res.status(400).json({
        message: 'Invalid department_id for this institute. Create department first.',
      });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const [result] = await conn.execute(
      `INSERT INTO users
       (institute_id, department_id, email, password_hash, role, first_name, last_name, phone, is_active)
       VALUES (?, ?, ?, ?, 'department', ?, ?, ?, 1)`,
      [institute_id, department_id, email, password_hash, first_name, last_name, phone || null]
    );

    return res.status(201).json({
      message: 'Department user created successfully',
      user_id: result.insertId,
    });
  } catch (err) {
    console.error('Department user registration error:', err);
    return res.status(500).json({ message: 'Database error', error: err.message });
  } finally {
    if (conn) await conn.end();
  }
});

// ====================== STUDENT REGISTRATION ======================
router.post('/student-register', async (req, res) => {
  const { error, value } = studentregisterSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json({
      message: 'Validation error',
      details: error.details.map((d) => d.message),
    });
  }

  const {
    first_name,
    last_name,
    email,
    password,
    institute_id,
    department_id,
    phone,
    semester,
  } = value;

  let conn;
  try {
    conn = await connectToMySQL();

    const [existing] = await conn.execute(
      'SELECT user_id FROM users WHERE email = ?',
      [email]
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const [instRows] = await conn.execute(
      'SELECT institute_id FROM institutes WHERE institute_id = ?',
      [institute_id]
    );
    if (instRows.length === 0) {
      return res.status(400).json({
        message: 'Invalid institute_id. Please create institute first.',
      });
    }

    const [deptRows] = await conn.execute(
      'SELECT department_id FROM departments WHERE department_id = ? AND institute_id = ?',
      [department_id, institute_id]
    );
    if (deptRows.length === 0) {
      return res.status(400).json({
        message: 'Invalid department_id for this institute. Create department under the institute first.',
      });
    }

    const password_hash = await bcrypt.hash(password, 10);
    await ensureStudentSemesterColumn(conn);

    const [result] = await conn.execute(
      `INSERT INTO users
       (institute_id, department_id, email, password_hash, role, first_name, last_name, phone, semester, is_active)
       VALUES (?, ?, ?, ?, 'student', ?, ?, ?, ?, 1)`,
      [institute_id, department_id, email, password_hash, first_name, last_name, phone, semester]
    );

    return res.status(201).json({
      message: 'Student registered successfully',
      user_id: result.insertId,
    });
  } catch (err) {
    console.error('Student registration error:', err);
    return res.status(500).json({ message: 'Database error', error: err.message });
  } finally {
    if (conn) await conn.end();
  }
});

// ====================== UNIFIED LOGIN ======================
router.post('/login', async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ message: 'Email, password, and role are required' });
  }

  const allowedRoles = ['institute', 'department', 'student'];
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  let conn;
  try {
    conn = await connectToMySQL();

    const [rows] = await conn.execute(
      'SELECT user_id, email, password_hash, role, first_name, last_name, is_active, institute_id, department_id FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = rows[0];

    if (user.role !== role) {
      return res.status(403).json({ message: 'Role mismatch for this account' });
    }

    if (!user.is_active) {
      return res.status(403).json({ message: 'Account is inactive' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    await conn.execute(
      'UPDATE users SET last_login = NOW() WHERE user_id = ?',
      [user.user_id]
    );

    const fingerprint = createFingerprint(req);

    const payload = {
      user_id: user.user_id,
      role: user.role,
      institute_id: user.institute_id,
      department_id: user.department_id || null,
      fingerprint,
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '30m' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 60 * 1000,
      path: '/',
    });

    return res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.user_id,
        email: user.email,
        role: user.role,
        institute_id: user.institute_id,
        department_id: user.department_id || null,
        first_name: user.first_name,
        last_name: user.last_name,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  } finally {
    if (conn) await conn.end();
  }
});

// ====================== VERIFY ENDPOINT ======================
router.get('/verify', async (req, res) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        authenticated: false,
        user: null,
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
    const currentFingerprint = createFingerprint(req);

    if (decoded.fingerprint !== currentFingerprint) {
      return res.status(401).json({
        authenticated: false,
        user: null,
        error: 'Device fingerprint mismatch',
      });
    }

    return res.json({
      authenticated: true,
      user: {
        id: decoded.user_id,
        role: decoded.role,
        institute_id: decoded.institute_id,
        department_id: decoded.department_id || null,
      },
    });
  } catch (err) {
    return res.status(401).json({
      authenticated: false,
      user: null,
    });
  }
});

module.exports = router;
