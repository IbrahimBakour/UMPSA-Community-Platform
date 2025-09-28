import { Router } from 'express';
import { createComment, deleteComment, getComments } from '../controllers/comments';
import { checkNotRestricted } from '../middleware/checkNotRestricted';
import { authenticate } from '../middleware/auth';

const router = Router();

// Route to create a comment
router.post('/:postType/:postId/comments', authenticate, checkNotRestricted, createComment);

// Route to get comments for a specific post
router.get('/:postType/:postId/comments', getComments);

// Route to delete a comment
router.delete('/comments/:commentId', authenticate, checkNotRestricted, deleteComment);

export default router;