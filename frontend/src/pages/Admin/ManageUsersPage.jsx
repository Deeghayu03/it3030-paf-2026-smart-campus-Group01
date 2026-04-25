import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout/DashboardLayout';
import api from '../../api/axiosConfig';

const ManageUsersPage = () => {
  const [activeTab, setActiveTab] = useState('STUDENTS');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (activeTab === 'STUDENTS') {
      fetchStudents();
    } else {
      fetchTechnicians();
    }
  }, [activeTab]);

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/users/students');
      setUsers(res.data);
    } catch (err) {
      setError('Failed to load students.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTechnicians = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/users/technicians');
      setUsers(res.data);
    } catch (err) {
      setError('Failed to load technicians.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(users.filter(u => u.id !== id));
    } catch (err) {
      alert('Failed to delete user.');
    }
  };

  const handleAddTechnician = async (e) => {
    e.preventDefault();
    setFormError('');
    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/admin/users/technicians', {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      setIsModalOpen(false);
      setFormData({ name: '', email: '', password: '', confirmPassword: '' });
      fetchTechnicians();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create technician');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Styles
  const styles = {
    container: { padding: '20px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    tabs: { display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #e0e0e0' },
    tab: (active) => ({
      padding: '10px 20px',
      cursor: 'pointer',
      borderBottom: active ? '3px solid #52B788' : '3px solid transparent',
      color: active ? '#52B788' : '#666',
      fontWeight: '600',
      transition: 'all 0.2s'
    }),
    addButton: {
      backgroundColor: '#52B788',
      color: 'white',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontWeight: '600'
    },
    table: { width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
    th: { textAlign: 'left', padding: '15px', backgroundColor: '#f8f9fa', color: '#666', fontSize: '13px', textTransform: 'uppercase' },
    td: { padding: '15px', borderTop: '1px solid #eee' },
    avatar: { width: '35px', height: '35px', borderRadius: '50%', backgroundColor: '#dff7ec', color: '#52B788', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' },
    deleteBtn: { backgroundColor: '#ffebee', color: '#d32f2f', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modalContent: { backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '400px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' },
    formGroup: { marginBottom: '15px' },
    label: { display: 'block', marginBottom: '5px', fontSize: '14px', color: '#333' },
    input: { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' },
    error: { color: '#d32f2f', fontSize: '13px', marginTop: '10px' },
    modalButtons: { display: 'flex', gap: '10px', marginTop: '20px' },
    cancelBtn: { flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer', backgroundColor: 'white' },
    submitBtn: { flex: 1, padding: '10px', backgroundColor: '#52B788', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }
  };

  return (
    <DashboardLayout title="Manage Users">
      <div style={styles.container}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #e0e0e0' }}>
          <div style={{ ...styles.tabs, marginBottom: 0, borderBottom: 'none' }}>
            <div style={styles.tab(activeTab === 'STUDENTS')} onClick={() => setActiveTab('STUDENTS')}>Students</div>
            <div style={styles.tab(activeTab === 'TECHNICIANS')} onClick={() => setActiveTab('TECHNICIANS')}>Technicians</div>
          </div>
          {activeTab === 'TECHNICIANS' && (
            <button style={styles.addButton} onClick={() => setIsModalOpen(true)}>
              + Add Technician
            </button>
          )}
        </div>

        {loading ? (
          <p>Loading users...</p>
        ) : error ? (
          <div style={styles.error}>{error}</div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>User</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Date Joined</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={styles.avatar}>{(u.name || u.email).charAt(0).toUpperCase()}</div>
                      <span style={{ fontWeight: 500 }}>{u.name || 'No Name'}</span>
                    </div>
                  </td>
                  <td style={styles.td}>{u.email}</td>
                  <td style={styles.td}>{formatDate(u.createdAt)}</td>
                  <td style={styles.td}>
                    <button style={styles.deleteBtn} onClick={() => handleDelete(u.id, u.name || u.email)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {isModalOpen && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalContent}>
              <h3>Add New Technician</h3>
              <form onSubmit={handleAddTechnician}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Full Name</label>
                  <input
                    style={styles.input}
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Email Address</label>
                  <input
                    style={styles.input}
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Password</label>
                  <input
                    style={styles.input}
                    type="password"
                    required
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Confirm Password</label>
                  <input
                    style={styles.input}
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                  />
                </div>
                {formError && <div style={styles.error}>{formError}</div>}
                <div style={styles.modalButtons}>
                  <button type="button" style={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>Cancel</button>
                  <button type="submit" style={styles.submitBtn} disabled={submitting}>
                    {submitting ? 'Creating...' : 'Create Technician'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ManageUsersPage;
