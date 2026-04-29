/**
 * CONFIG: axiosInstance
 * FLOW: Outgoing → Attach Token Header → Backend
 *       Incoming ← Success ← Backend
 *       Incoming ← 401 Error ← Backend → Clear Storage → Redirect to Login
 */

/*
 * ============================================
 * AXIOS INTERCEPTOR FLOW:
 * 1. Global axios instance created with base /api URL
 * 2. Request Interceptor: Checks localStorage for 'token'
 * 3. If token exists, injects 'Authorization: Bearer <token>'
 * 4. Response Interceptor: Listens for 401 Unauthorized
 * 5. If 401 occurs, session is force-closed to maintain security
 * ============================================
 */

import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080/api'
});

/**
 * REQUEST INTERCEPTOR
 * Purpose: Automated Authorization Header injection
 * FLOW: Function runs before every fetch → Reads disk → Modifies headers
 */
axiosInstance.interceptors.request.use(
  (config) => {
    // Dynamically retrieve token for the current request
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * RESPONSE INTERCEPTOR
 * Purpose: Global error handling and session termination
 * FLOW: Backend sends 401 → Interceptor catches → Clean logout → Login Redirect
 */
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle specific status codes globally
    if (error.response && error.response.status === 401) {
      // Token probably expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      // Force exit to login screen
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
