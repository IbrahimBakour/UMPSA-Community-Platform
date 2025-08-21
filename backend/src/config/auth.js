const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const authConfig = {
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRE || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-key',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRE || '30d',
  },

  // Password Configuration
  password: {
    saltRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
    minLength: 6,
    requireSpecialChar: false,
    requireNumber: false,
    requireUppercase: false,
  },

  // Session Configuration
  session: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) * 60 * 1000 || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: 'Too many requests from this IP, please try again later.',
  },
};

// Password hashing utility
const hashPassword = async (password) => {
  return await bcrypt.hash(password, authConfig.password.saltRounds);
};

// Password verification utility
const verifyPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Generate JWT token
const generateToken = (payload) => {
  return jwt.sign(payload, authConfig.jwt.secret, {
    expiresIn: authConfig.jwt.expiresIn,
  });
};

// Generate refresh token
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, authConfig.jwt.refreshSecret, {
    expiresIn: authConfig.jwt.refreshExpiresIn,
  });
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, authConfig.jwt.secret);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

// Verify refresh token
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, authConfig.jwt.refreshSecret);
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

module.exports = {
  authConfig,
  hashPassword,
  verifyPassword,
  generateToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
};
