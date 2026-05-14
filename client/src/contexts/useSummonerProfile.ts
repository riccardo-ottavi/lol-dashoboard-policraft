import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const useSummonerProfile = () => {
  const { token } = useAuth();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    const fetchProfile = async () => {
      try {
        const res = await fetch('http://localhost:3001/summoners/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const json = await res.json();
        setData(json);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  return { data, loading };
};