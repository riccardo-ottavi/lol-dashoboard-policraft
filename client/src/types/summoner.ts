export interface Summoner {
  id: string;
  summoner_name: string;
  region: string;
  puuid: string;
  tier: string | null;
  rank_division: string | null;
  lp: number;
}

export interface Rank {
  tier: string;
  rank: string;
  leaguePoints: number;
  wins: number;
  losses: number;
}

export interface Member {
  id: string;
  discord_username: string;
  avatar: string | null;
  discord_id: string;
  summoner_name: string;
  region: string;
  tier: string | null;
  rank_division: string | null;
  lp: number;
  puuid: string;
  last_synced_at: string | null;
}