import React, { createContext, useContext, useEffect, useState } from 'react';
import { post, get as apiGet, tokenStore } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await post('/api/auth/refresh');
      // backend returns accessToken + user
      if (data?.accessToken) tokenStore.set(data.accessToken);
      setUser(data.user || null);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Bootstrap auth state from server cookie
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async ({ username, password }) => {
    setLoading(true);
    setError(null);
    try {
      const data = await post('/api/auth/login', { username, password });
      // backend returns accessToken + user
      if (data?.accessToken) tokenStore.set(data.accessToken);
      setUser(data.user || null);
      setLoading(false);
      return { success: true };
    } catch (err) {
      setError(err.message || 'Login failed');
      setLoading(false);
      return { success: false, error: err };
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await post('/api/auth/logout');
    } catch (err) {
      // ignore
    }
    tokenStore.remove();
    setUser(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;
