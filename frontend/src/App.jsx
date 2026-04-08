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
import OAuth2CallbackPage from './pages/Auth/OAuth2CallbackPage';

// Admin
import AdminResourcesPage from './pages/Admin/AdminResourcesPage';
import AddResourcePage from './pages/Admin/AddResourcePage';
import AdminDashboardPage from './pages/Admin/AdminDashboardPage';
import AdminBookingsPage from './pages/Admin/AdminBookingsPage';

// Protects routes so only authenticated users can access them
const ProtectedRoute = ({ children }) => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    return isAuthenticated ? children : <Navigate to={ROUTES.LOGIN} replace />;
};

// Protects admin-only routes
// Ensures user is logged in and has ADMIN role
const AdminRoute = ({ children }) => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const role = localStorage.getItem('role');

    return isAuthenticated && role === 'ADMIN'
        ? children
        : <Navigate to={ROUTES.LOGIN} replace />;
};

const App = () => {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Public Routes - accessible without login */}
                    <Route path={ROUTES.HOME} element={<HomePage />} />
                    <Route path={ROUTES.LOGIN} element={<LoginPage />} />
                    <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
                    <Route path="/oauth2/callback" element={<OAuth2CallbackPage />} />

                    {/* User Routes - require authentication */}
                    <Route
                        path={ROUTES.DASHBOARD}
                        element={
                            <ProtectedRoute>
                                <DashboardPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path={ROUTES.RESOURCES}
                        element={
                            <ProtectedRoute>
                                <ResourcesPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path={ROUTES.BOOKINGS}
                        element={
                            <ProtectedRoute>
                                <BookingsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path={ROUTES.TICKETS}
                        element={
                            <ProtectedRoute>
                                <TicketsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path={ROUTES.NOTIFICATIONS}
                        element={
                            <ProtectedRoute>
                                <NotificationsPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Admin Routes - restricted to ADMIN role only */}
                    <Route
                        path={ROUTES.ADMIN_DASHBOARD}
                        element={
                            <AdminRoute>
                                <AdminDashboardPage />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path={ROUTES.ADMIN_RESOURCES}
                        element={
                            <AdminRoute>
                                <AdminResourcesPage />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path={ROUTES.ADMIN_ADD_RESOURCE}
                        element={
                            <AdminRoute>
                                <AddResourcePage />
                            </AdminRoute>
                        }
                    />

          <Route
            path={ROUTES.ADMIN_BOOKINGS}
            element={
              <AdminRoute>
                <AdminBookingsPage />
              </AdminRoute>
            }
          />

                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
};

export default App;