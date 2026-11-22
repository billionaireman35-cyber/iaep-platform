import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from './api.js';
const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const refresh = useCallback(async () => {
    if (!localStorage.getItem('iaep_token')) { setUser(null); setReady(true); return; }
    try { setUser(await api('/me')); } catch { localStorage.removeItem('iaep_token'); setUser(null); }
    setReady(true);
  }, []);
  useEffect(() => { refresh(); }, [refresh]);
  const login = async (email, password) => {
    const { token } = await api('/auth/login', { method: 'POST', body: { email, password } });
    localStorage.setItem('iaep_token', token); await refresh();
  };
  const logout = () => { localStorage.removeItem('iaep_token'); setUser(null); };
  return <Ctx.Provider value={{ user, ready, login, logout, refresh }}>{children}</Ctx.Provider>;
}
