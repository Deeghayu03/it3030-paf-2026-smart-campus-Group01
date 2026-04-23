import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout/DashboardLayout';
import { getAdminUsers, deleteAdminUser } from '../../services/adminService';
import './ManageUsersPage.css';

const ManageUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    setLoading(true);
    setError(null);
    getAdminUsers()
      .then((res) => setUsers(res.data))
      .catch(() => setError('Failed to load students.'))
      .finally(() => setLoading(false));
  };

  const handleDelete = (user) => {
    if (!window.confirm(`Delete "${user.name}" (${user.email})? This cannot be undone.`)) return;
    setDeletingId(user.id);
    deleteAdminUser(user.id)
      .then(() => setUsers((prev) => prev.filter((u) => u.id !== user.id)))
      .catch(() => alert('Failed to delete user. Please try again.'))
      .finally(() => setDeletingId(null));
  };

  const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <DashboardLayout title="Manage Users">
      <div className="manage-users-page">

        <section className="manage-users-banner">
          <div className="manage-users-banner-content">
            <div className="admin-badge">ADMIN</div>
            <h2>Student Accounts</h2>
            <p>View and remove registered student accounts</p>
          </div>
          <div className="manage-users-banner-visual">
            <div className="admin-circle-1" />
            <div className="admin-circle-2" />
          </div>
        </section>

        <div className="manage-users-card">
          {loading ? (
            <div className="manage-users-loading">
              <div className="manage-users-spinner" />
              Loading students...
            </div>
          ) : error ? (
            <div className="manage-users-error">
              <p>{error}</p>
            </div>
          ) : users.length === 0 ? (
            <div className="manage-users-empty">
              <div className="manage-users-empty-icon">👥</div>
              <p>No student accounts found.</p>
            </div>
          ) : (
            <table className="manage-users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Date Joined</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar">
                          {(user.name || user.email).charAt(0).toUpperCase()}
                        </div>
                        <span className="user-name">{user.name || '—'}</span>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(user)}
                        disabled={deletingId === user.id}
                      >
                        {deletingId === user.id ? 'Deleting…' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
};

export default ManageUsersPage;
