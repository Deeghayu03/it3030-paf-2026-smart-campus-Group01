// Module D (notification API calls) - Team Member 4 (Group Leader)
import axiosInstance from '../api/axiosConfig';

export const notificationService = {
  getMyNotifications: () => {
    return axiosInstance.get('/notifications/my');
  },
  markAsRead: (id) => {
    return axiosInstance.put(`/notifications/${id}/read`);
  },
  markAllAsRead: () => {
    return axiosInstance.put('/notifications/read-all');
  },
  getUnreadCount: () => {
    return axiosInstance.get('/notifications/unread-count');
  }
};

export default notificationService;
