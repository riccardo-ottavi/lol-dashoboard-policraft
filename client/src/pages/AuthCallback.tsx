import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const url = new URL(window.location.href);
    const token = url.searchParams.get('token');
    const error = url.searchParams.get('error');

    if (error) {
      navigate('/?error=' + error);
      return;
    }

    if (!token) {
      navigate('/');
      return;
    }

    localStorage.setItem('token', token);

    // Controlla se ha già un summoner
    fetch('http://localhost:3001/summoners/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (res.status === 404) {
          navigate('/onboarding');
        } else {
          navigate('/dashboard');
        }
      })
      .catch(() => navigate('/onboarding'));
  }, []);

  return <p>Accesso in corso...</p>;
};

export default AuthCallback;