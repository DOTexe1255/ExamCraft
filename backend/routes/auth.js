// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const connectToMySQL = require('../db');
const studentregisterSchema = require('../models/studentregisterSchema.js');
const departmentAdminRegisterSchema = require('../models/departmentAdminRegisterSchema.js');
const instituteAdminRegisterSchema = require('../models/instituteAdminRegisterSchema.js');
const createFingerprint = require('../global/globalFunction.js');


// ====================== INSTITUTE ADMIN REGISTRATION ======================
// POST /api/auth/admin-register
// Purpose: Create an admin user for an existing institute.
//
// Sample JSON:
// {
//   "first_name": "Super",
//   "last_name": "Admin",
//   "email": "admin@techinst.com",
//   "password": "password123",
//   "institute_id": 1,
//   "phone": "9876543210"
// }
router.post('/institute-admin-register', async (req, res) => {
  console.log("Institute admin route hit");

  const { error, value } = instituteAdminRegisterSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    console.log("Validation failed");
    return res.status(400).json({
      message: "Validation error",
      details: error.details.map((d) => d.message),
    });
  }

  const { first_name, last_name, email, password, institute_id, phone } = value;

  let conn;

  try {
    // console.log("1. Connecting to MySQL...");
    conn = await connectToMySQL();
    // console.log("2. MySQL Connected");

    // console.log("3. Checking existing email...");
    // console.log("Before query()");

const [existing] = await conn.query(
  `SELECT user_id FROM users WHERE email = '${email.replace(/'/g, "\\'")}'`
);

// console.log("After query()", existing);
//     console.log("4. Email check completed");

    if (existing.length > 0) {
      await conn.end();
      return res.status(409).json({
        message: "Email already registered",
      });
    }

    // console.log("5. Checking institute...");
    const [instRows] = await conn.execute(
      "SELECT institute_id FROM institutes WHERE institute_id = ?",
      [institute_id]
    );
    // console.log("6. Institute check completed", instRows);

    if (instRows.length === 0) {
      await conn.end();
      return res.status(400).json({
        message: "Invalid institute_id. Create institute first.",
      });
    }

    // console.log("7. Hashing password...");
    const password_hash = await bcrypt.hash(password, 10);
    // console.log("8. Password hashed");

    // console.log("9. Inserting user...");
    const [result] = await conn.execute(
      `INSERT INTO users
      (institute_id, department_id, email, password_hash, role, first_name, last_name, phone, is_active)
      VALUES (?, NULL, ?, ?, 'institute', ?, ?, ?, 1)`,
      [
        institute_id,
        email,
        password_hash,
        first_name,
        last_name,
        phone || null,
      ]
    );

    // console.log("10. User inserted", result);

    await conn.end();

    return res.status(201).json({
      message: "Institute admin created successfully",
      user_id: result.insertId,
    });
  } catch (err) {
    console.error("Registration Error:", err);

    if (conn) {
      await conn.end();
    }

    return res.status(500).json({
      message: "Database error",
      error: err.message,
    });
  }
});

