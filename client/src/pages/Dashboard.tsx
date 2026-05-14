import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Summoner {
  id: string;
  summoner_name: string;
  region: string;
  puuid: string;
  tier: string | null;
  rank_division: string | null;
  lp: number;
}

interface Rank {
  tier: string;
  rank: string;
  leaguePoints: number;
  wins: number;
  losses: number;
}

interface Match {
  metadata: { matchId: string };
  info: {
    gameDuration: number;
    gameMode: string;
    participants: Participant[];
  };
}

interface Participant {
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

const TIER_COLORS: Record<string, string> = {
  IRON: '#6b7280',
  BRONZE: '#cd7f32',
  SILVER: '#94a3b8',
  GOLD: '#f59e0b',
  PLATINUM: '#22d3ee',
  EMERALD: '#10b981',
  DIAMOND: '#818cf8',
  MASTER: '#a855f7',
  GRANDMASTER: '#ef4444',
  CHALLENGER: '#facc15',
};

const formatDuration = (seconds: number) =>
  `${Math.floor(seconds / 60)}m ${seconds % 60}s`;

const championIconUrl = (name: string) =>
  `https://ddragon.leagueoflegends.com/cdn/15.8.1/img/champion/${name}.png`;

const itemUrl = (id: number) =>
  id ? `https://ddragon.leagueoflegends.com/cdn/15.8.1/img/item/${id}.png` : null;

const profileIconUrl = (id: number) =>
  `https://ddragon.leagueoflegends.com/cdn/15.8.1/img/profileicon/${id}.png`;

const ItemSlot = ({ id }: { id: number }) => {
  const url = itemUrl(id);
  return (
    <div style={{
      width: 28, height: 28, borderRadius: 4,
      background: url ? 'transparent' : 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.1)',
      overflow: 'hidden', flexShrink: 0,
    }}>
      {url && <img src={url} alt="" style={{ width: '100%', height: '100%' }} />}
    </div>
  );
};

