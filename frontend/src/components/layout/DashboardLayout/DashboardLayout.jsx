import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import useAuth from '../../../hooks/useAuth';
import notificationService from '../../../services/notificationService';
import './DashboardLayout.css';

const DashboardLayout = ({ title, notificationCount = 0, children }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const studentName = localStorage.getItem('name') || 'Student';
  const studentEmail = localStorage.getItem('email') || '';
  const initial = studentName.charAt(0).toUpperCase();

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationService.getUnreadCount();
      setUnreadCount(response.data.count);
    } catch (err) {
      console.error("Failed to fetch notification count", err);
    }
  };

  React.useEffect(() => {
    fetchUnreadCount();
    // Poll every 30 seconds for new notifications
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { path: ROUTES.DASHBOARD, label: 'Dashboard', icon: '🏠' },
    { path: ROUTES.RESOURCES, label: 'Campus Resources', icon: '🏛️' },
    { path: ROUTES.BOOKINGS, label: 'My Bookings', icon: '📅' },
    { path: ROUTES.TICKETS, label: 'Maintenance Hub', icon: '🔧' },
    { path: ROUTES.KANBAN, label: 'Ticket Board', icon: '📋' },
    { path: ROUTES.ANALYTICS, label: 'Analytics', icon: '📊' },
    { path: ROUTES.NOTIFICATIONS, label: 'Notifications', icon: '🔔' }
  ];

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="dashboard-wrapper">
      {/* LEFT SIDEBAR */}
      <aside className={`dashboard-sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-logo">
          UniFolio
        </div>
        
        <div className="sidebar-nav-title">Main Menu</div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink 
              key={item.path} 
              to={item.path} 
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={closeMobileMenu}
              end={item.path === ROUTES.DASHBOARD}
            >
              <span className="sidebar-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="avatar-circle">{initial}</div>
            <div className="user-info">
              <div className="user-name">{studentName}</div>
              <div className="user-email">{studentEmail}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </aside>

      {/* OVERLAY FOR MOBILE */}
      {isMobileMenuOpen && (
        <div className="mobile-overlay" onClick={closeMobileMenu}></div>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="dashboard-main">
        {/* TOP NAVBAR */}
        <header className="dashboard-topbar">
          <div className="topbar-left">
            <button 
              className="hamburger-btn" 
              onClick={() => setIsMobileMenuOpen(true)}
            >
              ☰
            </button>
            <h1 className="page-title">{title}</h1>
          </div>
          
          <div className="topbar-right">
            <div className="notification-bell" onClick={() => navigate(ROUTES.NOTIFICATIONS)} style={{cursor: 'pointer'}}>
              🔔
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </div>
            <div className="avatar-circle topbar-avatar">{initial}</div>
          </div>
        </header>

        <main className="dashboard-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
