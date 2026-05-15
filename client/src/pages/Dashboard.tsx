import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import type { Summoner } from '../types/summoner';
import type { Rank } from '../types/summoner';
import type { Participant, Match } from '../types/match';
import { TIER_COLORS } from '../types/constants'
import MatchCard from '../components/MatchCard';
import { api } from '../services/api';

const profileIconUrl = (id: number) =>
  `https://ddragon.leagueoflegends.com/cdn/15.8.1/img/profileicon/${id}.png`;

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
        const data = await api.get('/summoners/profile');

        if (data.error === 'Nessun summoner collegato') {
          navigate('/onboarding');
          return;
        }

        setSummoner(data.summoner);
        setRank(data.rank);
        setMatches(data.matches);
        console.log("SUMMONER PUUID:", data.summoner.puuid);
console.log("MATCHES:", data.matches);

const p = data.matches[0]?.info.participants.find(
  (x: Participant) => x.puuid === data.summoner.puuid
);

console.log("PARTICIPANT TROVATO:", p);
console.log("PROFILE ICON:", p?.profileIcon);

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
    <div className='dashboard-loading'>
      Caricamento...
    </div>
  );

  const tierColor = rank ? (TIER_COLORS[rank.tier] ?? '#94a3b8') : '#94a3b8';
  const winRate = rank ? Math.round((rank.wins / (rank.wins + rank.losses)) * 100) : null;

  return (
    <div className='dashboard-container'>

      <header className='dashboard-header'>
        <span className='dashboard-name'>
          lol-dashboard-policraft
        </span>
        <div className='dashboard-user-recap'>
          {user?.avatar && (
            <img
              className='dashboard-user-image'
              src={`https://cdn.discordapp.com/avatars/${user.discord_id}/${user.avatar}.png`}
              alt={user.username}
            />
          )}
          <button
            onClick={() => navigate('/group')}
            className='to-group-button'
          >
            Gruppo
          </button>
          <span className='dashboard-user-name'>{user?.username}</span>
          <button className='dashboard-logout-button' onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <main className='dashboard-main-section'>
        {summoner && (
          <div className='games-history'>
            {profileIconId ? (
              <img
                className='dashboard-big-profile-pic'
                src={profileIconUrl(profileIconId)}
                alt="icon"
                style={{ border: `3px solid ${tierColor}44` }}
              />
            ) : (
              <div className='dashboard-big-profile-pic' style={{ background: 'rgba(255,255,255,0.05)' }} />
            )}

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{summoner.summoner_name}</div>
              <div className='dashboard-region-label'>
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
              <div className='dashboard-unranked-label'>
                Unranked
              </div>
            )}
          </div>
        )}

        <h2 className='history-title-label'>
          ULTIME PARTITE
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {matches.length === 0
            ? <p style={{ color: '#475569', fontSize: 14 }}>Nessuna partita trovata.</p>
            : matches.map(match => (
              <MatchCard
                key={match.metadata.matchId}
                match={match}
                puuid={summoner?.puuid ?? ''}
              />
            ))
          }
        </div>
      </main>
    </div>
  );
};

export default Dashboard;