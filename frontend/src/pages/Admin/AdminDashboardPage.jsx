import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout/DashboardLayout';
import Button from '../../components/ui/Button/Button';
import ticketService from '../../services/ticketService';
import './AdminDashboardPage.css';

const AdminDashboardPage = () => {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const navigate = useNavigate();
  const [updateData, setUpdateData] = useState({
    status: '',
    resolutionNotes: '',
    rejectionReason: ''
  });

  // Filters
  const [filters, setFilters] = useState({
    status: 'ALL',
    priority: 'ALL',
    category: 'ALL'
  });

  const fetchAllTickets = async () => {
    try {
      setLoading(true);
      const response = await ticketService.getAllTickets();
      setTickets(response.data);
      setFilteredTickets(response.data);
    } catch (err) {
      console.error("Failed to fetch tickets", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllTickets();
  }, []);

  useEffect(() => {
    let result = [...tickets];
    if (filters.status !== 'ALL') {
      result = result.filter(t => t.status === filters.status);
    }
    if (filters.priority !== 'ALL') {
      result = result.filter(t => t.priority === filters.priority);
    }
    if (filters.category !== 'ALL') {
      result = result.filter(t => t.category === filters.category);
    }
    setFilteredTickets(result);
  }, [filters, tickets]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleManageClick = (ticket) => {
    setSelectedTicket(ticket);
    setUpdateData({
      status: ticket.status,
      resolutionNotes: ticket.resolutionNotes || '',
      rejectionReason: ticket.rejectionReason || ''
    });
  };

  const handleUpdateStatus = async () => {
    try {
      await ticketService.updateStatus(selectedTicket.id, updateData);
      alert("Ticket updated successfully!");
      setSelectedTicket(null);
      fetchAllTickets();
    } catch (err) {
      console.error("Update failed", err);
      alert("Failed to update ticket");
    }
  };

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'OPEN').length,
    inProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
    resolved: tickets.filter(t => t.status === 'RESOLVED').length
  };

  const renderBadge = (type, value) => {
    const className = `badge ${type}-${value}`;
    return <span className={className}>{value.replace('_', ' ')}</span>;
  };

  const renderStatusBadge = (status) => {
    return <span className={`badge status-badge ${status}`}>{status.replace('_', ' ')}</span>;
  };

  return (
    <DashboardLayout title="Admin Maintenance Hub">
      <div className="admin-dashboard-container">
        
        {/* STATS OVERVIEW */}
        <div className="admin-stats">
          <div className="admin-stat-card all">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-name">Total Tickets</span>
          </div>
          <div className="admin-stat-card open">
            <span className="stat-value">{stats.open}</span>
            <span className="stat-name">Pending</span>
          </div>
          <div className="admin-stat-card progress">
            <span className="stat-value">{stats.inProgress}</span>
            <span className="stat-name">Active</span>
          </div>
          <div className="admin-stat-card resolved">
            <span className="stat-value">{stats.resolved}</span>
            <span className="stat-name">Completed</span>
          </div>
        </div>

        {/* FILTERS */}
        <div className="filters-bar">
          <div className="filter-group">
            <label className="filter-label">Status:</label>
            <select name="status" className="filter-select" value={filters.status} onChange={handleFilterChange}>
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">Priority:</label>
            <select name="priority" className="filter-select" value={filters.priority} onChange={handleFilterChange}>
              <option value="ALL">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">Category:</label>
            <select name="category" className="filter-select" value={filters.category} onChange={handleFilterChange}>
              <option value="ALL">All Categories</option>
              <option value="ELECTRICAL">Electrical</option>
              <option value="PLUMBING">Plumbing</option>
              <option value="IT_EQUIPMENT">IT / Equipment</option>
              <option value="FURNITURE">Furniture</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>

        {/* TICKETS TABLE */}
        <div className="admin-tickets-table-container">
          {loading ? (
            <div className="empty-state">Loading tickets...</div>
          ) : filteredTickets.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <p>No tickets found matching your filters.</p>
            </div>
          ) : (
            <table className="admin-tickets-table">
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Reported By</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map(ticket => (
                  <tr key={ticket.id} onClick={() => navigate(`/tickets/${ticket.id}`)} style={{cursor: 'pointer'}}>
                    <td>
                      <div className="ticket-subject">
                        <span className="ticket-title">{ticket.location}</span>
                        <span className="ticket-id">#{ticket.id}</span>
                      </div>
                    </td>
                    <td>{ticket.reportedByEmail}</td>
                    <td>{ticket.category.replace('_', ' ')}</td>
                    <td>{renderBadge('priority', ticket.priority)}</td>
                    <td>{renderStatusBadge(ticket.status)}</td>
                    <td>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button className="action-btn btn-manage" onClick={(e) => { e.stopPropagation(); handleManageClick(ticket); }}>
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* MANAGEMENT MODAL */}
        {selectedTicket && (
          <div className="modal-overlay" onClick={() => setSelectedTicket(null)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Manage Ticket #{selectedTicket.id}</h3>
                <button className="close-btn" style={{background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer'}} onClick={() => setSelectedTicket(null)}>×</button>
              </div>
              <div className="modal-body">
                <div className="ticket-details-grid">
                  <div className="detail-item">
                    <label>Reported By</label>
                    <span>{selectedTicket.reportedByEmail}</span>
                  </div>
                  <div className="detail-item">
                    <label>Location</label>
                    <span>{selectedTicket.location}</span>
                  </div>
                  <div className="detail-item">
                    <label>Category</label>
                    <span>{selectedTicket.category.replace('_', ' ')}</span>
                  </div>
                  <div className="detail-item">
                    <label>Priority</label>
                    <span>{selectedTicket.priority}</span>
                  </div>
                  <div className="detail-item" style={{gridColumn: 'span 2'}}>
                    <label>Description</label>
                    <p>{selectedTicket.description}</p>
                  </div>
                </div>

                {selectedTicket.attachmentPaths?.length > 0 && (
                  <div className="attachments-section" style={{marginBottom: '20px'}}>
                    <label style={{display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px'}}>Attachments</label>
                    <div className="admin-attachment-grid">
                      {selectedTicket.attachmentPaths.map((path, i) => (
                        <img 
                          key={i} 
                          src={`http://localhost:8080${path}`} 
                          alt="Attachment" 
                          className="admin-attachment-thumb"
                          onClick={() => window.open(`http://localhost:8080${path}`, '_blank')}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="admin-comments-section" style={{marginBottom: '24px'}}>
                  <label style={{display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '12px'}}>Updates & History</label>
                  {selectedTicket.comments?.length === 0 ? (
                    <p style={{fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic'}}>No comments yet.</p>
                  ) : (
                    <div className="comments-list" style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                      {selectedTicket.comments.map(comment => (
                        <div key={comment.id} className="comment-item" style={{display: 'flex', gap: '12px', background: '#f8fafc', padding: '10px', borderRadius: '8px'}}>
                          <div className="comment-avatar" style={{width: '28px', height: '28px', fontSize: '0.7rem'}}>{comment.userName.charAt(0).toUpperCase()}</div>
                          <div className="comment-content">
                            <div style={{fontSize: '0.75rem', fontWeight: 700, color: '#475569'}}>
                              {comment.userName} <span style={{fontWeight: 400, color: '#94a3b8', marginLeft: '8px'}}>{new Date(comment.createdAt).toLocaleString()}</span>
                            </div>
                            <div style={{fontSize: '0.85rem', color: '#1e293b', marginTop: '2px'}}>{comment.content}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="status-form">
                  <h5>Update Status & Resolution</h5>
                  <div className="form-field">
                    <label>New Status</label>
                    <select 
                      className="filter-select" 
                      style={{width: '100%'}} 
                      value={updateData.status}
                      onChange={e => setUpdateData({...updateData, status: e.target.value})}
                    >
                      <option value="OPEN">Open</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </div>

                  {updateData.status === 'RESOLVED' && (
                    <div className="form-field">
                      <label>Resolution Notes</label>
                      <textarea 
                        className="form-input-full" 
                        rows="3" 
                        placeholder="Detail what was fixed..."
                        value={updateData.resolutionNotes}
                        onChange={e => setUpdateData({...updateData, resolutionNotes: e.target.value})}
                      ></textarea>
                    </div>
                  )}

                  {updateData.status === 'REJECTED' && (
                    <div className="form-field">
                      <label>Rejection Reason</label>
                      <textarea 
                        className="form-input-full" 
                        rows="3" 
                        placeholder="Explain why the ticket is rejected..."
                        value={updateData.rejectionReason}
                        onChange={e => setUpdateData({...updateData, rejectionReason: e.target.value})}
                      ></textarea>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <Button label="Cancel" variant="secondary" onClick={() => setSelectedTicket(null)} />
                <Button label="Save Changes" onClick={handleUpdateStatus} />
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default AdminDashboardPage;