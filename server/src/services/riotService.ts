import axios from 'axios';

const riotClient = (baseURL: string) => {
  const apiKey = process.env.RIOT_API_KEY?.trim();
  if (!apiKey) throw new Error('Missing RIOT_API_KEY');

  return axios.create({
    baseURL,
    headers: { 'X-Riot-Token': apiKey },
  });
};

const getPlatformRoute = (region: string): string => {
  const map: Record<string, string> = {
    euw: 'euw1',   euw1: 'euw1',
    eun: 'eun1',   eun1: 'eun1',
    na: 'na1',     na1: 'na1',
    br: 'br1',     br1: 'br1',
    jp: 'jp1',     jp1: 'jp1',
    kr: 'kr',
    tr: 'tr1',     tr1: 'tr1',
    ru: 'ru',
    la1: 'la1',    la2: 'la2',
  };
  const value = map[region.trim().toLowerCase()];
  if (!value) throw new Error(`Invalid region: ${region}`);
  return value;
};

const getRegionalRoute = (region: string): string => {
  const r = region.trim().toLowerCase();
  const map: Record<string, string> = {
    euw: 'europe',  euw1: 'europe',
    eun: 'europe',  eun1: 'europe',
    tr: 'europe',   tr1: 'europe',
    ru: 'europe',
    na: 'americas', na1: 'americas',
    br: 'americas', br1: 'americas',
    la1: 'americas', la2: 'americas',
    kr: 'asia',     jp: 'asia', jp1: 'asia',
    oce: 'sea',     oc1: 'sea',
  };
  return map[r] || 'europe';
};

export const getSummonerByRiotId = async (riotId: string, region: string) => {
  const [gameName, tagLine] = riotId.split('#');
  if (!gameName || !tagLine) throw new Error('Formato non valido: usa Nome#TAG');

  const regionalRoute = getRegionalRoute(region);
  const platformRoute = getPlatformRoute(region);

  const accountClient = riotClient(`https://${regionalRoute}.api.riotgames.com`);
  const { data: account } = await accountClient.get(
    `/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`
  );

  const summonerClient = riotClient(`https://${platformRoute}.api.riotgames.com`);
  const { data: summoner } = await summonerClient.get(
    `/lol/summoner/v4/summoners/by-puuid/${encodeURIComponent(account.puuid)}`
  );

  return {
    puuid: account.puuid,
    gameName: account.gameName,
    tagLine: account.tagLine,
    summonerLevel: summoner.summonerLevel,
    profileIconId: summoner.profileIconId,
  };
};

export const getRankByPuuid = async (puuid: string, region: string) => {
  const platformRoute = getPlatformRoute(region);
  const client = riotClient(`https://${platformRoute}.api.riotgames.com`);

  const { data } = await client.get(
    `/lol/league/v4/entries/by-puuid/${encodeURIComponent(puuid)}`
  );

  return (data as any[]).find(e => e.queueType === 'RANKED_SOLO_5x5') ?? null;
};

export const getMatchIds = async (puuid: string, region: string, count = 10): Promise<string[]> => {
  const regionalRoute = getRegionalRoute(region);
  const client = riotClient(`https://${regionalRoute}.api.riotgames.com`);

  const { data } = await client.get(
    `/lol/match/v5/matches/by-puuid/${encodeURIComponent(puuid)}/ids?count=${count}`
  );

  return data;
};

export const getMatchDetail = async (matchId: string, region: string) => {
  const regionalRoute = getRegionalRoute(region);
  const client = riotClient(`https://${regionalRoute}.api.riotgames.com`);

  const { data } = await client.get(`/lol/match/v5/matches/${matchId}`);
  return data;
};