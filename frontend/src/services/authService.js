/**
 * SERVICE: authService
 * FLOW: React Component → authService → axiosConfig → Backend
 */

/*
 * ============================================
 * AUTH SERVICE FLOW:
 * 1. Provides functional wrappers for Auth endpoints
 * 2. Uses the configured axiosInstance for consistent behavior
 * 3. Handles manual logout operations
 * ============================================
 */

import api from '../api/axiosConfig';

export const authService = {
  /**
   * Submits credentials for JWT generation
   * CALLS: POST /api/auth/login
   */
  login: (email, password) => {
    return api.post('/auth/login', { email, password });
  },

  /**
   * Submits student registration payload
   * CALLS: POST /api/auth/register
   */
  register: (userData) => {
    return api.post('/auth/register', userData);
  },

  /**
   * Navigates browser to Google Auth entry point
   * CALLS: GET /oauth2/authorization/google (via backend redirect)
   */
  googleLogin: () => {
    return api.get('/auth/google');
  },

  /**
   * Manual disk cleanup
   * TARGETS: token, user, role keys in localStorage
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
  }
};

export default authService;

