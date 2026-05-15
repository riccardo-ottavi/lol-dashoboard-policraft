import passport from 'passport';
import DiscordStrategy from 'passport-discord';
import pool from '../db';
import { RowDataPacket } from 'mysql2';

export const initDiscordStrategy = () => {
  passport.use('discord', new DiscordStrategy.Strategy({
    clientID: process.env.DISCORD_CLIENT_ID!,
    clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    callbackURL: process.env.DISCORD_REDIRECT_URI!,
    scope: ['identify', 'guilds.members.read'],
  }, async (accessToken, _refreshToken, profile, done) => {
    try {
      const res = await fetch(
        `https://discord.com/api/users/@me/guilds/${process.env.DISCORD_GUILD_ID}/member`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (!res.ok) {
        console.warn(`Accesso negato: utente ${profile.username} non è nel server Discord.`);
        return done(null, false);

      }

      await pool.execute(
        `INSERT INTO users (discord_id, username, avatar)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE
           username = VALUES(username),
           avatar = VALUES(avatar)`,
        [profile.id, profile.username, profile.avatar ?? null]
      );

      const [rows] = await pool.execute<RowDataPacket[]>(
        'SELECT * FROM users WHERE discord_id = ?',
        [profile.id]
      );

      return done(null, rows[0]);
    } catch (err) {
      return done(err as Error);
    }
  }));
};