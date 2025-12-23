const jwt = require('jsonwebtoken');  
require('dotenv').config();



// Middleware to verify JWT and attach user_id to req
 async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization; // "Bearer <token>"

  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(400).json({ message: 'Invalid token format' });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret'); // [web:146][web:166]
    req.user = decoded; // { user_id, role, iat, exp }
    next();
  } catch (err) {
    console.error('JWT verify error:', err);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

module.exports = { authMiddleware };