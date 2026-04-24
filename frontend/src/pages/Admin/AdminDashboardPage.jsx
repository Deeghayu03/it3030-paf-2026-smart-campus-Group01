import React, { useEffect, useState } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import DashboardLayout from '../../components/layout/DashboardLayout/DashboardLayout';
import { getAdminStats } from '../../services/adminService';
import profileImage from '../../assets/images/profile.png';
import './AdminDashboardPage.css';
import axios from "axios";

const BOOKING_COLORS = ['#F59E0B', '#2D6A4F', '#EF4444', '#94A3B8'];
const TICKET_COLORS = ['#F59E0B', '#3B82F6', '#2D6A4F', '#94A3B8', '#EF4444'];
const USER_COLORS = ['#2D6A4F', '#52B788', '#9C27B0'];

const STAT_CARDS = [
  {
    key: 'totalTechnicians',
    title: 'Total Technicians',
    subtitle: 'Active technicians',
    color: '#52B788',
    icon: '🔧',
  },
  {
    key: 'totalStudents',
    title: 'Total Students',
    subtitle: 'Registered students',
    color: '#2D6A4F',
    icon: '🎓',
  },
  {
    key: 'totalBookings',
    title: 'Total Bookings',
    subtitle: 'All time',
    color: '#3B82F6',
    icon: '📅',
  },
  {
    key: 'totalTickets',
    title: 'Total Tickets',
    subtitle: 'Maintenance requests',
    color: '#F59E0B',
    icon: '🎫',
  },
];

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState({
    topResources: [],
    peakBookingHours: []
  });
  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log("Token:", token); // check if token exists
    axios.get("http://localhost:8080/api/admin/analytics", {
      headers: { Authorization: `Bearer ${token}` }
    })
        .then((res) => {
          console.log("Analytics response:", res.data); // check what comes back
          setAnalytics({
            topResources: res.data?.topResources || [],
            peakBookingHours: res.data?.peakBookingHours || []
          });
        })
        .catch((err) => {
          console.error("Analytics failed:", err.response?.status, err.response?.data);
        });
  }, []);
  useEffect(() => {
    getAdminStats()
      .then((res) => setStats(res.data))
      .catch(() => setError('Failed to load dashboard stats.'))
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get("http://localhost:8080/api/admin/analytics", {
      headers: { Authorization: `Bearer ${token}` }
    })
        .then((res) => {
          setAnalytics({
            topResources: res.data?.topResources || [],
            peakBookingHours: res.data?.peakBookingHours || []
          });
        })
        .catch((err) => {
          console.error("Analytics failed:", err);
        });
  }, []);
  return    <div className="content-container">
      <div className="page">
        <div className="page-body">
          {/* Welcome Banner */}
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
                  System Overview
              </h2>
              <p style={{ color: '#2D6A4F', fontSize: '1.1rem', maxWidth: '600px', lineHeight: '1.5' }}>
                  Monitor platform activity, users, and resource usage.
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

          {/* Stat Cards */}
          {loading ? (
            <div className="admin-loading-state">
              <div className="admin-spinner" />
              Loading stats...
            </div>
          ) : error ? (
            <div className="admin-error-state">{error}</div>
          ) : (
            <>
              <section 
                className="admin-stats-section"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '24px'
                }}
              >
                {STAT_CARDS.map((card) => (
                  <div
                    key={card.key}
                    className="admin-stat-card"
                    style={{ borderTopColor: card.color }}
                  >
                    <div className="admin-stat-header">
                      <div
                        className="admin-stat-icon"
                        style={{ backgroundColor: card.color + '1A' }}
                      >
                        {card.icon}
                      </div>
                      <h3 className="admin-stat-title">{card.title}</h3>
                    </div>
                    <div className="admin-stat-value">
                      {stats[card.key] ?? 0}
                    </div>
                    <p className="admin-stat-subtitle">{card.subtitle}</p>
                  </div>
                ))}
              </section>

              {/* Analytics */}
              <h3 className="admin-section-title" style={{ marginTop: '32px' }}>Analytics</h3>
              <section 
                className="admin-analytics-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                  gap: '24px'
                }}
              >

                {/* Bookings by Status — Pie */}
                <div className="admin-chart-card">
                  <h4>Bookings by Status</h4>
                  <div className="admin-chart-wrapper">
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={stats.bookingsByStatus}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={75}
                          innerRadius={35}
                        >
                          {stats.bookingsByStatus.map((_, i) => (
                            <Cell key={i} fill={BOOKING_COLORS[i % BOOKING_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend iconSize={10} iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Tickets by Status — Bar */}
                <div className="admin-chart-card">
                  <h4>Tickets by Status</h4>
                  <div className="admin-chart-wrapper">
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart
                        data={stats.ticketsByStatus}
                        margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {stats.ticketsByStatus.map((_, i) => (
                            <Cell key={i} fill={TICKET_COLORS[i % TICKET_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* User Distribution — Pie */}
                <div className="admin-chart-card">
                  <h4>User Distribution</h4>
                  <div className="admin-chart-wrapper">
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={stats.userDistribution}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={75}
                          innerRadius={35}
                        >
                          {stats.userDistribution.map((_, i) => (
                            <Cell key={i} fill={USER_COLORS[i % USER_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend iconSize={10} iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </section>
            </>
          )}
          {/* Resource Analytics */}
          <h3 className="admin-section-title" style={{ marginTop: '32px' }}>Resource Analytics</h3>
          <section 
            className="admin-analytics-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '24px'
            }}
          >

            <div className="admin-chart-card">
              <h4>Top Resources</h4>
              {(analytics.topResources?.length ?? 0) === 0 ? (
                  <p className="admin-no-data">No booking data available yet</p>
              ) : (
                  <ul className="admin-analytics-list">
                    {analytics.topResources.map((item, index) => (
                        <li key={index}>
                          <span>{item.name}</span>
                          <span className="admin-analytics-badge">{item.value} bookings</span>
                        </li>
                    ))}
                  </ul>
              )}
            </div>

            <div className="admin-chart-card">
              <h4>Peak Booking Hours</h4>
              {(analytics.peakBookingHours?.length ?? 0) === 0 ? (
                  <p className="admin-no-data">No booking data available yet</p>
              ) : (
                  <ul className="admin-analytics-list">
                    {analytics.peakBookingHours.map((item, index) => (
                        <li key={index}>
                          <span>{item.hour}</span>
                          <span className="admin-analytics-badge">{item.value} bookings</span>
                        </li>
                    ))}
                  </ul>
              )}
            </div>

          </section>
        </div>
      </div>
    </div>;
};

export default AdminDashboardPage;
