import { Router } from 'express';
import { linkSummoner, getMySummoner } from '../controllers/summonerController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { getProfile } from '../controllers/summonerController';

const router = Router();

router.use(authMiddleware);

router.post('/link', linkSummoner);
router.get('/me', getMySummoner);
router.get('/profile', authMiddleware, getProfile);

export default router;