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

export const deleteNotification = (id) => {
  return api.delete(`/notifications/${id}`);
};

export const clearReadNotifications = () => {
  return api.delete('/notifications/clear-read');
};

export const getPreferences = () => {
  return api.get('/notifications/preferences');
};

export const togglePreference = (category) => {
  return api.put(`/notifications/preferences/${category}/toggle`);
};
