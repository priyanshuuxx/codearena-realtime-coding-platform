import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:5050/api/v1',
});

api.interceptors.request.use((config) => {
  const saved = localStorage.getItem('codearena_auth');

  if (saved && !config.headers.Authorization) {
    try {
      const auth = JSON.parse(saved);

      if (auth.token) {
        config.headers.Authorization = `Bearer ${auth.token}`;
      }
    } catch {
      localStorage.removeItem('codearena_auth');
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('codearena_auth');
      window.dispatchEvent(new window.Event('codearena:auth-expired'));
    }

    return Promise.reject(error);
  },
);

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    return;
  }

  delete api.defaults.headers.common.Authorization;
}
