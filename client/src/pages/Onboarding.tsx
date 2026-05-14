import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const REGIONS = ['euw', 'na', 'kr', 'eun', 'br', 'jp', 'tr', 'ru', 'la1', 'la2'];

const Onboarding = () => {
  const { token, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !token) {
      navigate('/');
    }
  }, [token, loading, navigate]);

  const [riotId, setRiotId] = useState('');
  const [region, setRegion] = useState('euw');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLink = async () => {
    if (!riotId.includes('#')) {
      setError('Formato richiesto: Nome#TAG (es. MaryahCarry#EUW)');
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch('http://localhost:3001/summoners/link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ riot_id: riotId, region }),
      });

      const data = await res.json();
      console.log('status:', res.status);
      console.log('data:', data);

      if (!res.ok) {
        setError(data.error || 'Errore collegamento');
        return;
      }

      navigate('/dashboard');
    } catch {
      setError('Errore di rete. Riprova.');
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div style={{ padding: '48px 32px', maxWidth: 480, margin: '0 auto' }}>
      <h1>Collega il tuo account</h1>
      <p style={{ color: '#888', margin: '8px 0 32px' }}>
        Inserisci il tuo Riot ID per iniziare.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input
          type="text"
          placeholder="Nome#TAG (es. MaryahCarry#EUW)"
          value={riotId}
          onChange={e => setRiotId(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLink()}
          style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #ccc', fontSize: 15 }}
        />

        <select
          value={region}
          onChange={e => setRegion(e.target.value)}
          style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #ccc', fontSize: 14 }}
        >
          {REGIONS.map(r => (
            <option key={r} value={r}>{r.toUpperCase()}</option>
          ))}
        </select>

        <button
          onClick={handleLink}
          disabled={loading || submitting || !riotId}
          style={{
            padding: '12px',
            borderRadius: 8,
            background: '#5865F2',
            color: '#fff',
            border: 'none',
            fontWeight: 600,
            fontSize: 15,
            cursor: loading || submitting || !riotId ? 'not-allowed' : 'pointer',
          }}
        >
          {loading || submitting ? 'Collegamento...' : 'Collega account →'}
        </button>

        {error && (
          <p style={{ color: '#ef4444', fontSize: 13 }}>{error}</p>
        )}
      </div>
    </div>
  );
};

export default Onboarding;