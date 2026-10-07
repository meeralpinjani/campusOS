const User = require('../models/User');
const { verifyAccessToken } = require('../utils/jwt');

/**
 * Middleware to protect routes that require authentication.
 * Verifies JWT access token passed in Authorization header: `Bearer <token>`
 */
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header (split 'Bearer <token>')
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = verifyAccessToken(token);

      // Fetch user from database and attach to req.user (excluding password)
      req.user = await User.findById(decoded.id).select('-passwordHash');

      if (!req.user) {
        return res.status(401).json({ message: 'User belonging to this token no longer exists' });
      }

      return next();
    } catch (error) {
      console.error('[Auth Middleware Error]:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed or expired' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

/**
 * Middleware to enforce role-based access control server-side.
 * Example usage: authorizeRoles('moderator', 'admin')
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Forbidden: Role '${req.user ? req.user.role : 'guest'}' is not authorized to perform this action`,
      });
    }
    next();
  };
};

module.exports = { protect, authorizeRoles };
