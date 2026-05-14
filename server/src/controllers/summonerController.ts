import { Request, Response } from 'express';
import pool from '../db';
import { getSummonerByRiotId, getRankByPuuid } from '../services/riotService';
import { RowDataPacket } from 'mysql2';

export const linkSummoner = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).user?.id;
  const { riot_id, region } = req.body;

  if (!riot_id || !region) {
    res.status(400).json({ error: 'riot_id e region sono obbligatori' });
    return;
  }

  try {
    const riotData = await getSummonerByRiotId(riot_id, region);
    const rankData = await getRankByPuuid(riotData.puuid, region);

    await pool.execute(
      `INSERT INTO summoners (id, user_id, summoner_name, puuid, region, tier, rank_division, lp)
       VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         summoner_name = VALUES(summoner_name),
         tier = VALUES(tier),
         rank_division = VALUES(rank_division),
         lp = VALUES(lp),
         last_synced_at = NOW()`,
      [
        userId,
        `${riotData.gameName}#${riotData.tagLine}`,
        riotData.puuid,
        region,
        rankData?.tier ?? null,
        rankData?.rank ?? null,
        rankData?.leaguePoints ?? 0,
      ]
    );

    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM summoners WHERE puuid = ?',
      [riotData.puuid]
    );

    res.json({ summoner: rows[0], riotData });
  } catch (err: any) {
    console.error('linkSummoner error:', err?.response?.data || err?.message);
    if (err?.response?.status === 404) {
      res.status(404).json({ error: 'Summoner non trovato' });
      return;
    }
    res.status(500).json({ error: 'Errore collegamento summoner' });
  }
};

export const getMySummoner = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).user?.id;

  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM summoners WHERE user_id = ?',
    [userId]
  );

  if (!(rows as any[]).length) {
    res.status(404).json({ error: 'Nessun summoner collegato' });
    return;
  }

  res.json(rows[0]);
};