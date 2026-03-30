import os

base_dir = r"h:\UniFolio\UniFolio\frontend\src"

pages = {
    "pages/Auth/LoginPage.js": """import React from 'react';
import './LoginPage.css';

const LoginPage = () => {
  return (
    <div className="placeholder-page">
      <div className="placeholder-card">
        <h2>Login Page - Coming Soon</h2>
      </div>
    </div>
  );
};

export default LoginPage;""",
    "pages/Auth/LoginPage.css": """
.placeholder-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 64px);
  background-color: var(--bg-light);
}

.placeholder-card {
  background-color: var(--bg-white);
  padding: 40px;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  text-align: center;
}
""",
    "pages/Auth/RegisterPage.js": """import React from 'react';
import './RegisterPage.css';

const RegisterPage = () => {
  return (
    <div className="placeholder-page">
      <div className="placeholder-card">
        <h2>Register Page - Coming Soon</h2>
      </div>
    </div>
  );
};

export default RegisterPage;""",
    "pages/Auth/RegisterPage.css": """
/* uses same placeholder classes defined globally or similar */
""",
    "pages/Dashboard/DashboardPage.js": """import React from 'react';
import './DashboardPage.css';

const DashboardPage = () => {
  return (
    <div className="placeholder-page">
      <div className="placeholder-card">
        <h2>Student Dashboard - Coming Soon</h2>
      </div>
    </div>
  );
};

export default DashboardPage;""",
    "pages/Dashboard/DashboardPage.css": "",
    "pages/Resources/ResourcesPage.js": """// Module A - Facilities & Assets - Team Member 1
import React from 'react';
import './ResourcesPage.css';

const ResourcesPage = () => {
  return (
    <div className="placeholder-page">
      <div className="placeholder-card">
        <h2>Campus Resources - Module A - Coming Soon</h2>
      </div>
    </div>
  );
};

export default ResourcesPage;""",
    "pages/Resources/ResourcesPage.css": "",
    "pages/Bookings/BookingsPage.js": """// Module B - Booking Management - Team Member 2
import React from 'react';
import './BookingsPage.css';

const BookingsPage = () => {
  return (
    <div className="placeholder-page">
      <div className="placeholder-card">
        <h2>My Bookings - Module B - Coming Soon</h2>
      </div>
    </div>
  );
};

export default BookingsPage;""",
    "pages/Bookings/BookingsPage.css": "",
    "pages/Tickets/TicketsPage.js": """// Module C - Maintenance & Incidents - Team Member 3
import React from 'react';
import './TicketsPage.css';

const TicketsPage = () => {
  return (
    <div className="placeholder-page">
      <div className="placeholder-card">
        <h2>Maintenance Hub - Module C - Coming Soon</h2>
      </div>
    </div>
  );
};

export default TicketsPage;""",
    "pages/Tickets/TicketsPage.css": "",
    "pages/Notifications/NotificationsPage.js": """// Module D - Notifications - Team Member 4 (Group Leader)
import React from 'react';
import './NotificationsPage.css';

const NotificationsPage = () => {
  return (
    <div className="placeholder-page">
      <div className="placeholder-card">
        <h2>Notifications - Module D - Coming Soon</h2>
      </div>
    </div>
  );
};

export default NotificationsPage;""",
    "pages/Notifications/NotificationsPage.css": "",
    "pages/Admin/AdminDashboardPage.js": """import React from 'react';
import './AdminDashboardPage.css';

const AdminDashboardPage = () => {
  return (
    <div className="placeholder-page">
      <div className="placeholder-card">
        <h2>Admin Dashboard - Coming Soon</h2>
      </div>
    </div>
  );
};

export default AdminDashboardPage;""",
    "pages/Admin/AdminDashboardPage.css": "",
    "App.js": """import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ROUTES } from './constants/routes';

import HomePage from './pages/Home/HomePage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import ResourcesPage from './pages/Resources/ResourcesPage';
import BookingsPage from './pages/Bookings/BookingsPage';
import TicketsPage from './pages/Tickets/TicketsPage';
import NotificationsPage from './pages/Notifications/NotificationsPage';
import AdminDashboardPage from './pages/Admin/AdminDashboardPage';

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path={ROUTES.HOME} element={<HomePage />} />
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
          <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
          <Route path={ROUTES.RESOURCES} element={<ResourcesPage />} />
          <Route path={ROUTES.BOOKINGS} element={<BookingsPage />} />
          <Route path={ROUTES.TICKETS} element={<TicketsPage />} />
          <Route path={ROUTES.NOTIFICATIONS} element={<NotificationsPage />} />
          <Route path={ROUTES.ADMIN} element={<AdminDashboardPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;""",
    "utils/helpers.js": """export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const truncateText = (text, maxLength) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const getRoleRedirect = (role) => {
  switch(role) {
    case 'ADMIN':
      return '/admin/dashboard';
    case 'USER':
    case 'TECHNICIAN':
      return '/dashboard';
    default:
      return '/';
  }
};
"""
}

for f, content in pages.items():
    with open(os.path.join(base_dir, f), "w", encoding="utf-8") as file:
        file.write(content)
