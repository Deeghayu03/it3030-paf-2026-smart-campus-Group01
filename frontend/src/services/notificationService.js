import axiosConfig from '../api/axiosConfig';

export const getMyNotifications = () => {
  return axiosConfig.get('/notifications/my');
};

export const getUnreadCount = () => {
  return axiosConfig.get('/notifications/unread-count');
};

export const markAsRead = (id) => {
  return axiosConfig.put(`/notifications/${id}/read`);
};

export const markAllAsRead = () => {
  return axiosConfig.put('/notifications/read-all');
};
