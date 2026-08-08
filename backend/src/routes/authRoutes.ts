import { Router } from 'express';
import { register, login, logout, me } from '../controllers/authController';
import { requireAuth } from '../middleware/authMiddleware';
import { validateBody } from '../middleware/validatorMiddleware';
import { validateRegister, validateLogin } from '../validators/authValidators';
import { authRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// Apply brute-force protection rate limiter on register and login endpoints
router.post('/register', authRateLimiter, validateBody(validateRegister), register);
router.post('/login', authRateLimiter, validateBody(validateLogin), login);

// Secure endpoints requiring active JWT credentials session
router.post('/logout', requireAuth, logout);
router.get('/me', requireAuth, me);

export default router;
