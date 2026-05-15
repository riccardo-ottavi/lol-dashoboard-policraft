import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { REGIONS } from '../types/constants';
import { api } from '../services/api';


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
    setError('Formato richiesto: Nome#TAG (es. Paolocannone22#EUW)');
    return;
  }

  setError(null);
  setSubmitting(true);

  try {
    const data = await api.post('/summoners/link', { riot_id: riotId, region });

    if (data.error) {
      setError(data.error);
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
    <div className='onboarding-container'>
      <h1>Collega il tuo account</h1>
      <p className='onboarding-subtitle'>
        Inserisci il tuo Riot ID per iniziare.
      </p>

      <div className='onboarding-form-container'>
        <input
          className='onboarding-name-input'
          type="text"
          placeholder="Nome#TAG (es. Paolocannone22#EUW)"
          value={riotId}
          onChange={e => setRiotId(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLink()}
        />

        <select
          className='onboarding-region-select'
          value={region}
          onChange={e => setRegion(e.target.value)}
        >
          {REGIONS.map(r => (
            <option key={r} value={r}>{r.toUpperCase()}</option>
          ))}
        </select>

        <button
          className='onboarding-button'
          onClick={handleLink}
          disabled={loading || submitting || !riotId}
          style={{cursor: loading || submitting || !riotId ? 'not-allowed' : 'pointer'}}>
          {loading || submitting ? 'Collegamento...' : 'Collega account →'}
        </button>
        {error && (
          <p className='submit-error-message'>{error}</p>
        )}
      </div>
    </div>
  );
};

export default Onboarding;