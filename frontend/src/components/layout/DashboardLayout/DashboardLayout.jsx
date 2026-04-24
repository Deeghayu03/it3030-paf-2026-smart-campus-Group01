import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import useAuth from '../../../hooks/useAuth';
import NotificationBell from "../../common/NotificationBell/NotificationBell";
import logo from '../../../assets/logo.png';
import './DashboardLayout.css';

const DashboardLayout = ({ title, notificationCount = 0, children }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const userName = localStorage.getItem('name') || 'User';
  const userEmail = localStorage.getItem('email') || '';
  const userRole = (localStorage.getItem('role') || 'USER').toUpperCase();
  const initial = userName.charAt(0).toUpperCase();

  const isAdmin = userRole.includes('ADMIN');
  const isTechnician = userRole.includes('TECHNICIAN');

  const portalText = isAdmin
      ? 'Admin Portal'
      : isTechnician
          ? 'Technician Portal'
          : 'Student Portal';

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  const adminNavItems = [
    { path: ROUTES.ADMIN_DASHBOARD, label: 'Dashboard', icon: 'D', color: '#52B788' },
    { path: ROUTES.ADMIN_USERS, label: 'Manage Users', icon: '👥', color: '#2D6A4F' },
    { path: ROUTES.ADMIN_RESOURCES, label: 'Resources', icon: 'R', color: '#4CAF50' },
    { path: ROUTES.ADMIN_BOOKINGS, label: 'Bookings', icon: 'B', color: '#2196F3' },
    { path: ROUTES.ADMIN_TICKETS, label: 'Tickets', icon: 'T', color: '#FF9800' },
  ];

  const technicianNavItems = [
    { path: ROUTES.TECHNICIAN_DASHBOARD, label: 'Dashboard', icon: 'D', color: '#52B788' },
    { path: ROUTES.TECHNICIAN_RESOURCES, label: 'Resources', icon: 'R', color: '#4CAF50' },
    { path: ROUTES.TECHNICIAN_TICKETS, label: 'Assigned Tickets', icon: 'T', color: '#FF9800' },
  ];

  const studentNavItems = [
    { path: ROUTES.DASHBOARD, label: 'Dashboard', icon: 'D', color: '#52B788' },
    { path: ROUTES.RESOURCES, label: 'Resources', icon: 'R', color: '#4CAF50' },
    { path: ROUTES.BOOKINGS, label: 'Bookings', icon: 'B', color: '#2196F3' },
    { path: ROUTES.TICKETS, label: 'Maintenance', icon: 'M', color: '#FF9800' },
  ];

  const navItems = isAdmin
      ? adminNavItems
      : isTechnician
          ? technicianNavItems
          : studentNavItems;

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="dashboard-wrapper">
      <aside className={`dashboard-sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-brand">
          <img src={logo} alt="UniFolio Logo" className="sidebar-logo" />
          <span className="logo-text">UniFolio</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={closeMobileMenu}
              end={
                item.path === ROUTES.DASHBOARD ||
                item.path === ROUTES.ADMIN_DASHBOARD ||
                item.path === ROUTES.ADMIN_USERS ||
                item.path === ROUTES.TECHNICIAN_DASHBOARD
              }
            >
              <div className="icon-circle" style={{ backgroundColor: item.color }}>
                {item.icon}
              </div>
              <span className="sidebar-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="avatar-circle">{initial}</div>
            <div className="user-info">
              <div className="user-name">{userName}</div>
              <div className="user-email">{userEmail}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </aside>

      {isMobileMenuOpen && (
        <div className="mobile-overlay" onClick={closeMobileMenu}></div>
      )}

      <div className="dashboard-main">
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
            <span className="student-portal-text">{portalText}</span>
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
