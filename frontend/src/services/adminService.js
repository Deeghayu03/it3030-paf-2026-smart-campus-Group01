import axiosConfig from '../api/axiosConfig';

export const getAdminStats = () => {
  return axiosConfig.get('/admin/stats');
};

export const getAdminUsers = () => {
  return axiosConfig.get('/admin/users');
};

export const deleteAdminUser = (id) => {
  return axiosConfig.delete(`/admin/users/${id}`);
};
