import { Router } from 'express';
import {
  getUsers,
  getUserById,
  updateUserProfile,
  promoteUserToAdmin,
  assignUserToClub,
  removeUserFromClub,
  restrictUser,
  unrestrictUser,
} from '../controllers/users';
import { checkNotRestricted } from '../middleware/checkNotRestricted';
import { authenticate } from '../middleware/auth';

const router = Router();

// Admin-only route to get all users
router.get('/', authenticate, getUsers);

// Route to get a user by ID (admin or user themselves)
router.get('/:id', authenticate, getUserById);

// Route for users to update their own profile
router.put('/:id/profile', authenticate, checkNotRestricted, updateUserProfile);

// Admin-only route to promote a user to admin
router.post('/:id/promote-to-admin', authenticate, promoteUserToAdmin);

// Admin-only route to assign a user to a club
router.post('/:id/assign-club/:clubId', authenticate, assignUserToClub);

// Admin-only route to remove a user from a club
router.post('/:id/remove-club/:clubId', authenticate, removeUserFromClub);

// Admin-only route to restrict a user
router.post('/:id/restrict', authenticate, restrictUser);

// Admin-only route to unrestrict a user
router.post('/:id/unrestrict', authenticate, unrestrictUser);

export default router;