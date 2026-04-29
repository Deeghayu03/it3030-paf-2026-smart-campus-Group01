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
  ];

  const technicianNavItems = [
    { path: ROUTES.TECHNICIAN_DASHBOARD, label: 'Dashboard', icon: 'D', color: '#52B788' },
    { path: ROUTES.TECHNICIAN_RESOURCES, label: 'Resources', icon: 'R', color: '#4CAF50' },
    { path: ROUTES.TECHNICIAN_TICKETS, label: 'Assigned Tickets', icon: 'T', color: '#FF9800' },
  ];

  const studentNavItems = [
    { path: ROUTES.DASHBOARD, label: 'Dashboard', icon: 'D', color: '#52B788' },
    { path: ROUTES.BOOKINGS, label: 'Bookings', icon: 'B', color: '#2196F3' },
    { path: ROUTES.TICKETS, label: 'Tickets', icon: 'T', color: '#FF9800' },
  ];

  const navItems = isAdmin
      ? adminNavItems
      : isTechnician
          ? technicianNavItems
          : studentNavItems;

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const getTitle = (pathname) => {
    // Technician
    if (pathname.includes("/technician/dashboard")) return "Technician Dashboard";
    if (pathname.includes("/technician/resources")) return "Resource Management";
    if (pathname.includes("/technician/tickets")) return "Assigned Tickets";
    if (pathname.includes("/technician/notifications")) return "Notifications";

    // Student
    if (pathname === "/dashboard") return "Student Dashboard";
    if (pathname === "/resources") return "Resource Management";
    if (pathname === "/bookings") return "My Bookings";
    if (pathname === "/tickets") return "My Tickets";
    if (pathname === "/notifications") return "Notifications";

    // Admin
    if (pathname === "/admin/dashboard") return "Admin Dashboard";
    if (pathname === "/admin/users") return "Manage Users";
    if (pathname === "/admin/resources") return "Resource Management";
    if (pathname === "/admin/bookings") return "Booking Management";
    if (pathname === "/admin/tickets") return "Ticket Management";

    return "";
  };

  const currentTitle = getTitle(location.pathname);

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

            <h2 className="topbar-page-title">{currentTitle}</h2>
          </div>

          <div className="navbar-right">
            {location.pathname.startsWith("/technician") ? (
              <span className="portal-badge technician">Technician Portal</span>
            ) : !isAdmin && (
              <span className="portal-badge student">Student Portal</span>
            )}
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
