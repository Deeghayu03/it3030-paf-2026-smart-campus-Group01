import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout/DashboardLayout';

const NotificationsPage = () => {
  // Module D - Team Member 4 builds here
  return (
    <DashboardLayout title="Notifications">
      <div className="coming-soon-card">
        <div className="coming-soon-icon">🔔</div>
        <h2>Notifications</h2>
        <p>This module is currently under development. Here you will receive important updates and alerts.</p>
      </div>
    </DashboardLayout>
  );
};

export default NotificationsPage;