import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout/DashboardLayout';

const ResourcesPage = () => {
  // Module A - Team Member 1 builds here
  return (
    <DashboardLayout title="Campus Resources">
      <div className="coming-soon-card">
        <div className="coming-soon-icon">🏛️</div>
        <h2>Campus Resources</h2>
        <p>This module is currently under development. Here you will be able to browse and book lecture halls, labs, and equipment.</p>
      </div>
    </DashboardLayout>
  );
};

export default ResourcesPage;