import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import ticketService from '../../services/ticketService';
import './TicketsPage.css';

const CATEGORIES = [
  { value: 'ELECTRICAL', label: 'Electrical' },
  { value: 'PLUMBING', label: 'Plumbing' },
  { value: 'IT_EQUIPMENT', label: 'IT Equipment' },
  { value: 'FURNITURE', label: 'Furniture' },
  { value: 'OTHER', label: 'Other' },
];

const CATEGORY_TO_TYPE = {
  'ELECTRICAL': null,
  'PLUMBING': null,
  'IT_EQUIPMENT': 'EQUIPMENT',
  'FURNITURE': 'EQUIPMENT',
  'OTHER': null
};

const TicketsPage = () => {
  const formatField = (val) => {
    if (!val) return 'N/A';
    return val.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };


  const [tickets, setTickets] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [category, setCategory] = useState('IT_EQUIPMENT');
  const [priority, setPriority] = useState('MEDIUM');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [resourceId, setResourceId] = useState('');
  const [contactDetails, setContactDetails] = useState('');
  const [commentText, setCommentText] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [allResources, setAllResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  useEffect(() => {
    loadTickets();
    const loadResources = async () => {
      try {
        const response = await api.get('/resources');
        setAllResources(response.data);
      } catch (err) {
        console.error('Failed to load resources:', err);
      }
    };
    loadResources();
  }, []);

  useEffect(() => {
    setResourceId('');
    
    if (!category) {
      setFilteredResources([]);
      return;
    }
    
    const typeFilter = CATEGORY_TO_TYPE[category];
    if (typeFilter === null) {
      setFilteredResources(allResources);
    } else {
      setFilteredResources(
        allResources.filter(r => r.type === typeFilter)
      );
    }
  }, [category, allResources]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const response = await ticketService.getMyTickets();
      setTickets(response.data);
    } catch (error) {
      console.error('Error loading tickets:', error);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const saveTicketsToStorage = (tickets) => {
    try {
      localStorage.setItem('userTickets', JSON.stringify(tickets));
      console.log('Saved tickets to localStorage:', tickets.length);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };


  const handleCreateTicket = async (e) => {
    e.preventDefault();
    
    const isResourceRequired = ['IT_EQUIPMENT', 'FURNITURE'].includes(category);
    if (isResourceRequired && !resourceId) {
      alert('Please select a resource for this category.');
      return;
    }
    
    try {
      const ticketData = {
        location,
        category,
        description,
        priority,
        contactDetails,
        resourceId: resourceId || null
      };
      
      const response = await ticketService.createTicket(ticketData);
      const ticketId = response.data.id;
      
      if (selectedImages.length > 0) {
        const formData = new FormData();
        selectedImages.forEach(file => {
          formData.append('files', file);
        });
        await ticketService.uploadAttachments(ticketId, formData);
      }
      
      resetForm();
      setShowCreateModal(false);
      alert('Ticket created successfully!');
      loadTickets();
    } catch (error) {
      console.error('Error creating ticket:', error);
      alert('Error creating ticket: ' + (error.response?.data?.message || error.message));
    }
  };

  const createTicketLocally = () => {
    const newTicket = {
      id: Date.now(),
      category,
      description,
      priority,
      resourceId,
      contactDetails,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assignedTo: null
    };
    
    const newTickets = [newTicket, ...tickets];
    setTickets(newTickets);
    saveTicketsToStorage(newTickets);
    resetForm();
    setShowCreateModal(false);
    alert('Ticket created successfully!');
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    
    if (!selectedTicket || !selectedTicket.id) {
      alert('Error: No ticket selected');
      return;
    }
    
    if (!commentText.trim()) {
      alert('Please enter a comment');
      return;
    }
    
    try {
      await ticketService.addComment(selectedTicket.id, commentText.trim());
      setCommentText('');
      setShowCommentModal(false);
      alert('Comment added successfully!');
      loadTickets();
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Error adding comment: ' + (error.response?.data?.message || error.message));
    }
  };

  const addCommentLocally = (ticketId, commentText) => {
    const updatedTickets = tickets.map(ticket => {
      if (ticket.id === ticketId) {
        return {
          ...ticket,
          comments: [...(ticket.comments || []), {
            id: Date.now(),
            message: commentText,
            createdAt: new Date().toISOString(),
            author: { name: 'You' }
          }],
          updatedAt: new Date().toISOString()
        };
      }
      return ticket;
    });
    setTickets(updatedTickets);
    saveTicketsToStorage(updatedTickets);
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    
    if (selectedImages.length + files.length > 3) {
      alert('You can only upload up to 3 images');
      return;
    }
    
    setSelectedImages(prev => [...prev, ...files]);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    
    setSelectedImages(newImages);
    setImagePreviews(newPreviews);
  };

  const resetForm = () => {
    setCategory('IT_EQUIPMENT');
    setPriority('MEDIUM');
    setDescription('');
    setLocation('');
    setResourceId('');
    setContactDetails('');
    setSelectedImages([]);
    setImagePreviews([]);
  };

  const calculateTicketAge = (createdAt) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diff = now - created;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    return { days, hours, totalHours: days * 24 + hours };
  };

  const getTimerBgColor = (totalHours, status) => {
    if (status === 'CLOSED' || status === 'RESOLVED') return 'bg-gray-100 text-gray-600';
    if (totalHours > 72) return 'bg-red-100 text-red-600';
    if (totalHours > 48) return 'bg-orange-100 text-orange-600';
    if (totalHours > 24) return 'bg-yellow-100 text-yellow-600';
    return 'bg-green-100 text-green-600';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN': return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800';
      case 'RESOLVED': return 'bg-green-100 text-green-800';
      case 'CLOSED': return 'bg-gray-100 text-gray-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'CRITICAL': return 'text-red-600 font-bold';
      case 'HIGH': return 'text-orange-600 font-semibold';
      case 'MEDIUM': return 'text-yellow-600';
      case 'LOW': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="tickets-page-wrapper">
      <div className="tickets-container">
        <div className="tickets-header">
          <p className="tickets-subtitle">Create and track your maintenance requests</p>
          <button 
            className="create-ticket-btn"
            onClick={() => setShowCreateModal(true)}
          >
            + Create Ticket
          </button>
        </div>

        {loading ? (
          <div className="loading">Loading tickets...</div>
        ) : (
          <div className="tickets-grid">
            {tickets.map(ticket => {
              const age = calculateTicketAge(ticket.createdAt);
              return (
                <div key={ticket.id} className="ticket-card">
                  <div className="ticket-header">
                    <div className="ticket-id">#{ticket.id}</div>
                    <div className={`ticket-status status-${ticket.status?.toLowerCase()}`}>
                      {formatField(ticket.status)}
                    </div>
                  </div>
                  
                  <div className="ticket-description">{ticket.description}</div>
                  
                  <div className="ticket-category">Category: {formatField(ticket.category)}</div>
                  <div className="ticket-resource">Location: {ticket.location}</div>
                  <div className="ticket-priority">Priority: {formatField(ticket.priority)}</div>
                  
                  <div className="ticket-date">
                    Created: {formatTime(ticket.createdAt)}
                  </div>
                  
                  <div className="ticket-actions">
                    <button 
                      className="view-details-btn"
                      onClick={() => {
                        setSelectedTicket(ticket);
                        setShowDetailsModal(true);
                      }}
                    >
                      View Details
                    </button>
                    <button 
                      className="add-comment-btn"
                      onClick={() => {
                        setSelectedTicket(ticket);
                        setShowCommentModal(true);
                      }}
                    >
                      Add Comment
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Create Ticket Modal */}
        {showCreateModal && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h3>Create New Ticket</h3>
                <button className="close-btn" onClick={() => setShowCreateModal(false)}>×</button>
              </div>
              
              <form onSubmit={handleCreateTicket} className="modal-form">
                <div className="form-group">
                  <label>Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} required>
                    {CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Priority</label>
                  <select value={priority} onChange={(e) => setPriority(e.target.value)} required>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Location</label>
                  <input 
                    type="text" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Admin Building Room 104"
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label>{['IT_EQUIPMENT', 'FURNITURE'].includes(category) ? 'Resource (Required)' : 'Resource (Optional)'}</label>
                  <select 
                    value={resourceId}
                    onChange={(e) => setResourceId(e.target.value)}
                  >
                    <option value="">-- Select Resource --</option>
                    {filteredResources.map((resource) => (
                      <option key={resource.id} value={resource.id}>
                        {resource.name} - {resource.location}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Description</label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the issue in detail..."
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Contact Details</label>
                  <textarea
                    placeholder="Enter your contact information (email, phone, or both)..."
                    value={contactDetails}
                    onChange={(e) => setContactDetails(e.target.value)}
                    rows={2}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>
                
                <div className="form-group attachment-section">
                  <label className="attachment-label">
                    <span className="attachment-icon">Attachments</span>
                    <span className="attachment-count">({selectedImages.length}/3 images)</span>
                  </label>
                  <div className="attachment-area">
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="attachment-input"
                      id="file-input"
                    />
                    <label htmlFor="file-input" className="attachment-dropzone">
                      <div className="dropzone-content">
                        <div className="dropzone-icon">+</div>
                        <div className="dropzone-text">
                          <span className="dropzone-main">Click to upload or drag and drop</span>
                          <span className="dropzone-sub">PNG, JPG, GIF up to 3 images</span>
                        </div>
                      </div>
                    </label>
                    {imagePreviews.length > 0 && (
                      <div className="image-previews">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="preview-container">
                            <img src={preview} alt={`Preview ${index}`} className="preview-image" />
                            <button 
                              type="button" 
                              className="remove-image" 
                              onClick={() => removeImage(index)}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="modal-actions">
                  <button type="button" className="cancel-btn" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="submit-btn">
                    Create Ticket
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Details Modal */}
        {showDetailsModal && selectedTicket && (
          <div className="modal-overlay">
            <div className="modal details-modal">
              <div className="modal-header">
                <div className="modal-title-section">
                  <h3>Ticket Details</h3>
                  <div className="ticket-id-badge">#{selectedTicket.id}</div>
                </div>
                <button className="close-btn" onClick={() => setShowDetailsModal(false)}>×</button>
              </div>
              
              <div className="modal-content">
                {/* Status and Priority Section */}
                <div className="status-section">
                  <div className="status-group">
                    <label className="status-label">Status</label>
                    <div className={`status-badge status-${selectedTicket.status?.toLowerCase()}`}>
                      {formatField(selectedTicket.status)}
                    </div>
                  </div>
                  <div className="status-group">
                    <label className="status-label">Priority</label>
                    <div className={`priority-badge priority-${selectedTicket.priority?.toLowerCase()}`}>
                      {formatField(selectedTicket.priority)}
                    </div>
                  </div>
                </div>

                {/* Main Information */}
                <div className="info-section">
                  <div className="info-row">
                    <div className="info-item">
                      <label>Category</label>
                      <div className="info-value">{formatField(selectedTicket.category)}</div>
                    </div>
                    <div className="info-item">
                      <label>Location</label>
                      <div className="info-value">{selectedTicket.location}</div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="description-section">
                  <label>Description</label>
                  <div className="description-content">
                    {selectedTicket.description}
                  </div>
                </div>

                {/* Attachments Section */}
                <div className="attachments-section" style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                  <h4 style={{ marginBottom: '10px', color: '#2D6A4F' }}>Attachments ({selectedTicket.attachmentPaths?.length || 0})</h4>
                  {selectedTicket.attachmentPaths && selectedTicket.attachmentPaths.length > 0 ? (
                    <div className="attachment-list">
                      {selectedTicket.attachmentPaths.map((path, index) => (
                        <a 
                          key={index}
                          href={`http://localhost:8080/${path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ display: 'block', marginBottom: '8px', color: '#52B788', textDecoration: 'none', fontWeight: '500' }}
                        >
                          📎 Attachment {index + 1}
                        </a>
                      ))}
                    </div>
                  ) : <p style={{ fontSize: '14px', color: '#666' }}>No attachments</p>}
                </div>

                {/* Contact Information */}
                <div className="contact-section">
                  <h4>Contact Information</h4>
                  <div className="contact-grid">
                    <div className="contact-item">
                      <div className="contact-icon">Email</div>
                      <div className="contact-value">{selectedTicket.contactEmail}</div>
                    </div>
                    <div className="contact-item">
                      <div className="contact-icon">Phone</div>
                      <div className="contact-value">{selectedTicket.contactPhone}</div>
                    </div>
                  </div>
                </div>

                {/* Assignment */}
                {selectedTicket.assignedTo && (
                  <div className="assignment-section">
                    <h4>Assignment</h4>
                    <div className="assignment-info">
                      <div className="assigned-to">
                        <div className="assigned-avatar">
                          {selectedTicket.assignedTo.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <div className="assigned-name">{selectedTicket.assignedTo.name}</div>
                          <div className="assigned-role">{selectedTicket.assignedTo.email}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Comments Section */}
                <div className="comments-section">
                  <h4>Comments</h4>
                  {selectedTicket.comments && selectedTicket.comments.length > 0 ? (
                    <div className="comments-list">
                      {selectedTicket.comments.map(comment => (
                        <div key={comment.id} className="comment-item">
                          <div className="comment-header">
                            <div className="comment-author">{comment.author?.name || 'Anonymous'}</div>
                            <div className="comment-time">{formatTime(comment.createdAt)}</div>
                          </div>
                          <div className="comment-message">{comment.message}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-comments">
                      <p>No comments yet. Be the first to add a comment!</p>
                    </div>
                  )}
                </div>

                {/* Timeline */}
                <div className="timeline-section">
                  <h4>Timeline</h4>
                  <div className="timeline-item">
                    <div className="timeline-dot created"></div>
                    <div className="timeline-content">
                      <div className="timeline-label">Created</div>
                      <div className="timeline-time">
                        {formatTime(selectedTicket.createdAt)}
                      </div>
                    </div>
                  </div>
                  {selectedTicket.updatedAt && selectedTicket.updatedAt !== selectedTicket.createdAt && (
                    <div className="timeline-item">
                      <div className="timeline-dot updated"></div>
                      <div className="timeline-content">
                        <div className="timeline-label">Last Updated</div>
                        <div className="timeline-time">
                          {formatTime(selectedTicket.updatedAt)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="modal-actions">
                <button className="close-btn" onClick={() => setShowDetailsModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Comment Modal */}
        {showCommentModal && selectedTicket && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h3>Add Comment - Ticket #{selectedTicket.id}</h3>
                <button className="close-btn" onClick={() => setShowCommentModal(false)}>×</button>
              </div>
              
              <form onSubmit={handleAddComment} className="modal-form">
                <div className="form-group">
                  <label>Comment</label>
                  <textarea 
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Enter your comment..."
                    required
                  />
                </div>
                
                <div className="modal-actions">
                  <button type="button" className="cancel-btn" onClick={() => setShowCommentModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="submit-btn">
                    Add Comment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketsPage;
