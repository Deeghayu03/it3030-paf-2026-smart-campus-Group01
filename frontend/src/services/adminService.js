import api from '../api/axiosConfig';

export const getAdminStats = () => {
  return api.get('/admin/stats');
};

export const getAdminUsers = () => {
  return api.get('/admin/users');
};

export const deleteAdminUser = (id) => {
  return api.delete(`/admin/users/${id}`);
};
