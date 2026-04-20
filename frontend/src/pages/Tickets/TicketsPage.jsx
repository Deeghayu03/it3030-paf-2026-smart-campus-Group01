import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout/DashboardLayout';
import Button from '../../components/ui/Button/Button';
import ticketService from '../../services/ticketService';
import './TicketsPage.css';

const TicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    category: 'OTHER',
    priority: 'MEDIUM',
    location: '',
    description: '',
    contactDetails: ''
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const fileInputRef = useRef(null);

  // Comment state
  const [commentText, setCommentText] = useState({});

  const fetchTickets = async () => {
    try {
      const response = await ticketService.getMyTickets();
      setTickets(response.data);
    } catch (err) {
      console.error("Failed to fetch tickets", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (selectedFiles.length + files.length > 3) {
      alert("Max 3 images allowed");
      return;
    }

    const newFiles = [...selectedFiles, ...files];
    setSelectedFiles(newFiles);

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 1. Create ticket
      const ticketResponse = await ticketService.createTicket(formData);
      const ticketId = ticketResponse.data.id;

      // 2. Upload attachments if any
      if (selectedFiles.length > 0) {
        const fileData = new FormData();
        selectedFiles.forEach(file => fileData.append('files', file));
        await ticketService.uploadAttachments(ticketId, fileData);
      }

      alert("Ticket submitted successfully!");
      setFormData({
        category: 'OTHER',
        priority: 'MEDIUM',
        location: '',
        description: '',
        contactDetails: ''
      });
      setSelectedFiles([]);
      setPreviews([]);
      setIsFormOpen(false);
      fetchTickets();
    } catch (err) {
      console.error("Failed to submit ticket", err);
      alert("Error submitting ticket: " + (err.response?.data?.message || err.message));
    }
  };

  const handleAddComment = async (ticketId) => {
    const text = commentText[ticketId];
    if (!text?.trim()) return;

    try {
      await ticketService.addComment(ticketId, text);
      setCommentText(prev => ({ ...prev, [ticketId]: '' }));
      fetchTickets(); // Refresh to show new comment
    } catch (err) {
      console.error("Failed to add comment", err);
    }
  };

  const stats = {
    open: tickets.filter(t => t.status === 'OPEN').length,
    inProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
    resolved: tickets.filter(t => t.status === 'RESOLVED').length
  };

  return (
    <DashboardLayout title="Maintenance Hub">
      <div className="tickets-container">
        
        {/* STATS */}
        <div className="tickets-stats">
          <div className="stat-item open">
            <span className="stat-num">{stats.open}</span>
            <span className="stat-label">Open Tickets</span>
          </div>
          <div className="stat-item in-progress">
            <span className="stat-num">{stats.inProgress}</span>
            <span className="stat-label">In Progress</span>
          </div>
          <div className="stat-item resolved">
            <span className="stat-num">{stats.resolved}</span>
            <span className="stat-label">Resolved</span>
          </div>
        </div>

        {/* REPORT FORM */}
        <div className="report-panel">
          <div className="panel-header" onClick={() => setIsFormOpen(!isFormOpen)}>
            <h3>{isFormOpen ? 'Close Ticket Form' : 'Report New Issue'}</h3>
            <span>{isFormOpen ? '▲' : '▼'}</span>
          </div>
          
          {isFormOpen && (
            <form className="ticket-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select name="category" className="form-select" value={formData.category} onChange={handleInputChange}>
                  <option value="ELECTRICAL">Electrical</option>
                  <option value="PLUMBING">Plumbing</option>
                  <option value="IT_EQUIPMENT">IT / Equipment</option>
                  <option value="FURNITURE">Furniture</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Priority</label>
                <select name="priority" className="form-select" value={formData.priority} onChange={handleInputChange}>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>

              <div className="form-group full">
                <label className="form-label">Location (Building / Room)</label>
                <input 
                  type="text" 
                  name="location" 
                  className="form-input" 
                  required 
                  placeholder="e.g. Block A, Room 302"
                  value={formData.location}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group full">
                <label className="form-label">Issue Description</label>
                <textarea 
                  name="description" 
                  className="form-textarea" 
                  required 
                  placeholder="Describe the problem in detail..."
                  value={formData.description}
                  onChange={handleInputChange}
                ></textarea>
              </div>

              <div className="form-group full">
                <label className="form-label">Contact Details (Internal Phone / Email)</label>
                <input 
                  type="text" 
                  name="contactDetails" 
                  className="form-input" 
                  placeholder="In case technician needs to reach you"
                  value={formData.contactDetails}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group full">
                <label className="form-label">Attachments (Max 3 Images)</label>
                <div className="upload-zone" onClick={() => fileInputRef.current.click()}>
                  <p>📸 Click to upload images of the issue</p>
                  <div className="preview-grid">
                    {previews.map((src, i) => (
                      <img key={i} src={src} alt="Preview" className="preview-img" />
                    ))}
                  </div>
                </div>
                <input 
                  type="file" 
                  hidden 
                  ref={fileInputRef} 
                  multiple 
                  accept="image/*" 
                  onChange={handleFileChange}
                />
              </div>

              <div className="form-group">
                <Button label="Submit Ticket" type="submit" />
              </div>
            </form>
          )}
        </div>

        {/* TICKETS LIST */}
        <div className="tickets-list">
          <h3>My Reported Issues</h3>
          {loading ? (
            <p>Loading tickets...</p>
          ) : tickets.length === 0 ? (
            <p className="empty-msg">You haven't reported any issues yet.</p>
          ) : (
            tickets.map(ticket => (
              <div key={ticket.id} className={`ticket-card ${ticket.status}`} onClick={() => navigate(`/tickets/${ticket.id}`)} style={{cursor: 'pointer'}}>
                <div className="ticket-summary">
                  <div className="ticket-info">
                    <h4>{ticket.category.replace('_', ' ')}: {ticket.location}</h4>
                    <div className="ticket-meta">
                      <span>Ref: #{ticket.id}</span>
                      <span>📅 {new Date(ticket.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="ticket-badges">
                    <span className={`badge priority-${ticket.priority}`}>{ticket.priority}</span>
                    <span className="badge status-badge">{ticket.status.replace('_', ' ')}</span>
                  </div>
                </div>

              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TicketsPage;