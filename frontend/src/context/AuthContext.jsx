import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('aquasmart_token');

  useEffect(() => {
    if (token) {
      api.get('/me')
        .then((res) => {
          setUser(res.user);
        })
        .catch(() => {
          localStorage.removeItem('aquasmart_token');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/login', { email, password });
    localStorage.setItem('aquasmart_token', res.token);
    setUser(res.user);
    return res;
  };

  const register = async (userData) => {
    const res = await api.post('/register', userData);
    localStorage.setItem('aquasmart_token', res.token);
    setUser(res.user);
    return res;
  };

  const logout = async () => {
    try {
      await api.post('/logout');
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('aquasmart_token');
      setUser(null);
    }
  };

  const updateProfile = async (formData) => {
    const res = await api.put('/profile', formData);
    setUser(res.user);
    return res;
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/me');
      setUser(res.user);
    } catch (e) {
      console.error(e);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isManager: user?.role === 'manager' || user?.role === 'admin',
    isFarmer: user?.role === 'farmer',
    isPro: user?.plan === 'pro' || user?.plan === 'business',
    isBusiness: user?.plan === 'business',
    login,
    register,
    logout,
    updateProfile,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
