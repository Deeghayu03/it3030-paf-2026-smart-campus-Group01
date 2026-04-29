/**
 * CONTEXT: AuthContext
 * FLOW: App Init → Checks LocalStorage → Sets State → Propagates to children
 *       On Login → Saves to LocalStorage → Updates State
 *       On Logout → Clears LocalStorage → Resets State
 */

/*
 * ============================================
 * AUTHENTICATION PERSISTENCE FLOW:
 * 1. AuthProvider wraps the entire application
 * 2. useEffect checks for existing tokens in localStorage on mount
 * 3. login() function centralizes state updates and disk persistence
 * 4. logout() function performs a clean slate wipe
 * 5. Global 'role' and 'isAuthenticated' flags drive UI visibility
 * ============================================
 */

import React, { createContext, useState, useEffect, useCallback } from 'react';

// Create the context for consumption by useAuth and other components
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null);

  /**
   * REHYDRATION: Recovers user session from browser storage during page refresh
   */
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedRole = localStorage.getItem('role');
    const storedUserId = localStorage.getItem('userId');
    const storedIsAuthenticated = localStorage.getItem('isAuthenticated');

    // Restore state if a valid authenticated session exists
    if (storedToken && storedIsAuthenticated === 'true') {
      setToken(storedToken);
      setRole(storedRole);
      setIsAuthenticated(true);
      setUser({
        id: storedUserId,
        role: storedRole,
        name: localStorage.getItem('name'),
        email: localStorage.getItem('email')
      });
    }
  }, []);

  /**
   * PERSISTENCE: Synchronizes UI state with Disk (localStorage)
   * UPDATES: user, token, role, isAuthenticated states
   */
  const login = useCallback((userData, tokenString) => {
    // 1. Update In-Memory state for immediate UI feedback
    setUser(userData);
    setToken(tokenString);
    setRole(userData.role || null);
    setIsAuthenticated(true);
    
    // 2. Persist to Disk for persistence across refreshes
    localStorage.setItem('token', tokenString);
    localStorage.setItem('role', userData.role || '');
    localStorage.setItem('userId', userData.id || '');
    localStorage.setItem('email', userData.email || '');
    localStorage.setItem('name', userData.name || '');
    localStorage.setItem('isAuthenticated', 'true');
  }, []);

  /**
   * CLEANUP: Destroys all traces of the current session
   * UPDATES: All context states to null/false
   */
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

