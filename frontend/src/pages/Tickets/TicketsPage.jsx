import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout/DashboardLayout';

const TicketsPage = () => {
  // Module C - Team Member 3 builds here
  return (
    <DashboardLayout title="Maintenance Hub">
      <div className="coming-soon-card">
        <div className="coming-soon-icon">🔧</div>
        <h2>Maintenance Hub</h2>
        <p>This module is currently under development. Here you will be able to report maintenance issues and track your tickets.</p>
      </div>
    </DashboardLayout>
  );
};

export default TicketsPage;