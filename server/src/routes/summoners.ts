import { Router } from 'express';
import { linkSummoner, getMySummoner, getProfile, getGroupDashboard } from '../controllers/summonerController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.post('/link', linkSummoner);
router.get('/me', getMySummoner);
router.get('/profile', getProfile);
router.get('/group', getGroupDashboard);

export default router;