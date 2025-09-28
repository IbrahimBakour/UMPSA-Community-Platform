import { Router } from 'express';
import { 
    createFeedPost, 
    getApprovedPosts, 
    getPendingPosts, 
    approvePost, 
    rejectPost, 
    deletePost 
} from '../controllers/feed';
import { checkNotRestricted } from '../middleware/checkNotRestricted';
import { authenticate } from '../middleware/auth';

const router = Router();

// Route to create a feed post
router.post('/', authenticate, checkNotRestricted, createFeedPost);

// Route to get approved feed posts
router.get('/', getApprovedPosts);

// Route to get pending feed posts (admin only)
router.get('/pending', authenticate, approvePost);

// Route to approve a pending post (admin only)
router.post('/:id/approve', authenticate, approvePost);

// Route to reject a pending post (admin only)
router.post('/:id/reject', authenticate, rejectPost);

// Route to delete a post (admin only)
router.delete('/:id', authenticate, deletePost);

export default router;