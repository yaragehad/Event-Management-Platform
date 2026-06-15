const jwt = require('jsonwebtoken');

// 1. The Bouncer: Checks if they are logged in at all
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach the user data to the request
    next(); 
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

// 2. The VIP List: Checks if they have the right job title
const requireRole = (requiredRole) => {
  return (req, res, next) => {
    // req.user was attached by verifyToken right above this!
    if (!req.user || req.user.role !== requiredRole) {
      return res.status(403).json({ message: `Forbidden: Only ${requiredRole}s can perform this action.` });
    }
    next();
  };
};

module.exports = { verifyToken, requireRole };