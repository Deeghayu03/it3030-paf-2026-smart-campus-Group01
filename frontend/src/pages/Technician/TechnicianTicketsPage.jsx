import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout/DashboardLayout';
import api from '../../api/axiosConfig';

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
            case 'OPEN': return 'blue';
            case 'IN_PROGRESS': return 'orange';
            case 'RESOLVED': return 'green';
            case 'REJECTED': return 'red';
            case 'CLOSED': return 'gray';
            default: return 'black';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'CRITICAL': return 'red';
            case 'HIGH': return 'orange';
            case 'MEDIUM': return '#ffcc00'; // yellow
            case 'LOW': return 'green';
            default: return 'black';
        }
    };

    return (
        <DashboardLayout title="Assigned Tickets">
            <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
                <h1 style={{ margin: '0 0 5px' }}>Assigned Tickets</h1>
                <p style={{ color: '#666', marginBottom: '20px' }}>Tickets assigned to you by admin</p>

                {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}

                {loading ? (
                    <div>Loading tickets...</div>
                ) : tickets.length === 0 ? (
                    <div style={{ padding: '20px', backgroundColor: '#f9f9f9', border: '1px solid #ddd', borderRadius: '4px' }}>
                        No tickets assigned to you yet.
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f0f0f0', borderBottom: '2px solid #ccc' }}>
                                    <th style={{ padding: '10px' }}>ID</th>
                                    <th style={{ padding: '10px' }}>Reported By</th>
                                    <th style={{ padding: '10px' }}>Location</th>
                                    <th style={{ padding: '10px' }}>Category</th>
                                    <th style={{ padding: '10px' }}>Priority</th>
                                    <th style={{ padding: '10px' }}>Status</th>
                                    <th style={{ padding: '10px' }}>Created At</th>
                                    <th style={{ padding: '10px' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tickets.map(ticket => (
                                    <tr key={ticket.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '10px' }}>#{ticket.id}</td>
                                        <td style={{ padding: '10px' }}>{ticket.reportedByName || ticket.reportedByEmail}</td>
                                        <td style={{ padding: '10px' }}>{ticket.location}</td>
                                        <td style={{ padding: '10px' }}>{ticket.category}</td>
                                        <td style={{ padding: '10px', color: getPriorityColor(ticket.priority), fontWeight: 'bold' }}>{ticket.priority}</td>
                                        <td style={{ padding: '10px', color: getStatusColor(ticket.status), fontWeight: 'bold' }}>{ticket.status}</td>
                                        <td style={{ padding: '10px' }}>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                                        <td style={{ padding: '10px' }}>
                                            <button 
                                                onClick={() => { setSelectedTicket(ticket); setShowViewModal(true); }}
                                                style={{ marginRight: '10px', padding: '5px 10px', cursor: 'pointer', backgroundColor: '#e0e0e0', border: '1px solid #ccc', borderRadius: '4px' }}
                                            >
                                                View
                                            </button>
                                            {(ticket.status === 'OPEN' || ticket.status === 'IN_PROGRESS') && (
                                                <button 
                                                    onClick={() => openUpdateModal(ticket)}
                                                    style={{ padding: '5px 10px', cursor: 'pointer', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
                                                >
                                                    Update
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* View Details Modal */}
            {showViewModal && selectedTicket && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', width: '500px', maxHeight: '80vh', overflowY: 'auto' }}>
                        <h2>Ticket Details #{selectedTicket.id}</h2>
                        <p><strong>Reported By:</strong> {selectedTicket.reportedByName || selectedTicket.reportedByEmail}</p>
                        <p><strong>Location:</strong> {selectedTicket.location}</p>
                        <p><strong>Category:</strong> {selectedTicket.category}</p>
                        <p><strong>Priority:</strong> <span style={{ color: getPriorityColor(selectedTicket.priority), fontWeight: 'bold' }}>{selectedTicket.priority}</span></p>
                        <p><strong>Status:</strong> <span style={{ color: getStatusColor(selectedTicket.status), fontWeight: 'bold' }}>{selectedTicket.status}</span></p>
                        <div style={{ marginTop: '10px' }}><strong>Description:</strong> <p style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px', marginTop: '5px' }}>{selectedTicket.description}</p></div>
                        <p><strong>Contact Details:</strong> {selectedTicket.contactDetails}</p>
                        
                        {selectedTicket.resolutionNotes && (
                            <p style={{ backgroundColor: '#e8f5e9', padding: '10px', borderRadius: '4px' }}><strong>Resolution Notes:</strong> {selectedTicket.resolutionNotes}</p>
                        )}
                        {selectedTicket.rejectionReason && (
                            <p style={{ backgroundColor: '#ffebee', padding: '10px', borderRadius: '4px' }}><strong>Rejection Reason:</strong> {selectedTicket.rejectionReason}</p>
                        )}

                        <h3>Attachments</h3>
                        {selectedTicket.attachmentPaths && selectedTicket.attachmentPaths.length > 0 ? (
                            <ul>
                                {selectedTicket.attachmentPaths.map((path, idx) => (
                                    <li key={idx}><a href={`http://localhost:8080${path}`} target="_blank" rel="noreferrer">Download Attachment {idx + 1}</a></li>
                                ))}
                            </ul>
                        ) : <p>No attachments.</p>}
                        
                        {selectedTicket.comments && selectedTicket.comments.length > 0 && (
                            <div style={{ marginTop: '20px' }}>
                                <h3>Comments</h3>
                                {selectedTicket.comments.map((c, i) => (
                                    <div key={i} style={{ padding: '10px', backgroundColor: '#f9f9f9', marginBottom: '10px', borderRadius: '4px' }}>
                                        <strong>{c.userName}</strong> <span style={{ color: '#888', fontSize: '12px' }}>{new Date(c.createdAt).toLocaleString()}</span>
                                        <p style={{ margin: '5px 0 0 0' }}>{c.content}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        <button 
                            onClick={() => setShowViewModal(false)}
                            style={{ padding: '8px 15px', marginTop: '20px', cursor: 'pointer', backgroundColor: '#e0e0e0', border: 'none', borderRadius: '4px' }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Update Status Modal */}
            {showUpdateModal && selectedTicket && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', width: '400px' }}>
                        <h2 style={{ marginTop: 0 }}>Update Ticket #{selectedTicket.id}</h2>
                        <form onSubmit={handleUpdateSubmit}>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Status</label>
                                <select 
                                    value={updateStatus} 
                                    onChange={(e) => setUpdateStatus(e.target.value)}
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                    required
                                >
                                    <option value="IN_PROGRESS">In Progress</option>
                                    <option value="RESOLVED">Resolved</option>
                                    <option value="REJECTED">Rejected</option>
                                </select>
                            </div>

                            {updateStatus === 'RESOLVED' && (
                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Resolution Notes</label>
                                    <textarea 
                                        value={resolutionNotes} 
                                        onChange={(e) => setResolutionNotes(e.target.value)} 
                                        required 
                                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} 
                                        rows={3} 
                                    />
                                </div>
                            )}

                            {updateStatus === 'REJECTED' && (
                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Rejection Reason</label>
                                    <textarea 
                                        value={rejectionReason} 
                                        onChange={(e) => setRejectionReason(e.target.value)} 
                                        required 
                                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} 
                                        rows={3} 
                                    />
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                                <button type="button" onClick={() => setShowUpdateModal(false)} style={{ padding: '8px 15px', cursor: 'pointer', backgroundColor: '#e0e0e0', border: 'none', borderRadius: '4px' }}>Cancel</button>
                                <button type="submit" style={{ padding: '8px 15px', cursor: 'pointer', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}>Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default TechnicianTicketsPage;
