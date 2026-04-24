import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getResources } from '../../services/resourceService';
import { ROUTES } from '../../constants/routes';
import profileImage from '../../assets/images/profile.png';

const DashboardPage = () => {
  const navigate = useNavigate();
  const studentName = localStorage.getItem('name') || 'Student';

  const [stats, setStats] = useState({
    resources: 0,
    myBookings: 0,
    pendingBookings: 0,
    tickets: 0,
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const response = await getResources();
        const data = response.data?.data || response.data?.resources || response.data;
        const resourcesList = Array.isArray(data) ? data : [];

        setStats({
          resources: resourcesList.length,
          myBookings: 3,
          pendingBookings: 1,
          tickets: 2,
        });
      } catch (error) {
        console.error('Failed to load student dashboard data:', error);
      }
    };

    loadDashboardData();
  }, []);

  return (
    <div className="content-container">
      <div className="page">
        <div className="page-body">
          <section
              className="welcome-banner"
              style={{
                background: 'linear-gradient(135deg, #dff2eb 0%, #b7e4c7 60%, #d8f3dc 100%)',
                boxShadow: '0 4px 20px rgba(82, 183, 136, 0.15)',
                borderRadius: '16px',
                padding: '32px',
                borderLeft: '5px solid #52B788',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '32px',
                width: '100%'
              }}
          >
            <div className="welcome-content" style={{ flex: 1 }}>
              <h2 style={{ color: '#1B4332', fontSize: '2rem', marginBottom: '8px', fontWeight: '700' }}>
                Hello, {studentName}!
              </h2>
              <p style={{ color: '#2D6A4F', fontSize: '1.1rem', maxWidth: '600px', lineHeight: '1.5' }}>
                Book resources, check your requests, and follow up on maintenance
                issues from here.
              </p>
            </div>

            <div className="welcome-image" style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
              <img 
                src={profileImage} 
                alt="Hero" 
                style={{ 
                  height: '220px', 
                  width: 'auto', 
                  objectFit: 'contain',
                  mixBlendMode: 'multiply',
                  opacity: '0.9'
                }} 
              />
            </div>
          </section>

          <section 
            className="stats-section"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '24px'
            }}
          >
            <div className="stat-card" style={{ borderTopColor: '#2563EB' }}>
              <div className="stat-header">
                <div className="stat-icon-circle" style={{ backgroundColor: '#2563EB' }}>
                  R
                </div>
                <h3 className="stat-title">Available Resources</h3>
              </div>
              <div className="stat-value">{stats.resources}</div>
              <p className="stat-subtitle">Browse rooms, labs, and equipment</p>
            </div>

            <div className="stat-card" style={{ borderTopColor: '#52B788' }}>
              <div className="stat-header">
                <div className="stat-icon-circle" style={{ backgroundColor: '#52B788' }}>
                  B
                </div>
                <h3 className="stat-title">My Bookings</h3>
              </div>
              <div className="stat-value">{stats.myBookings}</div>
              <p className="stat-subtitle">Your submitted booking requests</p>
            </div>

            <div className="stat-card" style={{ borderTopColor: '#F4A261' }}>
              <div className="stat-header">
                <div className="stat-icon-circle" style={{ backgroundColor: '#F4A261' }}>
                  P
                </div>
                <h3 className="stat-title">Pending Bookings</h3>
              </div>
              <div className="stat-value">{stats.pendingBookings}</div>
              <p className="stat-subtitle">Requests waiting for approval</p>
            </div>

            <div className="stat-card" style={{ borderTopColor: '#E63946' }}>
              <div className="stat-header">
                <div className="stat-icon-circle" style={{ backgroundColor: '#E63946' }}>
                  T
                </div>
                <h3 className="stat-title">My Tickets</h3>
              </div>
              <div className="stat-value">{stats.tickets}</div>
              <p className="stat-subtitle">Maintenance issues you reported</p>
            </div>
          </section>

          <h3 className="section-title" style={{ marginTop: '32px' }}>Quick Actions</h3>

          <section 
            className="modules-section"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '24px'
            }}
          >
            <div className="module-card" style={{ borderTopColor: '#2563EB' }}>
              <div
                  className="module-icon-large"
                  style={{ color: '#2563EB', backgroundColor: '#DBEAFE' }}
              >
                R
              </div>
              <h3 className="module-title">Browse Resources</h3>
              <p className="module-desc">
                Explore lecture halls, labs, meeting rooms, and equipment.
              </p>
              <button
                  className="btn-primary"
                  onClick={() => navigate(ROUTES.RESOURCES)}
              >
                View Resources
              </button>
            </div>

            <div className="module-card" style={{ borderTopColor: '#52B788' }}>
              <div
                  className="module-icon-large"
                  style={{ color: '#52B788', backgroundColor: '#D8F3DC' }}
              >
                B
              </div>
              <h3 className="module-title">My Bookings</h3>
              <p className="module-desc">
                Check booking status, dates, and manage your requests.
              </p>
              <button
                  className="btn-primary"
                  onClick={() => navigate(ROUTES.BOOKINGS)}
              >
                View Bookings
              </button>
            </div>

            <div className="module-card" style={{ borderTopColor: '#E63946' }}>
              <div
                  className="module-icon-large"
                  style={{ color: '#E63946', backgroundColor: '#FDE2E4' }}
              >
                M
              </div>
              <h3 className="module-title">Maintenance Tickets</h3>
              <p className="module-desc">
                Report faults and track updates for your submitted tickets.
              </p>
              <button
                  className="btn-primary"
                  onClick={() => navigate(ROUTES.TICKETS)}
              >
                View Tickets
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;