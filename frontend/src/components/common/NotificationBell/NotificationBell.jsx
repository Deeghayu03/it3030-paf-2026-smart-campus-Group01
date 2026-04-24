import { useState, useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axiosConfig";
import { ROUTES } from "../../../constants/routes";
import { AuthContext } from "../../../context/AuthContext";
import "./NotificationBell.css";

const NotificationBell = () => {
  const { role } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);
  const navigate = useNavigate();

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get("/notifications/unread-count");
      setUnreadCount(response.data.count || 0);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await api.get("/notifications/my");
      setNotifications(response.data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleBellClick = () => {
    if (!isOpen) fetchNotifications();
    setIsOpen(!isOpen);
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n =>
        n.id === id ? { ...n, isRead: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const handleNotificationClick = async (notification) => {
    // Navigate based on type
    switch (notification.type) {
      case "NEW_TICKET":
      case "TICKET_UPDATED":
        navigate("/admin/tickets");
        break;
      case "TICKET_ASSIGNED":
        navigate("/technician/tickets");
        break;
      case "TICKET_RESOLVED":
      case "NEW_COMMENT":
      case "TICKET_REJECTED":
        navigate("/tickets");
        break;
      case "BOOKING_CONFIRMED":
      case "BOOKING_CANCELLED":
      case "BOOKING_PENDING":
      case "BOOKING_APPROVED":
      case "BOOKING_REJECTED":
        navigate("/bookings");
        break;
      default:
        navigate(ROUTES.NOTIFICATIONS);
        break;
    }

    // Mark as read if unread
    if (!notification.isRead) {
      await handleMarkAsRead(notification.id);
    }

    // Close the dropdown
    setIsOpen(false);
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put("/notifications/read-all");
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const timeAgo = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return Math.floor(seconds / 60) + " min ago";
    if (seconds < 86400) return Math.floor(seconds / 3600) + " hr ago";
    return Math.floor(seconds / 86400) + " days ago";
  };

  return (
    <div className="notification-bell-wrapper" ref={panelRef}>
      <button className="bell-button" onClick={handleBellClick}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unreadCount > 0 && (
          <span className="bell-badge">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-panel">
          <div className="panel-header">
            <span className="panel-title">Notifications</span>
            <button
              className="mark-all-btn"
              onClick={handleMarkAllAsRead}
            >
              Mark all as read
            </button>
          </div>

          <div className="panel-body">
            {loading ? (
              <div className="panel-empty">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="panel-empty">
                <p>No notifications yet</p>
                <span>You are all caught up!</span>
              </div>
            ) : (
              notifications.slice(0, 10).map(notification => (
                <div
                  key={notification.id}
                  className={`notification-item ${!notification.isRead ? "unread" : ""}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className={`notification-dot ${!notification.isRead ? "dot-unread" : "dot-read"}`}/>
                  <div className="notification-content">
                    <p className="notification-message">
                      {notification.message}
                    </p>
                    <span className="notification-time">
                      {timeAgo(notification.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div
            className="panel-footer"
            onClick={() => {
              if (role === 'ADMIN') {
                navigate(ROUTES.ADMIN_NOTIFICATIONS);
              } else if (role === 'TECHNICIAN') {
                navigate(ROUTES.TECHNICIAN_NOTIFICATIONS);
              } else {
                navigate(ROUTES.NOTIFICATIONS);
              }
              setIsOpen(false);
            }}
          >
            View all notifications
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
