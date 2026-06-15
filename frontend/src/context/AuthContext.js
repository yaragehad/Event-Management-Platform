import React, { createContext, useState } from 'react';

// 1. Create the Context
export const AuthContext = createContext();

// Helper: safely parse stored user
function getStoredUser() {
  try {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    if (savedUser && savedToken) return JSON.parse(savedUser);
  } catch { /* ignore parse errors */ }
  return null;
}

// 2. Create the Provider
export const AuthProvider = ({ children }) => {
  // Read localStorage synchronously on first render — no async loading needed
  const [user, setUser] = useState(() => getStoredUser());

  // The function to run when they successfully log in
  const login = (userData, token) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    setUser(userData);
  };

  // The function to run when they click "Logout"
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