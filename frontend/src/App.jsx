import React from 'react';
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
import OAuth2CallbackPage from './pages/Auth/OAuth2CallbackPage';
import TicketDetailPage from './pages/Tickets/TicketDetailPage';
import KanbanBoard from './pages/KanbanBoard/KanbanBoard';
import AnalyticsDashboard from './pages/AnalyticsDashboard/AnalyticsDashboard';
import useAuth from './hooks/useAuth';

import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  return isAuthenticated ? children : <Navigate to={ROUTES.LOGIN} replace />;
};

const App = () => {
  const { user: currentUser } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path={ROUTES.HOME} element={<HomePage />} />
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
        <Route path="/oauth2/callback" element={<OAuth2CallbackPage />} />
        
        {/* Protected Dashboard Routes */}
        <Route path={ROUTES.DASHBOARD} element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path={ROUTES.RESOURCES} element={<ProtectedRoute><ResourcesPage /></ProtectedRoute>} />
        <Route path={ROUTES.BOOKINGS} element={<ProtectedRoute><BookingsPage /></ProtectedRoute>} />
        <Route path={ROUTES.TICKETS} element={<ProtectedRoute><TicketsPage /></ProtectedRoute>} />
        <Route path={ROUTES.TICKET_DETAIL} element={<ProtectedRoute><TicketDetailPage currentUser={currentUser} /></ProtectedRoute>} />
        <Route path={ROUTES.NOTIFICATIONS} element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
        <Route path={ROUTES.ADMIN} element={<ProtectedRoute><AdminDashboardPage /></ProtectedRoute>} />
        <Route path={ROUTES.KANBAN} element={<ProtectedRoute><KanbanBoard currentUser={currentUser} /></ProtectedRoute>} />
        <Route path={ROUTES.ANALYTICS} element={<ProtectedRoute><AnalyticsDashboard /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;