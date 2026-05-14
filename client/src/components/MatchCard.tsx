import type { Match } from '../types/match';
import type { Participant } from '../types/match';
import { ItemSlot } from './ItemSlot';

interface Props {
  match: Match;
  puuid: string;
}

const formatDuration = (seconds: number) =>
  `${Math.floor(seconds / 60)}m ${seconds % 60}s`;

const championIconUrl = (name: string) =>
  `https://ddragon.leagueoflegends.com/cdn/15.8.1/img/champion/${name}.png`;

const MatchCard = ({ match, puuid }: Props) => {
  const p = match.info.participants.find(
    (x: Participant) => x.puuid === puuid
  );

  if (!p) return null;

  const winColor = p.win ? '#10b981' : '#ef4444';

  const kda =
    p.deaths === 0
      ? 'Perfect'
      : ((p.kills + p.assists) / p.deaths).toFixed(2);

  return (
    <div
      className='match-card'
      style={{
        background: p.win
          ? 'rgba(16,185,129,0.05)'
          : 'rgba(239,68,68,0.05)',
        border: `1px solid ${
          p.win
            ? 'rgba(16,185,129,0.2)'
            : 'rgba(239,68,68,0.2)'
        }`,
      }
    }
    >
      <div
        className='match-game-vertical-label'
        style={{
          background: winColor
        }}
      />

      <img
        className='champ-icon'
        src={championIconUrl(p.championName)}
        alt={p.championName}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />

      <div className='champ-name-container'>
        <div className='champ-name-text'>
          {p.championName}
        </div>
        <div className='game-mode-infos'>
          {match.info.gameMode} · {formatDuration(match.info.gameDuration)}
        </div>
      </div>

      <div className='kda-container'>
        <div className='kda-kills'>
          {p.kills} /{' '}
          <span style={{ color: winColor }}>{p.deaths}</span> / {p.assists}
        </div>
        <div className='display-kda'>
          {kda} KDA
        </div>
      </div>

      <div className='minion-counter-container'>
        <div className='minion-counter-display' >
          {p.totalMinionsKilled}
        </div>
        <div className='cs-label'>CS</div>
      </div>

      <div className='build-container'>
        {[p.item0, p.item1, p.item2, p.item3, p.item4, p.item5, p.item6].map(
          (id, i) => (
            <ItemSlot key={i} id={id} />
          )
        )}
      </div>

      <div className='match-result'
        style={{
          color: winColor,
        }}
      >
        {p.win ? 'WIN' : 'LOSS'}
      </div>
    </div>
  );
};

export default MatchCard;