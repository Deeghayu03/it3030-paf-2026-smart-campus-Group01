import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout/DashboardLayout';
import api from '../../api/axiosConfig';
import './TechnicianTicketsPage.css';

const TechnicianTicketsPage = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modals
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    
    // Update States
    const [updateStatus, setUpdateStatus] = useState('');
    const [resolutionNotes, setResolutionNotes] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const response = await api.get('/tickets/technician');
            setTickets(response.data);
            setError(null);
        } catch (err) {
            setError('Failed to load tickets assigned to you.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const openUpdateModal = (ticket) => {
        setSelectedTicket(ticket);
        setUpdateStatus(ticket.status === 'OPEN' ? 'IN_PROGRESS' : ticket.status);
        setResolutionNotes('');
        setRejectionReason('');
        setShowUpdateModal(true);
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                status: updateStatus,
                resolutionNotes: updateStatus === 'RESOLVED' ? resolutionNotes : null,
                rejectionReason: updateStatus === 'REJECTED' ? rejectionReason : null
            };
            await api.put(`/tickets/${selectedTicket.id}/status`, payload);
            setShowUpdateModal(false);
            fetchTickets();
        } catch (err) {
            alert('Failed to update ticket status.');
        }
    };

    // Helper functions for badge colors
    const getStatusColor = (status) => {
        switch (status) {
            case 'OPEN': return '#2563eb';
            case 'IN_PROGRESS': return '#f59e0b';
            case 'RESOLVED': return '#10b981';
            case 'REJECTED': return '#ef4444';
            case 'CLOSED': return '#6b7280';
            default: return '#111827';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'CRITICAL': return '#dc2626';
            case 'HIGH': return '#ea580c';
            case 'MEDIUM': return '#d97706';
            case 'LOW': return '#16a34a';
            default: return '#111827';
        }
    };

    return (
        <>
            <div className="content-container">
                <div className="page">
                    <header className="page-header">
                        <p>Manage and update maintenance tasks assigned to you.</p>
                    </header>

                    <div className="page-body">
                        {error && <div className="error-alert"><span className="icon">⚠</span> {error}</div>}

                        {loading ? (
                            <div className="loading-container">
                                <div className="spinner"></div>
                                <p>Loading tickets...</p>
                            </div>
                        ) : tickets.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">🎫</div>
                                <h3>No tickets assigned</h3>
                                <p>You don't have any maintenance tickets assigned to you at the moment.</p>
                            </div>
                        ) : (
                            <div className="tickets-table-container">
                                <table className="tickets-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Reported By</th>
                                            <th>Location</th>
                                            <th>Category</th>
                                            <th>Priority</th>
                                            <th>Status</th>
                                            <th>Created At</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tickets.map(ticket => (
                                            <tr key={ticket.id}>
                                                <td className="ticket-id">#{ticket.id}</td>
                                                <td>{ticket.reportedByName || ticket.reportedByEmail}</td>
                                                <td>{ticket.location}</td>
                                                <td>{ticket.category}</td>
                                                <td>
                                                    <span className="priority-badge" style={{ color: getPriorityColor(ticket.priority), backgroundColor: `${getPriorityColor(ticket.priority)}15` }}>
                                                        {ticket.priority}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="status-badge" style={{ color: getStatusColor(ticket.status), backgroundColor: `${getStatusColor(ticket.status)}15` }}>
                                                        {ticket.status}
                                                    </span>
                                                </td>
                                                <td>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                                                <td>
                                                    <div className="action-btns">
                                                        <button 
                                                            className="btn-view"
                                                            onClick={() => { setSelectedTicket(ticket); setShowViewModal(true); }}
                                                        >
                                                            View
                                                        </button>
                                                        {(ticket.status === 'OPEN' || ticket.status === 'IN_PROGRESS') && (
                                                            <button 
                                                                className="btn-update"
                                                                onClick={() => openUpdateModal(ticket)}
                                                            >
                                                                Update
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* View Details Modal */}
            {showViewModal && selectedTicket && (
                <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h2>Ticket Details #{selectedTicket.id}</h2>
                        <div className="detail-row">
                            <span className="detail-label">Reported By:</span>
                            <span className="detail-value">{selectedTicket.reportedByName || selectedTicket.reportedByEmail}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Location:</span>
                            <span className="detail-value">{selectedTicket.location}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Category:</span>
                            <span className="detail-value">{selectedTicket.category}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Priority:</span>
                            <span className="priority-badge" style={{ color: getPriorityColor(selectedTicket.priority), backgroundColor: `${getPriorityColor(selectedTicket.priority)}15` }}>
                                {selectedTicket.priority}
                            </span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Status:</span>
                            <span className="status-badge" style={{ color: getStatusColor(selectedTicket.status), backgroundColor: `${getStatusColor(selectedTicket.status)}15` }}>
                                {selectedTicket.status}
                            </span>
                        </div>
                        
                        <div style={{ marginTop: '24px' }}>
                            <span className="detail-label">Description:</span>
                            <div className="description-box">{selectedTicket.description}</div>
                        </div>
                        
                        <div className="detail-row" style={{ marginTop: '16px' }}>
                            <span className="detail-label">Contact Details:</span>
                            <span className="detail-value">{selectedTicket.contactDetails}</span>
                        </div>
                        
                        {selectedTicket.resolutionNotes && (
                            <div style={{ marginTop: '16px' }}>
                                <span className="detail-label">Resolution Notes:</span>
                                <div className="description-box" style={{ backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' }}>{selectedTicket.resolutionNotes}</div>
                            </div>
                        )}
                        {selectedTicket.rejectionReason && (
                            <div style={{ marginTop: '16px' }}>
                                <span className="detail-label">Rejection Reason:</span>
                                <div className="description-box" style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca' }}>{selectedTicket.rejectionReason}</div>
                            </div>
                        )}

                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={() => setShowViewModal(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Update Status Modal */}
            {showUpdateModal && selectedTicket && (
                <div className="modal-overlay" onClick={() => setShowUpdateModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h2>Update Ticket #{selectedTicket.id}</h2>
                        <form onSubmit={handleUpdateSubmit} className="modal-form">
                            <div className="form-group">
                                <label>Status</label>
                                <select 
                                    value={updateStatus} 
                                    onChange={(e) => setUpdateStatus(e.target.value)}
                                    required
                                >
                                    <option value="IN_PROGRESS">In Progress</option>
                                    <option value="RESOLVED">Resolved</option>
                                    <option value="REJECTED">Rejected</option>
                                </select>
                            </div>

                            {updateStatus === 'RESOLVED' && (
                                <div className="form-group">
                                    <label>Resolution Notes</label>
                                    <textarea 
                                        value={resolutionNotes} 
                                        onChange={(e) => setResolutionNotes(e.target.value)} 
                                        required 
                                        rows={4} 
                                        placeholder="Describe how the issue was resolved..."
                                    />
                                </div>
                            )}

                            {updateStatus === 'REJECTED' && (
                                <div className="form-group">
                                    <label>Rejection Reason</label>
                                    <textarea 
                                        value={rejectionReason} 
                                        onChange={(e) => setRejectionReason(e.target.value)} 
                                        required 
                                        rows={4} 
                                        placeholder="Reason for rejecting this ticket..."
                                    />
                                </div>
                            )}

                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowUpdateModal(false)}>Cancel</button>
                                <button type="submit" className="btn-save">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default TechnicianTicketsPage;


