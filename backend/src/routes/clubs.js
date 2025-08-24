const express = require('express');
const { body, param, query } = require('express-validator');
const { validate, sanitize } = require('../middleware/validation');
const { authenticate, authorize, clubPermission } = require('../middleware/auth');
const {
  getClubs,
  createClub,
  getClub,
  updateClub,
  deleteClub,
  getClubMembers,
  addMember,
  updateMember,
  removeMember,
  joinClub,
  leaveClub,
  getClubPosts
} = require('../controllers/clubController');

const router = express.Router();

// Validation rules
const createClubValidation = [
  body('name')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Club name must be between 3 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('category')
    .isIn(['academic', 'cultural', 'sports', 'technology', 'arts', 'social', 'other'])
    .withMessage('Invalid category specified'),
  body('tags')
    .optional()
    .isArray({ min: 0, max: 10 })
    .withMessage('Tags must be an array with maximum 10 items'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Location must be less than 200 characters'),
  body('contact.email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid contact email'),
  body('contact.phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  body('meetingInfo.schedule')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Meeting schedule must be less than 200 characters'),
  body('meetingInfo.location')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Meeting location must be less than 200 characters')
];

const updateClubValidation = [
  param('clubId')
    .isMongoId()
    .withMessage('Invalid club ID'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Club name must be between 3 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('category')
    .optional()
    .isIn(['academic', 'cultural', 'sports', 'technology', 'arts', 'social', 'other'])
    .withMessage('Invalid category specified')
];

const addMemberValidation = [
  param('clubId')
    .isMongoId()
    .withMessage('Invalid club ID'),
  body('userId')
    .isMongoId()
    .withMessage('Invalid user ID'),
  body('role')
    .optional()
    .isIn(['member', 'leader', 'moderator'])
    .withMessage('Invalid role specified'),
  body('permissions')
    .optional()
    .isArray()
    .withMessage('Permissions must be an array')
];

// Routes
// @route   GET /api/clubs
// @desc    Get all clubs with pagination and filters
// @access  Public
router.get('/', getClubs);

// @route   POST /api/clubs
// @desc    Create a new club
// @access  Admin only
router.post('/',
  authenticate,
  authorize('admin'),
  sanitize,
  createClubValidation,
  validate,
  createClub
);

// @route   GET /api/clubs/:clubId
// @desc    Get club by ID with detailed information
// @access  Public
router.get('/:clubId',
  param('clubId').isMongoId().withMessage('Invalid club ID'),
  validate,
  getClub
);

// @route   PUT /api/clubs/:clubId
// @desc    Update club information
// @access  Club leader or admin
router.put('/:clubId',
  authenticate,
  clubPermission('manage_club'),
  sanitize,
  updateClubValidation,
  validate,
  updateClub
);

// @route   DELETE /api/clubs/:clubId
// @desc    Delete club (admin only)
// @access  Admin only
router.delete('/:clubId',
  authenticate,
  authorize('admin'),
  param('clubId').isMongoId().withMessage('Invalid club ID'),
  validate,
  deleteClub
);

// @route   GET /api/clubs/:clubId/members
// @desc    Get club members with pagination
// @access  Public
router.get('/:clubId/members',
  param('clubId').isMongoId().withMessage('Invalid club ID'),
  validate,
  getClubMembers
);

// @route   POST /api/clubs/:clubId/members
// @desc    Add member to club
// @access  Club leader or admin
router.post('/:clubId/members',
  authenticate,
  clubPermission('manage_members'),
  sanitize,
  addMemberValidation,
  validate,
  addMember
);

// @route   PUT /api/clubs/:clubId/members/:userId
// @desc    Update member role/permissions
// @access  Club leader or admin
router.put('/:clubId/members/:userId',
  authenticate,
  clubPermission('manage_members'),
  param('clubId').isMongoId().withMessage('Invalid club ID'),
  param('userId').isMongoId().withMessage('Invalid user ID'),
  validate,
  updateMember
);

// @route   DELETE /api/clubs/:clubId/members/:userId
// @desc    Remove member from club
// @access  Club leader or admin
router.delete('/:clubId/members/:userId',
  authenticate,
  clubPermission('manage_members'),
  param('clubId').isMongoId().withMessage('Invalid club ID'),
  param('userId').isMongoId().withMessage('Invalid user ID'),
  validate,
  removeMember
);

// @route   POST /api/clubs/:clubId/join
// @desc    Join club (request membership)
// @access  Authenticated users
router.post('/:clubId/join',
  authenticate,
  param('clubId').isMongoId().withMessage('Invalid club ID'),
  validate,
  joinClub
);

// @route   POST /api/clubs/:clubId/leave
// @desc    Leave club
// @access  Club members
router.post('/:clubId/leave',
  authenticate,
  clubPermission('view_club'),
  param('clubId').isMongoId().withMessage('Invalid club ID'),
  validate,
  leaveClub
);

// @route   GET /api/clubs/:clubId/posts
// @desc    Get club posts with pagination
// @access  Public
router.get('/:clubId/posts',
  param('clubId').isMongoId().withMessage('Invalid club ID'),
  validate,
  getClubPosts
);

module.exports = router;
