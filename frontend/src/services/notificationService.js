import api from '../api/axiosConfig';

export const getMyNotifications = () => {
  return api.get('/notifications/my');
};

export const getUnreadCount = () => {
  return api.get('/notifications/unread-count');
};

export const markAsRead = (id) => {
  return api.put(`/notifications/${id}/read`);
};

export const markAllAsRead = () => {
  return api.put('/notifications/read-all');
};
