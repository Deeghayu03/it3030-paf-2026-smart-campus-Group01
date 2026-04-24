import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, CalendarCheck, Ticket } from 'lucide-react';
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

  const location = useLocation();
  const getPageTitle = () => {
    if (title) return title;
    
    const path = location.pathname;
    const titleMap = {
      [ROUTES.DASHBOARD]: 'Student Dashboard',
      [ROUTES.RESOURCES]: 'Available Resources',
      [ROUTES.BOOKINGS]: 'My Bookings',
      [ROUTES.TICKETS]: 'My Tickets',
      [ROUTES.NOTIFICATIONS]: 'My Notifications',
      [ROUTES.ADMIN_DASHBOARD]: 'Admin Dashboard',
      [ROUTES.ADMIN_USERS]: 'Manage Users',
      [ROUTES.ADMIN_RESOURCES]: 'System Resources',
      [ROUTES.ADMIN_BOOKINGS]: 'System Bookings',
      [ROUTES.ADMIN_TICKETS]: 'System Tickets',
      [ROUTES.ADMIN_NOTIFICATIONS]: 'System Notifications',
      [ROUTES.TECHNICIAN_DASHBOARD]: 'Technician Dashboard',
      [ROUTES.TECHNICIAN_RESOURCES]: 'Technician Resources',
      [ROUTES.TECHNICIAN_TICKETS]: 'Assigned Tickets',
      [ROUTES.TECHNICIAN_NOTIFICATIONS]: 'Technician Notifications',
    };
    return titleMap[path] || 'UniFolio';
  };

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };
  
  const isStudent = !isAdmin && !isTechnician;

  const adminNavItems = [
    { path: ROUTES.ADMIN_DASHBOARD, label: 'Dashboard', icon: 'D', color: '#52B788' },
    { path: ROUTES.ADMIN_USERS, label: 'Manage Users', icon: '👥', color: '#2D6A4F' },
    { path: ROUTES.ADMIN_RESOURCES, label: 'Resources', icon: 'R', color: '#4CAF50' },
    { path: ROUTES.ADMIN_BOOKINGS, label: 'Bookings', icon: 'B', color: '#2196F3' },
    { path: ROUTES.ADMIN_TICKETS, label: 'Tickets', icon: 'T', color: '#FF9800' },
    { path: ROUTES.ADMIN_NOTIFICATIONS, label: 'Notifications', icon: 'N', color: '#9C27B0' },
  ];

  const technicianNavItems = [
    { path: ROUTES.TECHNICIAN_DASHBOARD, label: 'Dashboard', icon: 'D', color: '#52B788' },
    { path: ROUTES.TECHNICIAN_RESOURCES, label: 'Resources', icon: 'R', color: '#4CAF50' },
    { path: ROUTES.TECHNICIAN_TICKETS, label: 'Assigned Tickets', icon: 'T', color: '#FF9800' },
    { path: ROUTES.TECHNICIAN_NOTIFICATIONS, label: 'Notifications', icon: 'N', color: '#9C27B0' },
  ];

  const studentNavItems = [
    { path: ROUTES.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard, color: '#52B788' },
    { path: ROUTES.BOOKINGS, label: 'Bookings', icon: CalendarCheck, color: '#2196F3' },
    { path: ROUTES.TICKETS, label: 'Tickets', icon: Ticket, color: '#FF9800' },
  ];

  const navItems = isAdmin
      ? adminNavItems
      : isTechnician
          ? technicianNavItems
          : studentNavItems;

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="dashboard-wrapper">
      <aside className={`dashboard-sidebar ${isStudent ? 'student-portal' : ''} ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
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
                {typeof item.icon === 'string' ? (
                  item.icon
                ) : (
                  <item.icon size={18} strokeWidth={2.5} />
                )}
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
            <h1 className="page-title">{getPageTitle()}</h1>
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
