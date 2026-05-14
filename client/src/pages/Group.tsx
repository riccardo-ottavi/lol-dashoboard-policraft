import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { TIER_COLORS } from '../types/constants';
import type { Member } from '../types/summoner';

const discordAvatarUrl = (discordId: string, avatar: string) =>
    `https://cdn.discordapp.com/avatars/${discordId}/${avatar}.png`;

const Group = () => {
    const { token } = useAuth();
    const navigate = useNavigate();

    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGroup = async () => {
            try {
                const res = await fetch('http://localhost:3001/summoners/group', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                setMembers(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchGroup();
    }, []);

    if (loading) return (
        <div className='group-page-loading'>
            Caricamento...
        </div>
    );

    const ranked = members.filter(m => m.tier);
    const unranked = members.filter(m => !m.tier);

    return (
        <div className='group-page-container'>
            <header className='group-page-header'>
                <span className='group-discord-name'>
                    lol-dashboard-policraft
                </span>
                <div style={{ display: 'flex', gap: 12 }}>
                    <button className='to-profile-button'
                        onClick={() => navigate('/dashboard')}
                    >
                        Il mio profilo
                    </button>
                </div>
            </header>

            <main className="group-page">
                <h1 className='group-page-title'
                    style={{
                        background: 'linear-gradient(135deg, #f1f5f9 40%, #6366f1)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    }}>
                    Leaderboard Gruppo
                </h1>
                <p className='group-subtitle'>
                    {members.length} membri registrati
                </p>

                {ranked.length > 0 && (
                    <div style={{ marginBottom: 32 }}>
                        <h2 className='ranked-label'>
                            RANKED
                        </h2>
                        <div className="member-card">
                            {ranked.map((member, index) => {
                                const tierColor = TIER_COLORS[member.tier!] ?? '#94a3b8';
                                return (
                                    <div
                                        key={member.id}
                                        className='member-card-infos'
                                        onMouseEnter={e => (e.currentTarget.style.transform = 'translateX(4px)')}
                                        onMouseLeave={e => (e.currentTarget.style.transform = 'translateX(0)')}
                                        onClick={() => navigate(`/profile/${member.id}`)}
                                    >

                                        <div style={{
                                            width: 28, textAlign: 'center',
                                            fontSize: index < 3 ? 18 : 14,
                                            fontWeight: 700,
                                            color: index === 0 ? '#facc15' : index === 1 ? '#94a3b8' : index === 2 ? '#cd7f32' : '#475569',
                                        }}>
                                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                                        </div>

                                        {member.avatar ? (
                                            <img
                                                src={discordAvatarUrl(member.discord_id, member.avatar)}
                                                alt={member.discord_username}
                                                style={{ border: `2px solid ${tierColor}44` }}
                                                className='member-icon'
                                            />
                                        ) : (
                                            <div style={{ background: 'rgba(255,255,255,0.05)' }}
                                                className='member-icon'
                                            />
                                        )}

                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 600, fontSize: 15 }}>{member.summoner_name}</div>
                                            <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>
                                                {member.discord_username} · {member.region.toUpperCase()}
                                            </div>
                                        </div>

                                        <div style={{
                                            textAlign: 'right',
                                            padding: '8px 16px', borderRadius: 8,
                                            background: `${tierColor}11`,
                                            border: `1px solid ${tierColor}33`,
                                        }}>
                                            <div style={{ fontSize: 15, fontWeight: 800, color: tierColor }}>
                                                {member.tier} {member.rank_division}
                                            </div>
                                            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 1 }}>
                                                {member.lp} LP
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {unranked.length > 0 && (
                    <div>
                        <h2 className='ranked-label'>
                            UNRANKED
                        </h2>
                        <div className="member-card">
                            {unranked.map(member => (
                                <div
                                    key={member.id}
                                    className='member-card-infos'
                                >
                                    {member.avatar ? (
                                        <img
                                            className='member-icon'
                                            src={discordAvatarUrl(member.discord_id, member.avatar)}
                                            alt={member.discord_username}
                                        />
                                    ) : (
                                        <div className='member-icon' style={{ background: 'rgba(255,255,255,0.05)' }} />
                                    )}
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, fontSize: 15 }}>{member.summoner_name}</div>
                                        <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>
                                            {member.discord_username} · {member.region.toUpperCase()}
                                        </div>
                                    </div>
                                    <div className='unranked-display'>Unranked</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
};

export default Group;