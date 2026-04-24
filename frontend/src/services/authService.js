import api from '../api/axiosConfig';

export const authService = {
  login: (email, password) => {
    return api.post('/auth/login', { email, password });
  },
  register: (userData) => {
    return api.post('/auth/register', userData);
  },
  googleLogin: () => {
    return api.get('/auth/google');
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
  }
};

export default authService;
