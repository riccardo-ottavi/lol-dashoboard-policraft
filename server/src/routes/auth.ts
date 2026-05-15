import { Router, Request, Response, NextFunction } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';

const router = Router();

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

router.get('/discord', passport.authenticate('discord'));

router.get('/discord/callback',
  (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('discord', { session: false },
      (err: any, user: any) => {
        if (err || !user) {
          return res.redirect(`${CLIENT_URL}/?error=not_in_server`);
        }

        const token = jwt.sign(
          {
            id: user.id,
            discord_id: user.discord_id,
            username: user.username,
            avatar: user.avatar,
          },
          process.env.JWT_SECRET!,
          { expiresIn: '7d' }
        );

        return res.redirect(`${CLIENT_URL}/auth/callback?token=${token}`);
      }
    )(req, res, next);
  }
);

export default router;