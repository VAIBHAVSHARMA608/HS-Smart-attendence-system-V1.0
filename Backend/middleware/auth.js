const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-change-me');
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Session expired, please log in again' });
  }
}

// Usage: requireRole('hr', 'md')
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not permitted for your role' });
    }
    next();
  };
}

module.exports = { verifyToken, requireRole };
