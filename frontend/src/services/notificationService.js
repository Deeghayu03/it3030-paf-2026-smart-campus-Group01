/**
 * SERVICE: notificationService
 * FLOW: NotificationBell.jsx → notificationService → axiosConfig → Backend
 */

/*
 * ============================================
 * NOTIFICATION SERVICE FLOW:
 * 1. Provides functional wrappers for all /api/notifications endpoints
 * 2. Manages AJAX calls for reading, deleting, and fetching notifications
 * 3. Handles user preference synchronization with the server
 * ============================================
 */

import api from '../api/axiosConfig';

/**
 * Fetches all notifications for the current user
 * CALLS: GET /api/notifications/my
 */
export const getMyNotifications = () => {
  return api.get('/notifications/my');
};

/**
 * Retrieves numerical count of unread notifications
 * CALLS: GET /api/notifications/unread-count
 */
export const getUnreadCount = () => {
  return api.get('/notifications/unread-count');
};

/**
 * Updates a single notification status to 'read'
 * CALLS: PUT /api/notifications/{id}/read
 */
export const markAsRead = (id) => {
  return api.put(`/notifications/${id}/read`);
};

/**
 * Updates all notifications for user to 'read'
 * CALLS: PUT /api/notifications/read-all
 */
export const markAllAsRead = () => {
  return api.put('/notifications/read-all');
};

/**
 * Permanently removes a notification
 * CALLS: DELETE /api/notifications/{id}
 */
export const deleteNotification = (id) => {
  return api.delete(`/notifications/${id}`);
};

/**
 * Bulk removes all notifications that are already marked read
 * CALLS: DELETE /api/notifications/clear-read
 */
export const clearReadNotifications = () => {
  return api.delete('/notifications/clear-read');
};

/**
 * Fetches user preference flags (e.g. ticket_notifications: true)
 * CALLS: GET /api/notifications/preferences
 */
export const getPreferences = () => {
  return api.get('/notifications/preferences');
};

/**
 * Flips the status of a specific category preference
 * CALLS: PUT /api/notifications/preferences/{category}/toggle
 */
export const togglePreference = (category) => {
  return api.put(`/notifications/preferences/${category}/toggle`);
};

