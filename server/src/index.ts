import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import passport from 'passport';
import authRoutes from './routes/auth';
import { initDiscordStrategy } from './auth/discordStrategy';
import summonerRoutes from './routes/summoners';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(passport.initialize());

initDiscordStrategy();  

app.use('/auth', authRoutes);
app.use('/summoners', summonerRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', project: 'lol-dashboard-policraft' });
});

app.listen(PORT, () => {
  console.log(`lol-dashboard-policraft server running on port ${PORT}`);
});

export default app;