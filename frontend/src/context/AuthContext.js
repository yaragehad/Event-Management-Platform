import React, { createContext, useState, useContext } from 'react';

export const AuthContext = createContext();

function getStoredUser() {
  try {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    if (savedUser && savedToken) return JSON.parse(savedUser);
  } catch { /* ignore parse errors */ }
  return null;
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser());

  const login = (userData, token) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading: false }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
