import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
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
import AdminTicketsPage from './pages/Admin/AdminTicketsPage';
import ManageUsersPage from './pages/Admin/ManageUsersPage';
import OAuth2CallbackPage from './pages/Auth/OAuth2CallbackPage';
import CompleteProfilePage from './pages/Auth/CompleteProfilePage';
import AdminResourcesPage from './pages/Resources/AdminResourcesPage';
import TechnicianDashboardPage from './pages/Technician/TechnicianDashboardPage';
import TechnicianResourcesPage from './pages/Technician/TechnicianResourcesPage';
import TechnicianTicketsPage from './pages/Technician/TechnicianTicketsPage';
import DashboardLayout from './components/layout/DashboardLayout/DashboardLayout';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  return isAuthenticated ? (children || <Outlet />) : <Navigate to={ROUTES.LOGIN} replace />;
};

// Layout Wrappers for persistent sidebar
const StudentLayout = () => (
  <ProtectedRoute>
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  </ProtectedRoute>
);

const AdminLayout = () => (
  <ProtectedRoute>
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  </ProtectedRoute>
);

const TechnicianLayout = () => (
  <ProtectedRoute>
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  </ProtectedRoute>
);

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path={ROUTES.HOME} element={<HomePage />} />
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
          <Route path="/oauth2/callback" element={<OAuth2CallbackPage />} />
          <Route path="/complete-profile" element={<CompleteProfilePage />} />

          {/* Student Routes */}
          <Route element={<StudentLayout />}>
            <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
            <Route path={ROUTES.RESOURCES} element={<ResourcesPage />} />
            <Route path={ROUTES.BOOKINGS} element={<BookingsPage />} />
            <Route path={ROUTES.TICKETS} element={<TicketsPage />} />
            <Route path={ROUTES.NOTIFICATIONS} element={<NotificationsPage />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<AdminLayout />}>
            <Route path={ROUTES.ADMIN_DASHBOARD} element={<AdminDashboardPage />} />
            <Route path={ROUTES.ADMIN_USERS} element={<ManageUsersPage />} />
            <Route path={ROUTES.ADMIN_RESOURCES} element={<AdminResourcesPage />} />
            <Route path={ROUTES.ADMIN_BOOKINGS} element={<BookingsPage />} />
            <Route path={ROUTES.ADMIN_TICKETS} element={<AdminTicketsPage />} />
            <Route path={ROUTES.ADMIN_NOTIFICATIONS} element={<NotificationsPage />} />
          </Route>

          {/* Technician Routes */}
          <Route element={<TechnicianLayout />}>
            <Route path={ROUTES.TECHNICIAN_DASHBOARD} element={<TechnicianDashboardPage />} />
            <Route path={ROUTES.TECHNICIAN_TICKETS} element={<TechnicianTicketsPage />} />
            <Route path={ROUTES.TECHNICIAN_NOTIFICATIONS} element={<NotificationsPage />} />
            <Route path={ROUTES.TECHNICIAN_RESOURCES} element={<TechnicianResourcesPage />} />
          </Route>

          <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
