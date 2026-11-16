import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api, setAuthToken } from '../lib/api.js';

const AuthContext = createContext(null);
const storageKey = 'codearena_auth';

export function AuthProvider({ children }) {
  const [isReady, setIsReady] = useState(false);
  const [auth, setAuth] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : { user: null, token: null };
    } catch {
      localStorage.removeItem(storageKey);
      return { user: null, token: null };
    }
  });

  useEffect(() => {
    setAuthToken(auth.token);
    if (auth.token) {
      localStorage.setItem(storageKey, JSON.stringify(auth));
    } else {
      localStorage.removeItem(storageKey);
    }
  }, [auth]);

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      if (!auth.token) {
        setIsReady(true);
        return;
      }

      try {
        const { data } = await api.get('/auth/me');
        if (active) setAuth((current) => ({ ...current, user: data.user }));
      } catch {
        if (active) setAuth({ user: null, token: null });
      } finally {
        if (active) setIsReady(true);
      }
    }

    restoreSession();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    function handleExpiredSession() {
      setAuth({ user: null, token: null });
      setIsReady(true);
    }

    window.addEventListener('codearena:auth-expired', handleExpiredSession);
    return () => window.removeEventListener('codearena:auth-expired', handleExpiredSession);
  }, []);

  async function signup(payload) {
    const { data } = await api.post('/auth/signup', payload);
    setAuth(data);
    return data;
  }

  async function login(payload) {
    const { data } = await api.post('/auth/login', payload);
    setAuth(data);
    return data;
  }

  function logout() {
    setAuth({ user: null, token: null });
  }

  const value = useMemo(
    () => ({
      user: auth.user,
      token: auth.token,
      isAuthenticated: Boolean(auth.token),
      isReady,
      signup,
      login,
      logout,
    }),
    [auth, isReady],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }

  return context;
}
