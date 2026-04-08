import React from 'react';
import { useNavigate } from 'react-router-dom';
import AdminDashboardLayout from '../../components/layout/AdminDashboardLayout/AdminDashboardLayout';
import Button from '../../components/ui/Button/Button';
import { ROUTES } from '../../constants/routes';
import '../Dashboard/DashboardPage.css';

const AdminDashboardPage = () => {
    const navigate = useNavigate();
    const adminName = localStorage.getItem('name') || 'Admin';

    return (
        <AdminDashboardLayout title="Dashboard" notificationCount={0}>
            <div className="dashboard-page">
                <section className="welcome-banner">
                    <div className="welcome-content">
                        <h2>Welcome to Admin Dashboard 🛠️</h2>
                        <p>Manage campus resources, bookings, and system operations efficiently.</p>
                    </div>
                    <div className="welcome-emoji">🛠️</div>
                </section>

                <section className="stats-section">
                    <div className="stat-card" style={{ borderTopColor: '#2563EB' }}>
                        <div className="stat-header">
                            <span className="stat-icon">🏛️</span>
                            <h3 className="stat-title">Total Resources</h3>
                        </div>
                        <div className="stat-value">0</div>
                        <p className="stat-subtitle">All campus resources</p>
                    </div>

                    <div className="stat-card" style={{ borderTopColor: '#10B981' }}>
                        <div className="stat-header">
                            <span className="stat-icon">✅</span>
                            <h3 className="stat-title">Active Resources</h3>
                        </div>
                        <div className="stat-value">0</div>
                        <p className="stat-subtitle">Available for booking</p>
                    </div>

                    <div className="stat-card" style={{ borderTopColor: '#F59E0B' }}>
                        <div className="stat-header">
                            <span className="stat-icon">📅</span>
                            <h3 className="stat-title">Pending Bookings</h3>
                        </div>
                        <div className="stat-value">0</div>
                        <p className="stat-subtitle">Waiting for approval</p>
                    </div>

                    <div className="stat-card" style={{ borderTopColor: '#6366F1' }}>
                        <div className="stat-header">
                            <span className="stat-icon">🔔</span>
                            <h3 className="stat-title">Notifications</h3>
                        </div>
                        <div className="stat-value">0</div>
                        <p className="stat-subtitle">Unread</p>
                    </div>
                </section>

                <h3 className="section-title">Quick Actions</h3>

                <section className="modules-section">
                    <div className="module-card" style={{ borderTopColor: '#2563EB' }}>
                        <div className="module-icon">🏛️</div>
                        <h3 className="module-title">Manage Resources</h3>
                        <p className="module-desc">
                            View, search, update, and manage lecture halls, labs, meeting rooms, and equipment.
                        </p>
                        <Button
                            label="Manage Resources"
                            onClick={() => navigate(ROUTES.ADMIN_RESOURCES)}
                        />
                    </div>

                    <div className="module-card" style={{ borderTopColor: '#10B981' }}>
                        <div className="module-icon">➕</div>
                        <h3 className="module-title">Add Resource</h3>
                        <p className="module-desc">
                            Create a new resource with type, capacity, location, availability, and status.
                        </p>
                        <Button
                            label="Add Resource"
                            onClick={() => navigate(ROUTES.ADMIN_ADD_RESOURCE)}
                        />
                    </div>

                    <div className="module-card" style={{ borderTopColor: '#F59E0B' }}>
                        <div className="module-icon">📅</div>
                        <h3 className="module-title">Booking Requests</h3>
                        <p className="module-desc">
                            Review, approve, or reject booking requests submitted by users.
                        </p>
                        <Button
                            label="View Requests"
                            onClick={() => navigate(ROUTES.ADMIN_BOOKINGS)}
                        />
                    </div>
                </section>
            </div>
        </AdminDashboardLayout>
    );
};

export default AdminDashboardPage;