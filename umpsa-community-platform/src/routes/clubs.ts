import { Router } from 'express';
import {
  createClub,
  getClubs,
  getClubById,
  updateClub,
  addMemberToClub,
  removeMemberFromClub,
  deleteClub,
} from '../controllers/clubs';
import { checkNotRestricted } from '../middleware/checkNotRestricted';
import { authenticate } from '../middleware/auth';

const router = Router();

// Admin-only routes
router.post('/', authenticate, checkNotRestricted, createClub);
router.put('/:id', authenticate, checkNotRestricted, updateClub);
router.post('/:id/add-member', authenticate, checkNotRestricted, addMemberToClub);
router.post('/:id/remove-member', authenticate, checkNotRestricted, removeMemberFromClub);
router.delete('/:id', authenticate, checkNotRestricted, deleteClub);

// Public routes
router.get('/', getClubs);
router.get('/:id', getClubById);

export default router;