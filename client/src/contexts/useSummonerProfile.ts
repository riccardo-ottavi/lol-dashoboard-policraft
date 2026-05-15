import { useEffect, useState } from 'react';
import { api } from '../services/api';

export const useSummonerProfile = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/summoners/profile')
      .then(json => setData(json))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
};