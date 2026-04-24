import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout/DashboardLayout';
import { getMyNotifications, markAllAsRead, markAsRead, deleteNotification, clearReadNotifications, getPreferences, togglePreference } from '../../services/notificationService';
import { timeAgo } from '../../utils/helpers';
import './NotificationsPage.css';

const NotificationsPage = () => {
  const { role } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState([]);

  useEffect(() => {
    fetchNotifications();
    loadPreferences();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await getMyNotifications();
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      await fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleClearRead = async () => {
    try {
      await clearReadNotifications();
      await fetchNotifications();
    } catch (error) {
      console.error('Error clearing read notifications:', error);
    }
  };

  const loadPreferences = async () => {
    try {
      const response = await getPreferences();
      setPreferences(response.data);
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const handleTogglePreference = async (category) => {
    try {
      await togglePreference(category);
      await loadPreferences();
    } catch (error) {
      console.error('Error toggling preference:', error);
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'Unread') return !notification.isRead;
    if (filter === 'Read') return notification.isRead;
    return true;
  });

  const getBorderColor = (type) => {
    switch (type) {
      case 'BOOKING_APPROVED': return '#52B788';
      case 'BOOKING_REJECTED': return '#EF4444';
      case 'BOOKING_CANCELLED': return '#F4A261';
      case 'TICKET_UPDATED': return '#2196F3';
      case 'TICKET_ASSIGNED': return '#9C27B0';
      case 'TICKET_RESOLVED': return '#52B788';
      case 'TICKET_REJECTED': return '#DC2626';
      case 'NEW_COMMENT': return '#FF9800';
      default: return 'var(--primary)';
    }
  };

  const getBadgeStyle = (type) => {
    const color = getBorderColor(type);
    return {
      backgroundColor: `${color}20`,
      color: color,
      border: `1px solid ${color}40`
    };
  };

  const formatTypeLabel = (type) => {
    if (!type) return 'Notification';
    return type.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ');
  };

  const getTypeIcon = (type) => {
    if (!type) return '🔔';
    if (type === 'NEW_COMMENT') return '💬';
    if (type.startsWith('BOOKING')) return '📅';
    return '🎫';
  };

  return (
    <DashboardLayout title="Notifications">
      <div className="notifications-page">

        {role === 'STUDENT' && <div className="preferences-section">
          <h3 className="preferences-title">Notification Preferences</h3>
          <div className="preferences-toggles">
            {['BOOKING', 'TICKET'].map(category => {
              const pref = preferences.find(p => p.category === category);
              const isEnabled = pref ? pref.enabled : true;
              return (
                <div key={category} className="preference-item">
                  <span className="preference-label">
                    {category === 'BOOKING' ? 'Booking Updates' : 'Ticket Updates'}
                  </span>
                  <div
                    className={`toggle-switch ${isEnabled ? 'toggle-switch-on' : ''}`}
                    onClick={() => handleTogglePreference(category)}
                    role="switch"
                    aria-checked={isEnabled}
                  >
                    <div className="toggle-thumb" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>}

        <div className="notifications-toolbar">
          <div className="notifications-tabs">
            {['All', 'Unread', 'Read'].map(tab => (
              <button
                key={tab}
                className={`filter-tab ${filter === tab ? 'active' : ''}`}
                onClick={() => setFilter(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="toolbar-actions">
            <button className="toolbar-btn" onClick={handleMarkAllAsRead}>
              Mark all as read
            </button>
            <button className="toolbar-btn toolbar-btn-danger" onClick={handleClearRead}>
              Clear Read
            </button>
          </div>
        </div>

        <div className="notifications-container">
          {loading ? (
            <div className="notifications-empty">Loading notifications...</div>
          ) : filteredNotifications.length > 0 ? (
            filteredNotifications.map(notification => (
              <div
                key={notification.id}
                className={`notification-card ${notification.isRead ? 'read' : 'unread'}`}
                style={{ borderLeftColor: getBorderColor(notification.type) }}
              >
                <div className="notification-card-top">
                  <span className="notification-type-badge" style={getBadgeStyle(notification.type)}>
                    {formatTypeLabel(notification.type)}
                  </span>
                  <span className="notification-card-time">{timeAgo(notification.createdAt)}</span>
                </div>
                <div className="notification-card-middle">
                  <p className="notification-card-message">
                    <span className="notification-icon">{getTypeIcon(notification.type)}</span>
                    {notification.message}
                  </p>
                </div>
                <div className="notification-card-bottom">
                  {!notification.isRead && (
                    <button
                      className="mark-read-btn"
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      Mark as read
                    </button>
                  )}
                  <button
                    className="delete-notification-btn"
                    onClick={(e) => { e.stopPropagation(); handleDelete(notification.id); }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="notifications-empty">
              No notifications here
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NotificationsPage;