import React, { useEffect, useState } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import DashboardLayout from '../../components/layout/DashboardLayout/DashboardLayout';
import { getAdminStats } from '../../services/adminService';
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
  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="admin-dashboard-page">

        {/* Welcome Banner */}
        <section className="admin-welcome-banner">
          <div className="admin-welcome-content">
            <div className="admin-badge">ADMIN</div>
            <h2>System Overview</h2>
            <p>Monitor platform activity, users, and resource usage</p>
          </div>
          <div className="admin-welcome-visual">
            <div className="admin-circle-1" />
            <div className="admin-circle-2" />
            <div className="admin-rect-1" />
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
            <section className="admin-stats-section">
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
            <h3 className="admin-section-title">Analytics</h3>
            <section className="admin-analytics-grid">

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
        <h3 className="admin-section-title">Resource Analytics</h3>
        <section className="admin-analytics-grid">

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
    </DashboardLayout>
  );
};

export default AdminDashboardPage;
