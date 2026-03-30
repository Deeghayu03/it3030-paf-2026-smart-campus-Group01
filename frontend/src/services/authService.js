// Module E (auth API calls) - Auth Developer
import axiosInstance from '../api/axiosConfig';

export const authService = {
  login: (email, password) => {
    return axiosInstance.post('/auth/login', { email, password });
  },
  register: (userData) => {
    return axiosInstance.post('/auth/register', userData);
  },
  googleLogin: () => {
    return axiosInstance.get('/auth/google');
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
  }
};

export default authService;
