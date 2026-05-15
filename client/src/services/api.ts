const BASE_URL = 'http://localhost:3001';

const getToken = () => localStorage.getItem('token');

export const api = {
  get: async (path: string) => {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
    });

    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem('token');
      window.location.href = '/';
      return;
    }

    return res.json();
  },

  post: async (path: string, body: unknown) => {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem('token');
      window.location.href = '/';
      return;
    }

    return res.json();
  },
};