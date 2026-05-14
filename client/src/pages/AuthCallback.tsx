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

    fetch('http://localhost:3001/summoners/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async res => {
        if (res.status === 404) {
          navigate('/onboarding');
          return;
        }

        if (!res.ok) {
          console.error('Auth callback fetch failed:', res.status);
          navigate('/');
          return;
        }

        navigate('/dashboard');
      })
      .catch(err => {
        console.error('Auth callback error:', err);
        navigate('/onboarding');
      });
  }, [navigate]);

  return <p>Accesso in corso...</p>;
};

export default AuthCallback;