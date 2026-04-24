import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  return isAuthenticated ? children : <Navigate to={ROUTES.LOGIN} replace />;
};

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
          <Route path={ROUTES.DASHBOARD} element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path={ROUTES.RESOURCES} element={<ProtectedRoute><ResourcesPage /></ProtectedRoute>} />
          <Route path={ROUTES.BOOKINGS} element={<ProtectedRoute><BookingsPage /></ProtectedRoute>} />
          <Route path={ROUTES.TICKETS} element={<ProtectedRoute><TicketsPage /></ProtectedRoute>} />
          <Route path={ROUTES.NOTIFICATIONS} element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path={ROUTES.ADMIN_DASHBOARD} element={<ProtectedRoute><AdminDashboardPage /></ProtectedRoute>} />
          <Route path={ROUTES.ADMIN_USERS} element={<ProtectedRoute><ManageUsersPage /></ProtectedRoute>} />
          <Route path={ROUTES.ADMIN_RESOURCES} element={<ProtectedRoute><AdminResourcesPage /></ProtectedRoute>} />
          <Route path={ROUTES.ADMIN_BOOKINGS} element={<ProtectedRoute><BookingsPage /></ProtectedRoute>} />
          <Route path={ROUTES.ADMIN_TICKETS} element={<ProtectedRoute><AdminTicketsPage /></ProtectedRoute>} />
          <Route path={ROUTES.ADMIN_NOTIFICATIONS} element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />

            <Route
                path={ROUTES.TECHNICIAN_DASHBOARD}
                element={
                  <ProtectedRoute>
                    <TechnicianDashboardPage />
                  </ProtectedRoute>
                }
            />
            <Route
                path={ROUTES.TECHNICIAN_TICKETS}
                element={
                  <ProtectedRoute>
                    <TechnicianTicketsPage />
                  </ProtectedRoute>
                }
            />
            <Route
                path={ROUTES.TECHNICIAN_NOTIFICATIONS}
                element={
                  <ProtectedRoute>
                    <NotificationsPage />
                  </ProtectedRoute>
                }
            />
              <Route
                  path={ROUTES.TECHNICIAN_RESOURCES}
                  element={
                      <ProtectedRoute>
                          <TechnicianResourcesPage />
                      </ProtectedRoute>
                  }
              />

          <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
