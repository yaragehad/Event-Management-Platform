const authMiddleware = (req, res, next) => {
  const userId = req.headers['x-user-id'];
  const userRole = req.headers['x-user-role'];

  if (!userId || !userRole) {
    return res.status(401).json({ error: 'Unauthorized - missing user info' });
  }

  req.userId = parseInt(userId);
  req.userRole = userRole;
  next();
};

module.exports = authMiddleware;