import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedRole = localStorage.getItem('role');
    const storedIsAuthenticated = localStorage.getItem('isAuthenticated');

    if (storedToken && storedIsAuthenticated === 'true') {
      setToken(storedToken);
      setRole(storedRole);
      setIsAuthenticated(true);
    }
  }, []);

  const login = (userData, tokenString) => {
    setUser(userData);
    setToken(tokenString);
    setRole(userData.role || null);
    setIsAuthenticated(true);
    
    // Only these 5 keys should be in localStorage
    localStorage.setItem('token', tokenString);
    localStorage.setItem('role', userData.role || '');
    localStorage.setItem('email', userData.email || '');
    localStorage.setItem('name', userData.name || '');
    localStorage.setItem('isAuthenticated', 'true');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setRole(null);
    setIsAuthenticated(false);
    localStorage.clear();
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};