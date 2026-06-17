import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Attempt to restore user credentials from localStorage
    const savedToken = localStorage.getItem('hdfc_token');
    const savedUser = localStorage.getItem('hdfc_user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const data = await authAPI.login(email, password);
      
      const loggedUser = {
        email: data.email,
        role: data.role,
        full_name: data.full_name,
      };

      setToken(data.access_token);
      setUser(loggedUser);

      localStorage.setItem('hdfc_token', data.access_token);
      localStorage.setItem('hdfc_user', JSON.stringify(loggedUser));

      return { success: true };
    } catch (err) {
      const message = err.response?.data?.detail || 'Invalid email or password';
      return { success: false, error: message };
    }
  };

  const register = async (email, password, fullName) => {
    try {
      await authAPI.register(email, password, fullName);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.detail || 'Registration failed';
      return { success: false, error: message };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('hdfc_token');
    localStorage.removeItem('hdfc_user');
  };

  const value = {
    user,
    token,
    isAdmin: user?.role === 'admin',
    isAuthenticated: !!token,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
