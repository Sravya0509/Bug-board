import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('bugboard_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('bugboard_token') || null;
  });

  const [loading, setLoading] = useState(false);

  // Save or remove user and token from localStorage
  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('bugboard_user', JSON.stringify(userData));
    localStorage.setItem('bugboard_token', userToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('bugboard_user');
    localStorage.removeItem('bugboard_token');
  };

  const isAdmin = user?.role === 'Admin';
  const isDeveloper = user?.role === 'Developer';

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAdmin, isDeveloper, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
