import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout/DashboardLayout';
import api from '../../api/axiosConfig';
import ticketService from '../../services/ticketService';
import './AdminTicketsPage.css';

const AdminTicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);

  const [technicians, setTechnicians] = useState([]);

  // Tabs
  const [activeTab, setActiveTab] = useState('All Tickets');

  // Update Form
  const [updateAssigned, setUpdateAssigned] = useState('');

  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        const response = await api.get('/admin/technicians');
        console.log('Technicians loaded:', response.data);
        setTechnicians(response.data);
      } catch (err) {
        console.error('Failed to load technicians:', err);
      }
    };
    fetchTechnicians();

    const fetchTickets = async () => {
      try {
        setLoading(true);
        const response = await ticketService.getAllTickets();
        setTickets(response.data);
      } catch (err) {
        setError('Failed to load tickets');
        console.error('Error loading tickets:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);
  
  const loadTickets = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await ticketService.getAllTickets();
      setTickets(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedTicket) return;

    try {
      const payload = {
        assignedToEmail: updateAssigned
      };
      
      await ticketService.updateStatus(selectedTicket.id, payload);
      setShowUpdate(false);
      alert('Technician assigned successfully!');
      loadTickets();
    } catch (err) {
      alert('Error assigning technician: ' + (err.response?.data?.message || err.message));
    }
  };

  const openUpdateModal = (ticket) => {
    setSelectedTicket(ticket);
    setUpdateAssigned(ticket.assignedToEmail || '');
    setShowUpdate(true);
  };

  const filteredTickets = tickets.filter(t => {
    const matchStatus = statusFilter === 'All' || t.status === statusFilter;
    const matchPriority = priorityFilter === 'All' || t.priority === priorityFilter;
    const searchLower = searchQuery.toLowerCase();
    const matchSearch = !searchQuery || 
        (t.reportedByName && t.reportedByName.toLowerCase().includes(searchLower)) ||
        (t.location && t.location.toLowerCase().includes(searchLower));
    
    let matchTab = true;
    if (activeTab === 'Updated by Technicians') {
      matchTab = ['IN_PROGRESS', 'RESOLVED', 'REJECTED'].includes(t.status);
    }
    
    return matchStatus && matchPriority && matchSearch && matchTab;
  });

  return (
    <>
      <div className="admin-tickets-container">
        <h1 className="page-title">Manage Support Tickets</h1>
        
        {error && <div className="error-banner">{error}</div>}

        <div className="admin-tabs">
          <button 
            className={`tab-btn ${activeTab === 'All Tickets' ? 'active' : ''}`}
            onClick={() => setActiveTab('All Tickets')}
          >
            All Tickets
          </button>
          <button 
            className={`tab-btn ${activeTab === 'Updated by Technicians' ? 'active' : ''}`}
            onClick={() => setActiveTab('Updated by Technicians')}
          >
            Updated by Technicians
          </button>
        </div>

        <div className="filters-bar">
          <input 
            type="text" 
            placeholder="Search by name or location..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="REJECTED">Rejected</option>
            <option value="CLOSED">Closed</option>
          </select>
          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
            <option value="All">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
          <button className="refresh-btn" onClick={loadTickets}>↻ Refresh</button>
        </div>

        {loading ? (
          <div className="loading-spinner">Loading tickets...</div>
        ) : (
          <div className="table-wrapper">
            <table className="tickets-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Reported By</th>
                  <th>Location</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  {activeTab === 'Updated by Technicians' && <th>Technician Notes</th>}
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map(ticket => (
                  <tr key={ticket.id}>
                    <td>#{ticket.id}</td>
                    <td>{ticket.reportedByName || ticket.reportedByEmail}</td>
                    <td>{ticket.location}</td>
                    <td>{ticket.category}</td>
                    <td><span className={`badge priority-${ticket.priority}`}>{ticket.priority}</span></td>
                    <td><span className={`badge status-${ticket.status}`}>{ticket.status}</span></td>
                    {activeTab === 'Updated by Technicians' && (
                      <td className="tech-notes-cell">
                        {ticket.resolutionNotes && <div className="inline-note res-note"><strong>Res:</strong> {ticket.resolutionNotes}</div>}
                        {ticket.rejectionReason && <div className="inline-note rej-note"><strong>Rej:</strong> {ticket.rejectionReason}</div>}
                        {!ticket.resolutionNotes && !ticket.rejectionReason && <span className="text-muted">-</span>}
                      </td>
                    )}
                    <td>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                    <td className="actions-cell">
                      <button className="btn-view" onClick={() => { setSelectedTicket(ticket); setShowDetails(true); }}>View</button>
                      {ticket.status === 'OPEN' && (!ticket.assignedToEmail || ticket.assignedToEmail === '') && (
                        <button className="btn-edit" onClick={() => openUpdateModal(ticket)}>Assign</button>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredTickets.length === 0 && (
                  <tr>
                    <td colSpan={activeTab === 'Updated by Technicians' ? "9" : "8"} className="no-data">No tickets found matching filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* View Details Modal */}
        {showDetails && selectedTicket && (
          <div className="modal-overlay">
            <div className="modal-content-card">
              <h2>Ticket Details #{selectedTicket.id}</h2>
              <div className="ticket-details-grid">
                <div><strong>Reported By:</strong> {selectedTicket.reportedByName} ({selectedTicket.reportedByEmail})</div>
                <div><strong>Location:</strong> {selectedTicket.location}</div>
                <div><strong>Category:</strong> {selectedTicket.category}</div>
                <div><strong>Priority:</strong> {selectedTicket.priority}</div>
                <div><strong>Status:</strong> {selectedTicket.status}</div>
                <div><strong>Assigned To:</strong> {selectedTicket.assignedToName || 'Unassigned'}</div>
                <div className="full-width"><strong>Description:</strong> <p className="desc-box">{selectedTicket.description}</p></div>
                {selectedTicket.contactDetails && <div className="full-width"><strong>Contact:</strong> {selectedTicket.contactDetails}</div>}
              </div>

              {selectedTicket.resolutionNotes && (
                <div className="notes-box res-notes"><strong>Resolution Notes:</strong> {selectedTicket.resolutionNotes}</div>
              )}
              {selectedTicket.rejectionReason && (
                <div className="notes-box rej-notes"><strong>Rejection Reason:</strong> {selectedTicket.rejectionReason}</div>
              )}

              <div className="attachments-section">
                <h3>Attachments ({selectedTicket.attachmentPaths?.length || 0})</h3>
                <ul className="attachment-list">
                  {selectedTicket.attachmentPaths && selectedTicket.attachmentPaths.map((path, idx) => (
                    <li key={idx}><a href={`http://localhost:8080${path}`} target="_blank" rel="noreferrer">Download File {idx + 1}</a></li>
                  ))}
                </ul>
              </div>

              <div className="comments-section">
                <h3>Comments</h3>
                {selectedTicket.comments && selectedTicket.comments.length > 0 ? (
                  <div className="comments-list">
                    {selectedTicket.comments.map(c => (
                      <div key={c.id} className="comment-card">
                        <div className="comment-header">
                          <span className="comment-author">{c.userName || c.userEmail}</span>
                          <span className="comment-time">{new Date(c.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="comment-body">{c.content}</div>
                      </div>
                    ))}
                  </div>
                ) : <p>No comments yet.</p>}
              </div>

              <div className="modal-actions">
                <button className="btn-close" onClick={() => setShowDetails(false)}>Close</button>
              </div>
            </div>
          </div>
        )}

        {/* Update Status Modal */}
        {showUpdate && selectedTicket && (
          <div className="modal-overlay">
            <div className="modal-content-card">
              <h2>Assign Technician to #{selectedTicket.id}</h2>
              <form onSubmit={handleUpdateStatus} className="update-form">
                <div className="form-group">
                  <label>Assign To</label>
                  <select 
                    value={updateAssigned} 
                    onChange={(e) => setUpdateAssigned(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '14px' }}
                    required
                  >
                    <option value="">-- Select Technician --</option>
                    {technicians.map((tech) => (
                      <option key={tech.email} value={tech.email}>
                        {tech.name} ({tech.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn-close" onClick={() => setShowUpdate(false)}>Cancel</button>
                  <button type="submit" className="btn-save">Assign Technician</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminTicketsPage;
