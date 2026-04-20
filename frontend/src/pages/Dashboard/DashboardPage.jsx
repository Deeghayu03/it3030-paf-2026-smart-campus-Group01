import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout/DashboardLayout';
import Button from '../../components/ui/Button/Button';
import { ROUTES } from '../../constants/routes';
import './DashboardPage.css';

const DashboardPage = () => {
  const navigate = useNavigate();
  const studentName = localStorage.getItem('name') || 'Student';

  return (
    <DashboardLayout title="Dashboard" notificationCount={0}>
      <div className="dashboard-page">
        {/* SECTION 1 - Welcome Banner */}
        <section className="welcome-banner">
          <div className="welcome-content">
            <h2>Welcome back, {studentName}!</h2>
            <p>Here is what is happening on campus today</p>
          </div>
          <div className="welcome-visual">
            <div className="abstract-art-small">
              <div className="circle-1"></div>
              <div className="circle-2"></div>
              <div className="rect-1"></div>
            </div>
          </div>
        </section>

        {/* SECTION 2 - Quick Stats Row */}
        <section className="stats-section">
          <div className="stat-card" style={{ borderTopColor: 'var(--primary)' }}>
            <div className="stat-header">
              <div className="stat-icon-circle" style={{ backgroundColor: 'var(--primary)' }}>C</div>
              <h3 className="stat-title">Total Bookings</h3>
            </div>
            <div className="stat-value">0</div>
            <p className="stat-subtitle">All time</p>
          </div>
          
          <div className="stat-card" style={{ borderTopColor: '#52B788' }}>
            <div className="stat-header">
              <div className="stat-icon-circle" style={{ backgroundColor: '#52B788' }}>A</div>
              <h3 className="stat-title">Active Bookings</h3>
            </div>
            <div className="stat-value">0</div>
            <p className="stat-subtitle">Currently approved</p>
          </div>
          
          <div className="stat-card" style={{ borderTopColor: '#F4A261' }}>
            <div className="stat-header">
              <div className="stat-icon-circle" style={{ backgroundColor: '#F4A261' }}>T</div>
              <h3 className="stat-title">Open Tickets</h3>
            </div>
            <div className="stat-value">0</div>
            <p className="stat-subtitle">Awaiting resolution</p>
          </div>
          
          <div className="stat-card" style={{ borderTopColor: '#9C27B0' }}>
            <div className="stat-header">
              <div className="stat-icon-circle" style={{ backgroundColor: '#9C27B0' }}>N</div>
              <h3 className="stat-title">Notifications</h3>
            </div>
            <div className="stat-value">0</div>
            <p className="stat-subtitle">Unread</p>
          </div>
        </section>

        <h3 className="section-title">Quick Actions</h3>

        {/* SECTION 3 - Module Cards Row */}
        <section className="modules-section">
          <div className="module-card" style={{ borderTopColor: 'var(--primary)' }}>
            <div className="module-icon-large" style={{ color: 'var(--primary)', backgroundColor: 'var(--primary-lighter)' }}>R</div>
            <h3 className="module-title">Campus Resources</h3>
            <p className="module-desc">
              Browse lecture halls, labs, meeting rooms and equipment available for booking.
            </p>
            <Button label="Browse Resources" onClick={() => navigate(ROUTES.RESOURCES)} style={{ backgroundColor: 'var(--primary)', borderColor: 'var(--primary)' }} />
          </div>

          <div className="module-card" style={{ borderTopColor: '#52B788' }}>
            <div className="module-icon-large" style={{ color: '#52B788', backgroundColor: '#D8F3DC' }}>B</div>
            <h3 className="module-title">My Bookings</h3>
            <p className="module-desc">
              View and manage your resource booking requests and their approval status.
            </p>
            <Button label="View Bookings" onClick={() => navigate(ROUTES.BOOKINGS)} style={{ backgroundColor: '#52B788', borderColor: '#52B788' }} />
          </div>

          <div className="module-card" style={{ borderTopColor: '#F4A261' }}>
            <div className="module-icon-large" style={{ color: '#F4A261', backgroundColor: '#FDE4D0' }}>M</div>
            <h3 className="module-title">Maintenance Hub</h3>
            <p className="module-desc">
              Report maintenance issues and track the status of your submitted tickets.
            </p>
            <Button label="Report Issue" onClick={() => navigate(ROUTES.TICKETS)} style={{ backgroundColor: '#F4A261', borderColor: '#F4A261' }} />
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;