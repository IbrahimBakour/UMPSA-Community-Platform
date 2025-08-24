const { validationResult } = require('express-validator');

// Check for validation errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.param,
      message: error.msg,
      value: error.value
    }));

    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        details: errorMessages
      }
    });
  }
  
  next();
};

// Sanitize request data
const sanitize = (req, res, next) => {
  // Sanitize body
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        // Remove HTML tags and trim whitespace
        req.body[key] = req.body[key]
          .replace(/<[^>]*>/g, '')
          .trim();
      }
    });
  }

  // Sanitize query parameters
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = req.query[key]
          .replace(/<[^>]*>/g, '')
          .trim();
      }
    });
  }

  next();
};

// Rate limiting middleware
const rateLimit = require('express-rate-limit');

const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: { message }
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Specific rate limiters
const authLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  5, // 5 requests per window
  'Too many authentication attempts. Please try again later.'
);

const apiLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  100, // 100 requests per window
  'Too many API requests. Please try again later.'
);

const uploadLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  10, // 10 uploads per hour
  'Too many file uploads. Please try again later.'
);

module.exports = {
  validate,
  sanitize,
  rateLimit,
  createRateLimiter,
  authLimiter,
  apiLimiter,
  uploadLimiter
};
