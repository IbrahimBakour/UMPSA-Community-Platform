const express = require('express');
const { body } = require('express-validator');
const { validate, sanitize, authLimiter } = require('../middleware/validation');
const { authenticate, authorize } = require('../middleware/auth');
const {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('role')
    .isIn(['student', 'club_member', 'admin'])
    .withMessage('Invalid role specified'),
  body('studentId')
    .optional()
    .isLength({ min: 5, max: 20 })
    .withMessage('Student ID must be between 5 and 20 characters'),
  body('faculty')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Faculty must be between 2 and 100 characters'),
  body('year')
    .optional()
    .isInt({ min: 1, max: 6 })
    .withMessage('Year must be between 1 and 6')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match');
      }
      return true;
    })
];

const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
];

const resetPasswordValidation = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match');
      }
      return true;
    })
];

// Routes
// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', 
  sanitize,
  registerValidation,
  validate,
  authLimiter,
  register
);

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login',
  sanitize,
  loginValidation,
  validate,
  authLimiter,
  login
);

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password',
  sanitize,
  forgotPasswordValidation,
  validate,
  authLimiter,
  forgotPassword
);

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post('/reset-password',
  sanitize,
  resetPasswordValidation,
  validate,
  resetPassword
);

// @route   POST /api/auth/change-password
// @desc    Change user password
// @access  Private
router.post('/change-password',
  authenticate,
  sanitize,
  changePasswordValidation,
  validate,
  changePassword
);

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me',
  authenticate,
  getProfile
);

// @route   PUT /api/auth/me
// @desc    Update current user profile
// @access  Private
router.put('/me',
  authenticate,
  sanitize,
  updateProfile
);

// @route   POST /api/auth/logout
// @desc    Logout user (invalidate token)
// @access  Private
router.post('/logout',
  authenticate,
  logout
);

// @route   POST /api/auth/refresh
// @desc    Refresh access token
// @access  Public (with refresh token)
router.post('/refresh',
  refreshToken
);

module.exports = router;
