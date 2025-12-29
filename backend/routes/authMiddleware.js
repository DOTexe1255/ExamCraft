const jwt = require('jsonwebtoken');
require('dotenv').config();
const createFingerprint = require('../global/globalFunction'); 

function authMiddleware(req, res, next) {
  // CHANGE 1: Extract from HttpOnly cookie instead of Authorization header
  const token = req.cookies.token;
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'default_secret'
    );
    
    // CHANGE 2: ADD Fingerprint verification using your global function
    const currentFingerprint = createFingerprint(req);
    if (decoded.fingerprint !== currentFingerprint) {
      return res.status(403).json({ message: 'Device fingerprint mismatch' });
    }
    
    req.user = decoded; // { user_id, role, institute_id, department_id, fingerprint, iat, exp }
    next();
  } catch (err) {
    console.error('JWT verify error:', err);
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired. Please login again.' });
    }
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

module.exports = authMiddleware;
