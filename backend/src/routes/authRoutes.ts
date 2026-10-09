import { Router } from 'express';
import { googleLogin, getCurrentUser } from '../controllers/authController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/google', googleLogin);
router.post('/google/verify', googleLogin);
router.get('/me', requireAuth, getCurrentUser);

export default router;
