import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout/DashboardLayout';
import './TicketsPage.css';

const TicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [category, setCategory] = useState('EQUIPMENT');
  const [priority, setPriority] = useState('MEDIUM');
  const [description, setDescription] = useState('');
  const [resourceName, setResourceName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [commentText, setCommentText] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [availableResources, setAvailableResources] = useState([]);

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
  }, []);

  useEffect(() => {
    loadResourcesByCategory();
  }, [category]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      
      // Try to load from real API endpoint
      try {
        const response = await fetch('http://localhost:8080/api/tickets', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setTickets(data);
          return;
        }
      } catch (apiError) {
        console.log('API not available, using mock data');
      }
      
      // Fallback to mock data
      const mockTickets = [
        {
          id: 1,
          category: 'EQUIPMENT',
          description: 'Projector not working in Conference Room A',
          priority: 'HIGH',
          status: 'OPEN',
          resourceName: 'Projector - Epson EB-X41',
          contactEmail: 'user@campus.edu',
          contactPhone: '+1234567890',
          assignedTo: null,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          comments: []
        },
        {
          id: 2,
          category: 'FACILITY',
          description: 'Air conditioning not working in Lab 201',
          priority: 'MEDIUM',
          status: 'IN_PROGRESS',
          resourceName: 'Air Conditioning - Lab 201',
          contactEmail: 'staff@campus.edu',
          contactPhone: '+0987654321',
          assignedTo: {
            name: 'Mike Johnson',
            email: 'tech@campus.edu'
          },
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          comments: []
        },
        {
          id: 3,
          category: 'NETWORK',
          description: 'WiFi connection issues in Library',
          priority: 'LOW',
          status: 'RESOLVED',
          resourceName: 'WiFi - Library',
          contactEmail: 'student@campus.edu',
          contactPhone: '+1122334455',
          assignedTo: {
            name: 'Sarah Wilson',
            email: 'network@campus.edu'
          },
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          comments: []
        }
      ];
      
      setTickets(mockTickets);
      
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

  const loadResourcesByCategory = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/tickets/resources/${category}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAvailableResources(data);
      }
    } catch (error) {
      console.error('Error loading resources:', error);
      setAvailableResources([]);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      
      // Add ticket data as JSON
      const ticketData = {
        category,
        description,
        priority,
        resourceId: "resource1",
        resourceName,
        contactEmail: contactEmail || localStorage.getItem('email') || 'user@campus.edu',
        contactPhone: contactPhone || '+1234567890'
      };
      formData.append('ticket', JSON.stringify(ticketData));
      
      // Add files if any
      selectedImages.forEach(file => {
        formData.append('files', file);
      });
      
      const response = await fetch('http://localhost:8080/api/tickets', {
        method: 'POST',
        body: formData // Don't set Content-Type header for FormData
      });
      
      if (response.ok) {
        const data = await response.json();
        setTickets([...tickets, data]);
        resetForm();
        setShowCreateModal(false);
        alert('Ticket created successfully!');
        // Reload tickets to get latest data
        loadTickets();
      } else {
        const errorText = await response.text();
        console.error('Error creating ticket:', errorText);
        alert('Error creating ticket: ' + errorText);
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      alert('Error creating ticket: ' + error.message);
    }
  };

  const createTicketLocally = () => {
    const newTicket = {
      id: Date.now(),
      category,
      description,
      priority,
      resourceName,
      contactEmail: contactEmail || localStorage.getItem('email'),
      contactPhone: contactPhone || '+1234567890',
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
      const response = await fetch(`http://localhost:8080/api/tickets/${selectedTicket.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: commentText.trim(),
          authorName: localStorage.getItem('userName') || 'User'
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setCommentText('');
        setShowCommentModal(false);
        alert('Comment added successfully!');
        // Reload tickets to get latest data
        loadTickets();
      } else {
        const errorText = await response.text();
        console.error('Error adding comment:', errorText);
        alert('Error adding comment: ' + errorText);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Error adding comment: ' + error.message);
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
    setCategory('EQUIPMENT');
    setPriority('MEDIUM');
    setDescription('');
    setResourceName('');
    setContactEmail('');
    setContactPhone('');
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
    <DashboardLayout title="My Tickets">
      <div className="tickets-container">
        <div className="tickets-header">
          <h2 className="tickets-title">My Tickets</h2>
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
                      {ticket.status}
                    </div>
                  </div>
                  
                  <div className="ticket-description">{ticket.description}</div>
                  
                  <div className="ticket-category">Category: {ticket.category}</div>
                  <div className="ticket-resource">Resource: {ticket.resourceName}</div>
                  <div className="ticket-priority">Priority: {ticket.priority}</div>
                  
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
                    <option value="EQUIPMENT">Equipment</option>
                    <option value="FACILITY">Facility</option>
                    <option value="NETWORK">Network</option>
                    <option value="OTHER">Other</option>
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
                  <label>Resource Name</label>
                  <select 
                    value={resourceName}
                    onChange={(e) => setResourceName(e.target.value)}
                    required 
                  >
                    <option value="">Select a resource...</option>
                    {category === 'EQUIPMENT' && (
                      <>
                        <option value="Projector - Epson EB-X41">Projector - Epson EB-X41</option>
                        <option value="Laptop - Dell Latitude 5420">Laptop - Dell Latitude 5420</option>
                        <option value="Printer - HP LaserJet Pro">Printer - HP LaserJet Pro</option>
                        <option value="Scanner - Canon CanoScan">Scanner - Canon CanoScan</option>
                        <option value="Whiteboard - Mobile">Whiteboard - Mobile</option>
                        <option value="Microphone - Shure SM58">Microphone - Shure SM58</option>
                        <option value="Camera - Sony PXW-X70">Camera - Sony PXW-X70</option>
                        <option value="Monitor - Dell 24&quot;">Monitor - Dell 24"</option>
                        <option value="Keyboard - Logitech MX Keys">Keyboard - Logitech MX Keys</option>
                        <option value="Mouse - Logitech MX Master">Mouse - Logitech MX Master</option>
                        <option value="Tablet - iPad Pro">Tablet - iPad Pro</option>
                      </>
                    )}
                    {category === 'FACILITY' && (
                      <>
                        <option value="Air Conditioning - Lab 201">Air Conditioning - Lab 201</option>
                        <option value="Lighting - Classroom 101">Lighting - Classroom 101</option>
                        <option value="Plumbing - Restroom Block A">Plumbing - Restroom Block A</option>
                        <option value="Electrical - Main Building">Electrical - Main Building</option>
                        <option value="Elevator - Tower Block">Elevator - Tower Block</option>
                      </>
                    )}
                    {category === 'NETWORK' && (
                      <>
                        <option value="WiFi - Library">WiFi - Library</option>
                        <option value="Ethernet - Lab 201">Ethernet - Lab 201</option>
                        <option value="VPN Access">VPN Access</option>
                        <option value="Email Server">Email Server</option>
                        <option value="File Server">File Server</option>
                      </>
                    )}
                    {category === 'OTHER' && (
                      <>
                        <option value="General Inquiry">General Inquiry</option>
                        <option value="Software Issue">Software Issue</option>
                        <option value="Account Access">Account Access</option>
                        <option value="Campus Services">Campus Services</option>
                      </>
                    )}
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
                  <label>Contact Email</label>
                  <input 
                    type="email" 
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="your.email@campus.edu"
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label>Contact Phone</label>
                  <input 
                    type="tel" 
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+1234567890"
                    required 
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
                      {selectedTicket.status}
                    </div>
                  </div>
                  <div className="status-group">
                    <label className="status-label">Priority</label>
                    <div className={`priority-badge priority-${selectedTicket.priority?.toLowerCase()}`}>
                      {selectedTicket.priority}
                    </div>
                  </div>
                </div>

                {/* Main Information */}
                <div className="info-section">
                  <div className="info-row">
                    <div className="info-item">
                      <label>Category</label>
                      <div className="info-value">{selectedTicket.category}</div>
                    </div>
                    <div className="info-item">
                      <label>Resource</label>
                      <div className="info-value">{selectedTicket.resourceName}</div>
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
    </DashboardLayout>
  );
};

export default TicketsPage;
