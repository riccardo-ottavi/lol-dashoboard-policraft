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

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(passport.initialize());

initDiscordStrategy();  

app.use('/auth', auth);
app.use('/summoners', summoners);

// aggiungi subito dopo
app.get('/test', (req, res) => {
  res.json({ ok: true });
});

// e questo per catturare tutto ciò che non trova rotta
app.use((req, res) => {
  console.log('404 - rotta non trovata:', req.method, req.url);
  res.status(404).json({ error: 'Not found', path: req.url });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', project: 'lol-dashboard-policraft' });
});

app.listen(PORT, () => {
  console.log(`lol-dashboard-policraft server running on port ${PORT}`);
});

export default app;