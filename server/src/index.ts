import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import passport from 'passport';
import auth from './routes/auth';
import { initDiscordStrategy } from './auth/discordStrategy';
import summoners from './routes/summoners';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(passport.initialize());

initDiscordStrategy();

app.use('/auth', auth);
app.use('/summoners', summoners);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', project: 'lol-dashboard-policraft' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found', path: req.url });
});

app.listen(PORT, () => {
  console.log(`lol-dashboard-policraft server running on port ${PORT}`);
});

export default app;