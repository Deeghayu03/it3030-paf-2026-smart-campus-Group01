import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ticketService from '../../services/ticketService';
import './TicketDetailPage.css';

const TicketDetailPage = ({ currentUser }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [ticket, setTicket] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('comments');
  const [selectedImage, setSelectedImage] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [ticketData, historyData] = await Promise.all([
        ticketService.getTicketById(id),
        ticketService.getTicketHistory(id)
      ]);
      setTicket(ticketData);
      setHistory(historyData);
      setError(null);
    } catch (err) {
      console.error("Fetch failed", err);
      setError("Failed to load ticket details. It might have been deleted or you lack access.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="tdp-root tdp-loading">
        <div className="tdp-spinner"></div>
        <span>Loading ticket details...</span>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="tdp-root tdp-error">
        <p>{error || "Ticket not found."}</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="tdp-root">
      {/* Top Bar */}
      <div className="tdp-topbar">
        <button className="tdp-back" onClick={() => navigate(-1)}>
          <span className="back-arrow">←</span> Back to Dashboard
        </button>
        <div className="tdp-id-badge">ID: #{ticket.id}</div>
      </div>

      {/* Header Section */}
      <header className="tdp-header">
        <div className="tdp-header-main">
          <h1 className="tdp-title">{ticket.category.replace('_', ' ')}: {ticket.location}</h1>
          <div className="tdp-chips">
            <span className={`status-pill status-${ticket.status.toLowerCase()}`}>{ticket.status.replace('_', ' ')}</span>
            <span className={`priority-pill priority-${ticket.priority.toLowerCase()}`}>{ticket.priority}</span>
            <span className="category-pill">{ticket.category.toLowerCase()}</span>
          </div>
        </div>
        <div className="tdp-header-meta">
          <div className="meta-row">
            <span className="meta-label">Reported By</span>
            <span className="meta-value">{ticket.reportedByName}</span>
          </div>
          <div className="meta-row">
            <span className="meta-label">Created on</span>
            <span className="meta-value">{new Date(ticket.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="meta-row">
            <span className="meta-label">Assigned to</span>
            <span className="meta-value">{ticket.assignedToName || 'Unassigned'}</span>
          </div>
        </div>
      </header>

      <div className="tdp-body">
        {/* Main Content */}
        <div className="tdp-main-content">
          
          {/* Description */}
          <section className="tdp-section">
            <h2 className="section-title">Issue Description</h2>
            <p className="tdp-description">{ticket.description}</p>
          </section>

          {/* Resolution / Rejection Note */}
          {(ticket.resolutionNotes || ticket.rejectionReason) && (
            <section className={`tdp-section resolution-section ${ticket.status === 'REJECTED' ? 'rejected' : ''}`}>
              <h2 className="section-title">{ticket.status === 'REJECTED' ? 'Rejection Reason' : 'Resolution Notes'}</h2>
              <p className="resolution-text">{ticket.resolutionNotes || ticket.rejectionReason}</p>
            </section>
          )}

          {/* Tabs Section */}
          <section className="tdp-section tdp-tabs-section">
            <div className="tdp-tabs">
              <button 
                className={`tab-btn ${activeTab === 'comments' ? 'active' : ''}`}
                onClick={() => setActiveTab('comments')}
              >
                Comments ({ticket.comments?.length || 0})
              </button>
              <button 
                className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                onClick={() => setActiveTab('history')}
              >
                Audit Trail
              </button>
              <button 
                className={`tab-btn ${activeTab === 'attachments' ? 'active' : ''}`}
                onClick={() => setActiveTab('attachments')}
              >
                Attachments ({ticket.attachmentPaths?.length || 0})
              </button>
            </div>

            <div className="tab-content">
              {activeTab === 'comments' && (
                <CommentThread 
                  ticketId={ticket.id} 
                  initialComments={ticket.comments} 
                  currentUser={currentUser} 
                />
              )}
              {activeTab === 'history' && (
                <AuditTimeline history={history} />
              )}
              {activeTab === 'attachments' && (
                <AttachmentGallery 
                  paths={ticket.attachmentPaths} 
                  onOpen={setSelectedImage} 
                />
              )}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="tdp-sidebar">
          <SlaTimer deadline={ticket.slaDeadline} status={ticket.status} />

          <div className="tdp-section tdp-sidebar-card">
            <h2 className="section-title">Ticket Info</h2>
            <div className="info-grid">
              <span className="info-label">Contact</span>
              <span className="info-value">{ticket.contactDetails || 'None'}</span>
              <span className="info-label">Last Update</span>
              <span className="info-value">{new Date(ticket.updatedAt).toLocaleTimeString()}</span>
              <span className="info-label">Breached?</span>
              <span className={`info-value ${new Date(ticket.slaDeadline) < new Date() ? 'breach-yes' : 'breach-no'}`}>
                {new Date(ticket.slaDeadline) < new Date() ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </aside>
      </div>

      {/* Lightbox Overlay */}
      {selectedImage && (
        <div className="attachment-overlay" onClick={() => setSelectedImage(null)}>
          <div className="attachment-modal" onClick={e => e.stopPropagation()}>
            <button className="overlay-close" onClick={() => setSelectedImage(null)}>×</button>
            <img src={`http://localhost:8080${selectedImage}`} alt="Full sized attachment" />
            <div className="attachment-modal-name">#{ticket.id} Attachment</div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── Sub-Components ────────────────────────────────────────────────────── */

const SlaTimer = ({ deadline, status }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  
  const isResolved = status === 'RESOLVED' || status === 'CLOSED';

  useEffect(() => {
    if (isResolved) return;

    const timer = setInterval(() => {
      const diff = new Date(deadline) - new Date();
      setTimeLeft(diff);
    }, 1000);

    return () => clearInterval(timer);
  }, [deadline, isResolved]);

  if (isResolved) {
    return (
      <div className="sla-timer sla-safe">
        <div className="sla-header">
          <span className="sla-icon">✅</span>
          <span className="sla-label">SLA COMPLETED</span>
        </div>
        <div className="sla-resolved-msg">Goal met on time.</div>
      </div>
    );
  }

  const hours = Math.floor(Math.abs(timeLeft) / (1000 * 60 * 60));
  const mins = Math.floor((Math.abs(timeLeft) % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((Math.abs(timeLeft) % (1000 * 60)) / 1000);
  
  const isBreached = timeLeft < 0;
  const isCritical = !isBreached && timeLeft < 2 * 60 * 60 * 1000; // 2h
  const isWarning = !isBreached && !isCritical && timeLeft < 24 * 60 * 60 * 1000; // 24h
  
  let className = "sla-timer sla-safe";
  if (isBreached) className = "sla-timer sla-breached";
  else if (isCritical) className = "sla-timer sla-critical";
  else if (isWarning) className = "sla-timer sla-warning";

  return (
    <div className={className}>
      <div className="sla-header">
        <span className="sla-icon">{isBreached ? '⚠️' : '🕒'}</span>
        <span className="sla-label">{isBreached ? 'SLA BREACHED' : 'TIME TO RESOLVE'}</span>
      </div>
      <div className="sla-blocks">
        <div className="sla-block"><span className="sla-num">{hours}</span><span className="sla-unit">h</span></div>
        <div className="sla-block"><span className="sla-num">{mins}</span><span className="sla-unit">m</span></div>
        <div className="sla-block"><span className="sla-num">{secs}</span><span className="sla-unit">s</span></div>
      </div>
      <div className="sla-deadline-text">
        {isBreached ? 'Expired on: ' : 'Deadline: '} 
        {new Date(deadline).toLocaleString()}
      </div>
    </div>
  );
};

const AuditTimeline = ({ history }) => {
  if (!history || history.length === 0) return <div className="empty-state">No history recorded for this ticket.</div>;

  return (
    <div className="timeline">
      {history.map((item, i) => (
        <div className="timeline-item" key={item.id}>
          <div className="timeline-spine">
            <div className={`timeline-dot tl-${(item.toStatus || 'OPEN').toLowerCase()}`}></div>
            {i !== history.length - 1 && <div className="timeline-line"></div>}
          </div>
          <div className="timeline-content">
            <div className="timeline-transition">
               {item.fromStatus ? (
                 <>
                   <span className={`status-pill sm status-${item.fromStatus.toLowerCase()}`}>{item.fromStatus}</span>
                   <span className="tl-arrow">→</span>
                 </>
               ) : null}
               <span className={`status-pill sm status-${item.toStatus.toLowerCase()}`}>{item.toStatus}</span>
            </div>
            <div className="timeline-meta">
              <span className="tl-actor">{item.actorName}</span>
              <span className={`tl-role-badge role-${item.actorRole.toLowerCase()}`}>{item.actorRole}</span>
              <span className="tl-time">{new Date(item.createdAt).toLocaleString()}</span>
            </div>
            {item.notes && <div className="timeline-reason">{item.notes}</div>}
          </div>
        </div>
      ))}
    </div>
  );
};

const CommentThread = ({ ticketId, initialComments, currentUser }) => {
  const [comments, setComments] = useState(initialComments || []);
  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = currentUser?.role === 'ADMIN';

  const handlePost = async () => {
    if (!newComment.trim()) return;
    try {
      setIsSubmitting(true);
      const res = await ticketService.addComment(ticketId, { content: newComment });
      setComments([...comments, res]);
      setNewComment('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (commentId) => {
    try {
      const res = await ticketService.updateComment(ticketId, commentId, { content: editContent });
      setComments(comments.map(c => c.id === commentId ? res : c));
      setEditingId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await ticketService.deleteComment(ticketId, commentId);
      setComments(comments.filter(c => c.id !== commentId));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="comments-container">
      <div className="comments-list">
        {comments.length === 0 ? <div className="empty-state">No comments yet.</div> : 
          comments.map(comment => (
            <div className="comment-item" key={comment.id}>
              <div className="comment-avatar">{comment.userName.charAt(0)}</div>
              <div className="comment-body">
                <div className="comment-header">
                  <span className="comment-author">{comment.userName}</span>
                  <span className="comment-time">{new Date(comment.createdAt).toLocaleTimeString()}</span>
                  {comment.content.includes('(edited)') && <span className="comment-edited">(edited)</span>}
                </div>
                
                {editingId === comment.id ? (
                  <div className="comment-edit-row">
                    <textarea 
                      className="comment-edit-input" 
                      value={editContent} 
                      onChange={e => setEditContent(e.target.value)}
                    />
                    <div className="comment-edit-actions">
                      <button className="btn-save" onClick={() => handleUpdate(comment.id)}>Save</button>
                      <button className="btn-cancel" onClick={() => setEditingId(null)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="comment-text">{comment.content.replace(' (edited)', '')}</p>
                    <div className="comment-actions">
                      {(comment.userEmail === currentUser?.email) && (
                        <button className="comment-action-btn" onClick={() => { setEditingId(comment.id); setEditContent(comment.content.replace(' (edited)', '')); }}>Edit</button>
                      )}
                      {(comment.userEmail === currentUser?.email || isAdmin) && (
                        <button className="comment-action-btn danger" onClick={() => handleDelete(comment.id)}>Delete</button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          ))
        }
      </div>

      <div className="comment-input-area">
        <textarea 
          className="comment-new-input" 
          placeholder="Add an update or internal note..." 
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
        />
        <button 
          className="btn-post" 
          disabled={!newComment.trim() || isSubmitting}
          onClick={handlePost}
        >
          {isSubmitting ? 'Posting...' : 'Post Comment'}
        </button>
      </div>
    </div>
  );
};

const AttachmentGallery = ({ paths, onOpen }) => {
  if (!paths || paths.length === 0) return <div className="empty-state">No attachments for this ticket.</div>;

  return (
    <div className="attachment-grid">
      {paths.map((path, i) => (
        <div className="attachment-thumb" key={i} onClick={() => onOpen(path)}>
          <img src={`http://localhost:8080${path}`} alt={`Attachment ${i}`} />
          <div className="attachment-name">Attachment_{i+1}</div>
        </div>
      ))}
    </div>
  );
};

export default TicketDetailPage;
