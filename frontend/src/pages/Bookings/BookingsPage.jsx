import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout/DashboardLayout';

const BookingsPage = () => {
  // Module B - Team Member 2 builds here
  return (
    <DashboardLayout title="My Bookings">
      <div className="coming-soon-card">
        <div className="coming-soon-icon">📅</div>
        <h2>My Bookings</h2>
        <p>This module is currently under development. Here you will be able to view and manage your resource booking requests.</p>
      </div>
    </DashboardLayout>
  );
};

export default BookingsPage;