import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout/DashboardLayout';
import { ROUTES } from '../../constants/routes';

const TechnicianDashboardPage = () => {
    const navigate = useNavigate();
    const technicianName = localStorage.getItem('name') || 'Technician';

    const [stats, setStats] = useState({
        assignedTickets: 0,
        inProgressTickets: 0,
        resolvedTickets: 0,
        urgentTickets: 0,
    });

    useEffect(() => {
        // temporary demo values
        // later connect this to backend API
        setStats({
            assignedTickets: 8,
            inProgressTickets: 3,
            resolvedTickets: 14,
            urgentTickets: 2,
        });
    }, []);

    return (
        <DashboardLayout title="Technician Dashboard" notificationCount={2}>
            <div className="dashboard-page">
                <section
                    className="welcome-banner"
                    style={{
                        background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                    }}
                >
                    <div className="welcome-content">
                        <h2>Welcome back, {technicianName}!</h2>
                        <p>
                            Manage assigned maintenance tickets, update work progress, and
                            complete resolutions from here.
                        </p>
                    </div>

                    <div className="welcome-visual">
                        <div className="abstract-art-small">
                            <div className="circle-1"></div>
                            <div className="circle-2"></div>
                            <div className="rect-1"></div>
                        </div>
                    </div>
                </section>

                <section className="stats-section">
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
                        <div className="stat-value">{stats.assignedTickets}</div>
                        <p className="stat-subtitle">Tickets currently assigned to you</p>
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
                        <div className="stat-value">{stats.inProgressTickets}</div>
                        <p className="stat-subtitle">Work that is actively ongoing</p>
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
                        <div className="stat-value">{stats.resolvedTickets}</div>
                        <p className="stat-subtitle">Tickets completed successfully</p>
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
                        <div className="stat-value">{stats.urgentTickets}</div>
                        <p className="stat-subtitle">High priority issues to handle fast</p>
                    </div>
                </section>

                <h3 className="section-title">Technician Actions</h3>

                <section className="modules-section">
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
                    <section className="modules-section">

                        {/* EXISTING CARD */}
                        <div className="module-card" style={{ borderTopColor: '#FF9800' }}>
                            ...
                        </div>

                        {/* 👉 ADD THIS NEW CARD */}
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

                        {/* EXISTING CARD */}
                        <div className="module-card" style={{ borderTopColor: '#9C27B0' }}>
                            ...
                        </div>

                    </section>

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
                </section>
            </div>
        </DashboardLayout>
    );
};

export default TechnicianDashboardPage;