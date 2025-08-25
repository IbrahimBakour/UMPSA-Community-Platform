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
  // Accept either 'name' OR both 'firstName' and 'lastName'
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body()
    .custom((value) => {
      const hasName = typeof value.name === 'string' && value.name.trim().length >= 2;
      const hasFirstLast = typeof value.firstName === 'string' && value.firstName.trim().length >= 2 && typeof value.lastName === 'string' && value.lastName.trim().length >= 2;
      if (!hasName && !hasFirstLast) {
        throw new Error('Provide either name or both firstName and lastName');
      }
      return true;
    }),
  body('role')
    .optional()
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
router.post('/register', 
  sanitize,
  registerValidation,
  validate,
  authLimiter,
  register
);

router.post('/login',
  sanitize,
  loginValidation,
  validate,
  authLimiter,
  login
);

router.post('/forgot-password',
  sanitize,
  forgotPasswordValidation,
  validate,
  authLimiter,
  forgotPassword
);

router.post('/reset-password',
  sanitize,
  resetPasswordValidation,
  validate,
  resetPassword
);

router.post('/change-password',
  authenticate,
  sanitize,
  changePasswordValidation,
  validate,
  changePassword
);

router.get('/me',
  authenticate,
  getProfile
);

router.put('/me',
  authenticate,
  sanitize,
  updateProfile
);

router.post('/logout',
  authenticate,
  logout
);

router.post('/refresh',
  refreshToken
);

module.exports = router;
