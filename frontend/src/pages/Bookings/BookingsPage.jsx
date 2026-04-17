import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout/DashboardLayout';

const BookingsPage = () => {
  // Module A - Team Member 1 builds here
  return (
    <DashboardLayout title="My Bookings">
      <div className="coming-soon-card">
        <div className="coming-soon-icon">📅</div>
        <h2>My Bookings</h2>
        <p>This module is currently under development. Here you will be able to manage your reservations and view your schedule.</p>
      </div>
    </DashboardLayout>
  );
};

export default BookingsPage;