// ====================== DEPARTMENT ADMIN REGISTRATION ======================
// POST /api/auth/department-user-register
// Purpose: Create a department-level user.
// Sample JSON:
// {
//   "first_name": "CS",
//   "last_name": "Head",
//   "email": "cshead@techinst.com",
//   "password": "password123",
//   "role": "department",
//   "institute_id": 1,
//   "department_id": 1,
//   "phone": "9876543212"
// }
router.post('/department-admin-register', async (req, res) => {
   const { error, value } = departmentAdminRegisterSchema.validate(req.body, { abortEarly: false });
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
    institute_id,
    department_id,
    phone
  } = req.body;

  if (!first_name || !last_name || !email || !password || !institute_id || !department_id) {
    return res.status(400).json({
      message: 'first_name, last_name, email, password, institute_id, department_id are required'
    });
  }

  let conn;
  try {
    conn = await connectToMySQL();

    // Check email uniqueness
    const [existing] = await conn.execute(
      'SELECT user_id FROM users WHERE email = ?',
      [email]
    );
    if (existing.length > 0) {
      await conn.end();
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Verify institute exists
    const [instRows] = await conn.execute(
      'SELECT institute_id FROM institutes WHERE institute_id = ?',
      [institute_id]
    );
    if (instRows.length === 0) {
      await conn.end();
      return res.status(400).json({ message: 'Invalid institute_id. Create institute first.' });
    }

    // Verify department exists and belongs to this institute
    const [deptRows] = await conn.execute(
      'SELECT department_id FROM departments WHERE department_id = ? AND institute_id = ?',
      [department_id, institute_id]
    );
    if (deptRows.length === 0) {
      await conn.end();
      return res.status(400).json({
        message: 'Invalid department_id for this institute. Create department first.'
      });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const [result] = await conn.execute(
      `INSERT INTO users
        (institute_id, department_id, email, password_hash, role, first_name, last_name, phone, is_active)
       VALUES (?, ?, ?, ?, 'department', ?, ?, ?, 1)`,
      [
        institute_id,
        department_id,
        email,
        password_hash,
        first_name,
        last_name,
        phone || null
      ]
    );

    await conn.end();

    return res.status(201).json({
      message: 'Department user created successfully',
      user_id: result.insertId
    });
  } catch (err) {
    if (conn) await conn.end();
    console.error('Department user registration error:', err);
    return res.status(500).json({ message: 'Database error' });
  }
});


// ====================== STUDENT REGISTRATION ======================
// POST /api/auth/register
// Purpose: Register a student under existing institute + department.
// Sample JSON:
// {
//   "first_name": "John",
//   "last_name": "Doe",
//   "email": "john.doe@techinst.com",
//   "password": "password123",
//   "role": "student",
//   "institute_id": 1,
//   "department_id": 1,
//   "phone": "9876543214"
// }
router.post('/student-register', async (req, res) => {
  const { error, value } = studentregisterSchema.validate(req.body, { abortEarly: false });
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

  let conn;
  try {
    conn = await connectToMySQL();

    // Check email uniqueness
    const [existing] = await conn.execute(
      'SELECT user_id FROM users WHERE email = ?',
      [email]
    );
    if (existing.length > 0) {
      await conn.end();
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Verify institute exists
    const [instRows] = await conn.execute(
      'SELECT institute_id FROM institutes WHERE institute_id = ?',
      [institute_id]
    );
    if (instRows.length === 0) {
      await conn.end();
      return res.status(400).json({
        message: 'Invalid institute_id. Please create institute first.'
      });
    }

    // Verify department exists under this institute
    const [deptRows] = await conn.execute(
      'SELECT department_id FROM departments WHERE department_id = ? AND institute_id = ?',
      [department_id, institute_id]
    );
    if (deptRows.length === 0) {
      await conn.end();
      return res.status(400).json({
        message: 'Invalid department_id for this institute. Create department under the institute first.'
      });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const [result] = await conn.execute(
      `INSERT INTO users
        (institute_id, department_id, email, password_hash, role, first_name, last_name, phone, is_active)
       VALUES (?, ?, ?, ?, 'student', ?, ?, ?, 1)`,
      [
        institute_id,
        department_id,
        email,
        password_hash,
        first_name,
        last_name,
        phone || null
      ]
    );

    await conn.end();

    return res.status(201).json({
      message: 'Student registered successfully',
      user_id: result.insertId
    });
  } catch (err) {
    if (conn) await conn.end();
    console.error('Student registration error:', err);
    return res.status(500).json({ message: 'Database error' });
  }
});




// ====================== UNIFIED LOGIN (ALL ROLES) - UPDATED WITH COOKIES ======================
// POST /api/auth/login
// Purpose: Authenticate institute / department / student and issue HttpOnly JWT cookie.
// Sample JSON (admin):
// { 
//   "email": "admin@techinst.com", 
//   "password": "password123", 
//   "role": "institute" 
// }
// Sample JSON (department):
// { 
//   "email": "cshead@techinst.com", 
//   "password": "password123", 
//   "role": "department" 
// }
// Sample JSON (student):
// { 
//   "email": "john.doe@techinst.com", 
//   "password": "password123", 
//   "role": "student" 
// }
// Response includes role: institute, department, or student
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
      await conn.end();
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = rows[0];

    if (user.role !== role) {
      await conn.end();
      return res.status(403).json({ message: 'Role mismatch for this account' });
    }

    if (!user.is_active) {
      await conn.end();
      return res.status(403).json({ message: 'Account is inactive' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      await conn.end();
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    await conn.execute(
      'UPDATE users SET last_login = NOW() WHERE user_id = ?',
      [user.user_id]
    );

    await conn.end();

    // Create fingerprint using your global function + device binding
    const fingerprint = createFingerprint(req);
    
    const payload = {
      user_id: user.user_id,
      role: user.role,
      institute_id: user.institute_id,
      department_id: user.department_id || null,
      fingerprint: fingerprint
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '30m' }
    );

    // Set HttpOnly cookie (NO token in response body)
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 60 * 1000  // 30 minutes
    });

    return res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.user_id,
        email: user.email,
        role: user.role,  // Returns: "institute", "department", or "student"
        institute_id: user.institute_id,
        department_id: user.department_id || null,
        first_name: user.first_name,
        last_name: user.last_name
      }
    });
  } catch (err) {
    if (conn) await conn.end();
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// ====================== NEW VERIFY ENDPOINT ======================
// GET /api/auth/verify
// Purpose: Check if user is authenticated (for React useAuth hook)
// Sample Request: GET /api/auth/verify (with cookie)
// Response: { authenticated: true/false, user: {...}, error: "optional" }
router.get('/verify', async (req, res) => {
  try {
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).json({ 
        authenticated: false, 
        user: null 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
    
    // Fingerprint verification using your global function
    const currentFingerprint = createFingerprint(req);
    if (decoded.fingerprint !== currentFingerprint) {
      return res.status(401).json({ 
        authenticated: false, 
        user: null,
        error: 'Device fingerprint mismatch'
      });
    }

    res.json({
      authenticated: true,
      user: {
        id: decoded.user_id,
        role: decoded.role,  // institute, department, student
        institute_id: decoded.institute_id,
        department_id: decoded.department_id || null
      }
    });
  } catch (err) {
    res.status(401).json({ 
      authenticated: false, 
      user: null 
    });
  }
});


module.exports = router;
