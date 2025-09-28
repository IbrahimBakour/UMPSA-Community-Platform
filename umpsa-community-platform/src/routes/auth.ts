import { Router } from 'express';
import { login, refreshToken } from '../controllers/auth';
import { validateLogin } from '../utils/validators';

const router = Router();

// Login route
router.post('/login', validateLogin, login);

// Token refresh route
router.post('/refresh-token', refreshToken);

export default router;