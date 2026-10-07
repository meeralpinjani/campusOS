import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch, getStoredTokens, setStoredTokens, clearStoredTokens } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check auth state on initial mount
  useEffect(() => {
    const initAuth = async () => {
      const { accessToken } = getStoredTokens();
      if (!accessToken) {
        setLoading(false);
        return;
      }

      try {
        const data = await apiFetch('/auth/me');
        setUser(data.user);
      } catch (err) {
        console.warn('Initial session check failed:', err.message);
        clearStoredTokens();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (emailOrUsername, password) => {
    setError(null);
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ emailOrUsername, password }),
      });

      setStoredTokens(data.accessToken, data.refreshToken);
      setUser(data.user);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const signup = async (formData) => {
    setError(null);
    try {
      const data = await apiFetch('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      setStoredTokens(data.accessToken, data.refreshToken);
      setUser(data.user);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = () => {
    clearStoredTokens();
    setUser(null);
  };

  const updateUser = (updatedUserData) => {
    setUser((prev) => (prev ? { ...prev, ...updatedUserData } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        signup,
        logout,
        updateUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
