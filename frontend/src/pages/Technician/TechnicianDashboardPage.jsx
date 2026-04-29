import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout/DashboardLayout';
import { ROUTES } from '../../constants/routes';
import profileImage from '../../assets/images/profile.png';
import './TechnicianDashboardPage.css';

const TechnicianDashboardPage = () => {
    const navigate = useNavigate();
    const technicianName = localStorage.getItem('name') || 'Technician';

    const [stats, setStats] = useState({
        assignedTickets: 8,
        inProgressTickets: 3,
        resolvedTickets: 14,
        urgentTickets: 2,
    });

    return (
        <>
            <div className="content-container">
                <div className="page">
                    <header className="page-header">
                        <p>Track your assignments and system status at a glance.</p>
                    </header>

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
                                marginBottom: '32px'
                            }}
                        >
                            <div className="welcome-content" style={{ flex: 1 }}>
                                <h2 style={{ color: '#1B4332', fontSize: '2rem', marginBottom: '8px', fontWeight: '700' }}>
                                    Welcome back, {technicianName}!
                                </h2>
                                <p style={{ color: '#2D6A4F', fontSize: '1.1rem', maxWidth: '600px', lineHeight: '1.5' }}>
                                    Manage assigned maintenance tickets, update work progress, and
                                    complete resolutions from here.
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
                                    <div
                                        className="stat-icon-circle"
                                        style={{ backgroundColor: '#2563EB' }}
                                    >
                                        A
                                    </div>
                                    <h3 className="stat-title">Assigned Tickets</h3>
                                </div>
                                <div>
                                    <div className="stat-value">{stats.assignedTickets}</div>
                                    <p className="stat-subtitle">Tickets currently assigned to you</p>
                                </div>
                            </div>

                            <div className="stat-card" style={{ borderTopColor: '#F4A261' }}>
                                <div className="stat-header">
                                    <div
                                        className="stat-icon-circle"
                                        style={{ backgroundColor: '#F4A261' }}
                                    >
                                        P
                                    </div>
                                    <h3 className="stat-title">In Progress</h3>
                                </div>
                                <div>
                                    <div className="stat-value">{stats.inProgressTickets}</div>
                                    <p className="stat-subtitle">Work that is actively ongoing</p>
                                </div>
                            </div>

                            <div className="stat-card" style={{ borderTopColor: '#52B788' }}>
                                <div className="stat-header">
                                    <div
                                        className="stat-icon-circle"
                                        style={{ backgroundColor: '#52B788' }}
                                    >
                                        R
                                    </div>
                                    <h3 className="stat-title">Resolved</h3>
                                </div>
                                <div>
                                    <div className="stat-value">{stats.resolvedTickets}</div>
                                    <p className="stat-subtitle">Tickets completed successfully</p>
                                </div>
                            </div>

                            <div className="stat-card" style={{ borderTopColor: '#E63946' }}>
                                <div className="stat-header">
                                    <div
                                        className="stat-icon-circle"
                                        style={{ backgroundColor: '#E63946' }}
                                    >
                                        U
                                    </div>
                                    <h3 className="stat-title">Urgent</h3>
                                </div>
                                <div>
                                    <div className="stat-value">{stats.urgentTickets}</div>
                                    <p className="stat-subtitle">High priority issues to handle fast</p>
                                </div>
                            </div>
                        </section>

                        <section className="actions-section">
                            <h3 className="section-title">Technician Actions</h3>
                            <p className="section-desc">Quick access to common tasks</p>
                            
                            <div className="modules-section">
                                <div className="module-card" style={{ borderTopColor: '#FF9800' }}>
                                    <div
                                        className="module-icon-large"
                                        style={{ color: '#FF9800', backgroundColor: '#FFF3E0' }}
                                    >
                                        T
                                    </div>
                                    <h3 className="module-title">Assigned Tickets</h3>
                                    <p className="module-desc">
                                        View all tickets assigned to you and update their status.
                                    </p>
                                    <button
                                        className="btn-primary"
                                        onClick={() => navigate(ROUTES.TECHNICIAN_TICKETS)}
                                    >
                                        View Tickets
                                    </button>
                                </div>

                                <div className="module-card" style={{ borderTopColor: '#4CAF50' }}>
                                    <div
                                        className="module-icon-large"
                                        style={{ color: '#4CAF50', backgroundColor: '#E8F5E9' }}
                                    >
                                        R
                                    </div>
                                    <h3 className="module-title">Resources</h3>
                                    <p className="module-desc">
                                        View campus rooms, labs, and equipment related to maintenance work.
                                    </p>
                                    <button
                                        className="btn-primary"
                                        onClick={() => navigate(ROUTES.TECHNICIAN_RESOURCES)}
                                    >
                                        View Resources
                                    </button>
                                </div>

                                <div className="module-card" style={{ borderTopColor: '#52B788' }}>
                                    <div
                                        className="module-icon-large"
                                        style={{ color: '#52B788', backgroundColor: '#D8F3DC' }}
                                    >
                                        W
                                    </div>
                                    <h3 className="module-title">Work Updates</h3>
                                    <p className="module-desc">
                                        Update ongoing maintenance work and add resolution notes.
                                    </p>
                                    <button
                                        className="btn-primary"
                                        onClick={() => navigate(ROUTES.TECHNICIAN_TICKETS)}
                                    >
                                        Update Work
                                    </button>
                                </div>

                                <div className="module-card" style={{ borderTopColor: '#9C27B0' }}>
                                    <div
                                        className="module-icon-large"
                                        style={{ color: '#9C27B0', backgroundColor: '#F3E5F5' }}
                                    >
                                        N
                                    </div>
                                    <h3 className="module-title">Notifications</h3>
                                    <p className="module-desc">
                                        Check new assignments, status changes, and important alerts.
                                    </p>
                                    <button
                                        className="btn-primary"
                                        onClick={() => navigate(ROUTES.TECHNICIAN_NOTIFICATIONS)}
                                    >
                                        View Notifications
                                    </button>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </>
    );
};

export default TechnicianDashboardPage;
