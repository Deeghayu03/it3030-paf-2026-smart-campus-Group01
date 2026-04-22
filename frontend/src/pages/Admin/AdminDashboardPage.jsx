import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout/DashboardLayout';
import { getResources } from '../../services/resourceService';
import { ROUTES } from '../../constants/routes';

const AdminDashboardPage = () => {
    const navigate = useNavigate();
    const adminName = localStorage.getItem('name') || 'Admin';

    const [stats, setStats] = useState({
        resources: 0,
        bookings: 0,
        pending: 0,
        tickets: 0,
    });

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                const response = await getResources();

                setStats((prev) => ({
                    ...prev,
                    resources: response.data?.length || 0,
                    bookings: 12,
                    pending: 4,
                    tickets: 7,
                }));
            } catch (error) {
                console.error('Failed to load admin dashboard data:', error);
            }
        };

        loadDashboardData();
    }, []);

    return (
        <DashboardLayout title="Admin Dashboard" notificationCount={3}>
            <div className="dashboard-page">
                <section
                    className="welcome-banner"
                    style={{
                        background: 'linear-gradient(135deg, #eef2ff 0%, #dbeafe 100%)',
                    }}
                >
                    <div className="welcome-content">
                        <h2>Welcome back, {adminName}!</h2>
                        <p>
                            Manage campus resources, booking requests, and maintenance operations
                            from one place.
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
                            <div className="stat-icon-circle" style={{ backgroundColor: '#2563EB' }}>
                                R
                            </div>
                            <h3 className="stat-title">Total Resources</h3>
                        </div>
                        <div className="stat-value">{stats.resources}</div>
                        <p className="stat-subtitle">Resources available in the system</p>
                    </div>

                    <div className="stat-card" style={{ borderTopColor: '#52B788' }}>
                        <div className="stat-header">
                            <div className="stat-icon-circle" style={{ backgroundColor: '#52B788' }}>
                                B
                            </div>
                            <h3 className="stat-title">Total Bookings</h3>
                        </div>
                        <div className="stat-value">{stats.bookings}</div>
                        <p className="stat-subtitle">All submitted booking requests</p>
                    </div>

                    <div className="stat-card" style={{ borderTopColor: '#F4A261' }}>
                        <div className="stat-header">
                            <div className="stat-icon-circle" style={{ backgroundColor: '#F4A261' }}>
                                P
                            </div>
                            <h3 className="stat-title">Pending Requests</h3>
                        </div>
                        <div className="stat-value">{stats.pending}</div>
                        <p className="stat-subtitle">Waiting for admin review</p>
                    </div>

                    <div className="stat-card" style={{ borderTopColor: '#E63946' }}>
                        <div className="stat-header">
                            <div className="stat-icon-circle" style={{ backgroundColor: '#E63946' }}>
                                T
                            </div>
                            <h3 className="stat-title">Open Tickets</h3>
                        </div>
                        <div className="stat-value">{stats.tickets}</div>
                        <p className="stat-subtitle">Require attention or assignment</p>
                    </div>
                </section>

                <h3 className="section-title">Admin Actions</h3>

                <section className="modules-section">
                    <div className="module-card" style={{ borderTopColor: '#2563EB' }}>
                        <div
                            className="module-icon-large"
                            style={{ color: '#2563EB', backgroundColor: '#DBEAFE' }}
                        >
                            R
                        </div>
                        <h3 className="module-title">Manage Resources</h3>
                        <p className="module-desc">
                            Add, edit, and monitor lecture halls, labs, rooms, and equipment.
                        </p>
                        <button
                            className="btn-primary"
                            onClick={() => navigate(ROUTES.ADMIN_RESOURCES)}
                        >
                            Manage Resources
                        </button>
                    </div>

                    <div className="module-card" style={{ borderTopColor: '#52B788' }}>
                        <div
                            className="module-icon-large"
                            style={{ color: '#52B788', backgroundColor: '#D8F3DC' }}
                        >
                            B
                        </div>
                        <h3 className="module-title">Review Bookings</h3>
                        <p className="module-desc">
                            Approve, reject, and monitor booking activity across the campus.
                        </p>
                        <button
                            className="btn-primary"
                            onClick={() => navigate(ROUTES.ADMIN_BOOKINGS)}
                        >
                            View Bookings
                        </button>
                    </div>

                    <div className="module-card" style={{ borderTopColor: '#E63946' }}>
                        <div
                            className="module-icon-large"
                            style={{ color: '#E63946', backgroundColor: '#FDE2E4' }}
                        >
                            T
                        </div>
                        <h3 className="module-title">Manage Tickets</h3>
                        <p className="module-desc">
                            Track incidents, update statuses, and monitor maintenance progress.
                        </p>
                        <button
                            className="btn-primary"
                            onClick={() => navigate(ROUTES.ADMIN_TICKETS)}
                        >
                            View Tickets
                        </button>
                    </div>
                </section>
            </div>
        </DashboardLayout>
    );
};

export default AdminDashboardPage;