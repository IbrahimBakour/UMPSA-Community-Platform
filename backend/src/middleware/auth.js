const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authConfig } = require('../config/auth');

// Verify JWT token and attach user to request
const authenticate = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Check for token in cookies
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: { message: 'Access denied. No token provided.' }
      });
    }

    // Verify token
    const decoded = jwt.verify(token, authConfig.jwt.secret);
    
    // Get user from database
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: { message: 'User not found.' }
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: { message: 'Account is deactivated.' }
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid token.' }
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: { message: 'Token expired.' }
      });
    }
    
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      error: { message: 'Authentication error.' }
    });
  }
};

// Optional authentication - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      const decoded = jwt.verify(token, authConfig.jwt.secret);
      const user = await User.findById(decoded.id).select('-password');
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

// Role-based access control
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Authentication required.' }
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: { message: 'Access denied. Insufficient permissions.' }
      });
    }

    next();
  };
};

// Club-specific permissions
const clubPermission = (permission) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: { message: 'Authentication required.' }
        });
      }

      const clubId = req.params.clubId || req.body.clubId;
      if (!clubId) {
        return res.status(400).json({
          success: false,
          error: { message: 'Club ID is required.' }
        });
      }

      // Admin has all permissions
      if (req.user.role === 'admin') {
        return next();
      }

      // Check club membership and permissions
      const ClubMember = require('../models/ClubMember');
      const membership = await ClubMember.findOne({
        user: req.user._id,
        club: clubId,
        status: 'active'
      });

      if (!membership) {
        return res.status(403).json({
          success: false,
          error: { message: 'Not a member of this club.' }
        });
      }

      // Check specific permission
      if (!membership.permissions.includes(permission)) {
        return res.status(403).json({
          success: false,
          error: { message: 'Insufficient permissions for this action.' }
        });
      }

      // Attach membership info for use in controllers
      req.membership = membership;
      next();
    } catch (error) {
      console.error('Club permission middleware error:', error);
      return res.status(500).json({
        success: false,
        error: { message: 'Permission check failed.' }
      });
    }
  };
};

module.exports = {
  authenticate,
  optionalAuth,
  authorize,
  clubPermission
};
