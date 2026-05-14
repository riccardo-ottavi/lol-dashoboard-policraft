import { Router } from 'express';
import { linkSummoner, getMySummoner } from '../controllers/summonerController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.post('/link', linkSummoner);
router.get('/me', getMySummoner);

export default router;