import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout/DashboardLayout';

const AdminDashboardPage = () => {
  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="coming-soon-card">
        <div className="coming-soon-icon">🛡️</div>
        <h2>Admin Dashboard</h2>
        <p>Welcome to the Administrative portal. This area is restricted to authorized personnel.</p>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboardPage;