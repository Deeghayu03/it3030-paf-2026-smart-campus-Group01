import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import useAuth from '../../../hooks/useAuth';
import '../DashboardLayout/DashboardLayout.css';

const AdminDashboardLayout = ({ title, notificationCount = 0, children }) => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const adminName = localStorage.getItem('name') || 'Admin';
    const adminEmail = localStorage.getItem('email') || '';
    const initial = adminName.charAt(0).toUpperCase();

    const handleLogout = () => {
        logout();
        navigate(ROUTES.LOGIN);
    };

    const navItems = [
        { path: ROUTES.ADMIN_DASHBOARD, label: 'Dashboard', icon: '🏠' },
        { path: ROUTES.ADMIN_RESOURCES, label: 'Manage Resources', icon: '🏛️' },
        { path: ROUTES.ADMIN_ADD_RESOURCE, label: 'Add Resource', icon: '➕' },
        { path: ROUTES.ADMIN_BOOKINGS, label: 'Booking Requests', icon: '📅' },
    ];

    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    return (
        <div className="dashboard-wrapper">
            <aside className={`dashboard-sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
                <div className="sidebar-logo">UniFolio</div>

                <div className="sidebar-nav-title">Main Menu</div>
                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                            onClick={closeMobileMenu}
                            end
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
                            <div className="user-email">{adminEmail}</div>
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

                    <div className="topbar-right">
                        <div className="notification-bell">
                            🔔
                            {notificationCount > 0 && (
                                <span className="notification-badge">{notificationCount}</span>
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

export default AdminDashboardLayout;