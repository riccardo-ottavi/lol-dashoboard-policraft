export interface Participant {
  puuid: string;
  championName: string;
  kills: number;
  deaths: number;
  assists: number;
  win: boolean;
  totalMinionsKilled: number;
  item0: number; item1: number; item2: number;
  item3: number; item4: number; item5: number; item6: number;
}

export interface Match {
  metadata: { matchId: string };
  info: {
    gameDuration: number;
    gameMode: string;
    participants: Participant[];
  };
}