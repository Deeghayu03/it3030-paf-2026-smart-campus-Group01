import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import useAuth from '../../../hooks/useAuth';
import NotificationBell from "../../common/NotificationBell/NotificationBell";
import './DashboardLayout.css';

const DashboardLayout = ({ title, notificationCount = 0, children }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const studentName = localStorage.getItem('name') || 'Student';
  const studentEmail = localStorage.getItem('email') || '';
  const initial = studentName.charAt(0).toUpperCase();
  const isAdmin = localStorage.getItem('role') === 'ADMIN';

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  const navItems = isAdmin
    ? [
        { path: ROUTES.ADMIN, label: 'Dashboard', icon: 'D', color: '#52B788' },
        { path: ROUTES.ADMIN_USERS, label: 'Manage Users', icon: '👥', color: '#2D6A4F' },
      ]
    : [
        { path: ROUTES.DASHBOARD, label: 'Dashboard', icon: 'D', color: '#52B788' },
        { path: ROUTES.RESOURCES, label: 'Resources', icon: 'R', color: '#4CAF50' },
        { path: ROUTES.BOOKINGS, label: 'Bookings', icon: 'B', color: '#2196F3' },
        { path: ROUTES.TICKETS, label: 'Maintenance', icon: 'M', color: '#FF9800' },
        { path: ROUTES.NOTIFICATIONS, label: 'Notifications', icon: 'N', color: '#9C27B0' },
      ];

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="dashboard-wrapper">
      {/* SIDEBAR */}
      <aside className={`dashboard-sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-logo">
          <span className="logo-short">U</span>
          <span className="logo-full">UniFolio</span>
        </div>
        
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink 
              key={item.path} 
              to={item.path} 
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={closeMobileMenu}
              end={item.path === ROUTES.DASHBOARD || item.path === ROUTES.ADMIN || item.path === ROUTES.ADMIN_USERS}
            >
              <div className="icon-circle" style={{ backgroundColor: item.color }}>{item.icon}</div>
              <span className="sidebar-label">{item.label}</span>
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
          
          <div className="navbar-right">
            <span className="student-portal-text">Student Portal</span>
            <NotificationBell />
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
