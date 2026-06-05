const jwt  = require('jsonwebtoken');
const User = require('../models/User');

/**
 * protect — verifies JWT and attaches user to req.user
 * Returns 401 if token is missing or invalid.
 */
const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check for Bearer token in Authorization header
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const token   = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user (without password) to the request
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    next();
  } catch (error) {
    // Token expired or tampered — return 401
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

/**
 * admin — must be used AFTER protect middleware.
 * Only allows requests from users with role === 'admin'.
 */
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Not authorized as an admin' });
};

module.exports = { protect, admin };
