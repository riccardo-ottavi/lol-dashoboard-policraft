import { Router, Request, Response, NextFunction } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';

const router = Router();

router.get('/discord', passport.authenticate('discord'));

router.get('/discord/callback',
  (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('discord', {
      session: false,
    }, (err: any, user: any) => {
      console.log('err:', err);
      console.log('user:', user);

      if (err || !user) {
        return res.redirect('http://localhost:5173/?error=not_in_server');
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

      console.log('token generato:', token);

      return res.redirect(`http://localhost:5173/auth/callback?token=${token}`);
    })(req, res, next);
  }
);

export default router;