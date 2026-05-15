const BASE_URL = 'http://localhost:3001';

const getToken = () => localStorage.getItem('token');

export const api = {
  get: (path: string) =>
    fetch(`${BASE_URL}${path}`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
    }).then(res => res.json()),

  post: (path: string, body: unknown) =>
    fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }).then(res => res.json()),
};