const MatchCard = ({ match, puuid }: { match: Match; puuid: string }) => {
  const p = match.info.participants.find(x => x.puuid === puuid);
  if (!p) return null;

  const winColor = p.win ? '#10b981' : '#ef4444';
  const kda = p.deaths === 0 ? 'Perfect' : ((p.kills + p.assists) / p.deaths).toFixed(2);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 16px', borderRadius: 10,
      background: p.win ? 'rgba(16,185,129,0.05)' : 'rgba(239,68,68,0.05)',
      border: `1px solid ${p.win ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
    }}>
      <div style={{ width: 3, alignSelf: 'stretch', borderRadius: 4, background: winColor, flexShrink: 0 }} />

      <img
        src={championIconUrl(p.championName)}
        alt={p.championName}
        style={{ width: 44, height: 44, borderRadius: 8 }}
        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
      />

      <div style={{ minWidth: 110 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: '#f1f5f9' }}>{p.championName}</div>
        <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
          {match.info.gameMode} · {formatDuration(match.info.gameDuration)}
        </div>
      </div>

      <div style={{ textAlign: 'center', minWidth: 80 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>
          {p.kills} / <span style={{ color: winColor }}>{p.deaths}</span> / {p.assists}
        </div>
        <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>{kda} KDA</div>
      </div>

      <div style={{ textAlign: 'center', minWidth: 48 }}>
        <div style={{ fontSize: 13, color: '#94a3b8' }}>{p.totalMinionsKilled}</div>
        <div style={{ fontSize: 10, color: '#475569' }}>CS</div>
      </div>

      <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', maxWidth: 130, marginLeft: 'auto' }}>
        {[p.item0, p.item1, p.item2, p.item3, p.item4, p.item5, p.item6].map((id, i) => (
          <ItemSlot key={i} id={id} />
        ))}
      </div>

      <div style={{ fontSize: 11, fontWeight: 700, color: winColor, minWidth: 36, textAlign: 'right' }}>
        {p.win ? 'WIN' : 'LOSS'}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const [summoner, setSummoner] = useState<Summoner | null>(null);
  const [rank, setRank] = useState<Rank | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileIconId, setProfileIconId] = useState<number>(0);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('http://localhost:3001/summoners/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 404) {
          navigate('/onboarding');
          return;
        }

        const data = await res.json();
        setSummoner(data.summoner);
        setRank(data.rank);
        setMatches(data.matches);

        // Prendi profileIconId dal primo match
        if (data.matches.length > 0) {
          const p = data.matches[0].info.participants.find(
            (x: Participant) => x.puuid === data.summoner.puuid
          );
          if (p?.profileIcon) setProfileIconId(p.profileIcon);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0a0f1a', color: '#f1f5f9' }}>
      Caricamento...
    </div>
  );

  const tierColor = rank ? (TIER_COLORS[rank.tier] ?? '#94a3b8') : '#94a3b8';
  const winRate = rank ? Math.round((rank.wins / (rank.wins + rank.losses)) * 100) : null;

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1a', color: '#f1f5f9', fontFamily: 'system-ui, sans-serif' }}>

      {/* Header */}
      <header style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 32px', borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(10,15,26,0.85)',
      }}>
        <span style={{ fontWeight: 700, fontSize: 16, color: '#6366f1' }}>
          lol-dashboard-policraft
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {user?.avatar && (
            <img
              src={`https://cdn.discordapp.com/avatars/${user.discord_id}/${user.avatar}.png`}
              alt={user.username}
              style={{ width: 32, height: 32, borderRadius: '50%' }}
            />
          )}
          <span style={{ fontSize: 14, color: '#94a3b8' }}>{user?.username}</span>
          <button onClick={logout} style={{
            background: 'none', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8, padding: '6px 14px', color: '#94a3b8',
            cursor: 'pointer', fontSize: 13,
          }}>
            Logout
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 860, margin: '0 auto', padding: '40px 24px' }}>

        {/* Summoner card */}
        {summoner && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 20,
            padding: '24px', borderRadius: 14,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            marginBottom: 32,
          }}>
            {profileIconId ? (
              <img
                src={profileIconUrl(profileIconId)}
                alt="icon"
                style={{ width: 72, height: 72, borderRadius: 12, border: `3px solid ${tierColor}44` }}
              />
            ) : (
              <div style={{ width: 72, height: 72, borderRadius: 12, background: 'rgba(255,255,255,0.05)' }} />
            )}

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{summoner.summoner_name}</div>
              <div style={{ fontSize: 13, color: '#475569', marginTop: 4 }}>
                {summoner.region.toUpperCase()}
              </div>
            </div>

            {rank ? (
              <div style={{
                textAlign: 'center', padding: '12px 20px', borderRadius: 10,
                background: `${tierColor}11`, border: `1px solid ${tierColor}33`,
              }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: tierColor }}>
                  {rank.tier} {rank.rank}
                </div>
                <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 2 }}>
                  {rank.leaguePoints} LP
                </div>
                <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>
                  {rank.wins}W {rank.losses}L · {winRate}% WR
                </div>
              </div>
            ) : (
              <div style={{
                padding: '12px 20px', borderRadius: 10,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                color: '#475569', fontSize: 13,
              }}>
                Unranked
              </div>
            )}
          </div>
        )}

        {/* Match history */}
        <h2 style={{ fontSize: 14, fontWeight: 600, color: '#475569', marginBottom: 12, letterSpacing: '0.08em' }}>
          ULTIME PARTITE
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {matches.length === 0
            ? <p style={{ color: '#475569', fontSize: 14 }}>Nessuna partita trovata.</p>
            : matches.map(match => (
              <MatchCard key={match.metadata.matchId} match={match} puuid={summoner?.puuid ?? ''} />
            ))
          }
        </div>
      </main>
    </div>
  );
};

export default Dashboard;