import React from 'react';
import './BookingCard.css';
import { formatTime } from '../../utils/formatTime';

const BookingCard = ({ booking, onDelete, onEdit, onBookAgain, onApprove, onReject, currentUser }) => {
  const {
    id,
    resourceName,
    location,
    bookingDate,
    startTime,
    endTime,
    purpose,
    status,
    rejectedReason,
    createdBy,
    userId,
    role: bookingRole,
    isAdminBooking
  } = booking;

  const isOwner = currentUser && (
    String(createdBy) === String(currentUser.id) || 
    String(userId) === String(currentUser.id) || 
    booking.userEmail === currentUser.email
  );
  const isAdmin = currentUser && currentUser.role === 'ADMIN';

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  const getStatusLabel = (status) => {
    if (status === 'PENDING') return 'Pending Review';
    return status.charAt(0) + status.slice(1).toLowerCase();
  };

  return (
    <div className={`booking-card status-${status?.toLowerCase()}`}>
      {/* HEADER SECTION */}
      <div className="card-header">
        <div className="title-area">
          <h3 className="resource-display-name">{resourceName}</h3>
        </div>
        {(booking.type === 'admin' || bookingRole === 'admin') ? (
          <div className="status-pill pill-approved">
            <span className="status-dot"></span>
            <span className="pill-text">Admin Booking</span>
          </div>
        ) : (
          <div className={`status-pill pill-${status?.toLowerCase()}`}>
            {status === 'APPROVED' && <span className="status-dot"></span>}
            {status === 'PENDING' && (
              <svg className="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            )}
            <span className="pill-text">{getStatusLabel(status)}</span>
          </div>
        )}
      </div>

      {/* LOCATION SUBTEXT */}
      <div className="location-info">
        <svg className="info-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        <span>{location}</span>
      </div>

      {/* MID SECTION: DATE & TIME */}
      <div className="grid-details-row">
        <div className="detail-col">
          <label className="upper-label">DATE</label>
          <div className="value-display">{formatDate(bookingDate)}</div>
        </div>
        <div className="divider-vertical"></div>
        <div className="detail-col">
          <label className="upper-label">TIME</label>
          <div className="value-display highlight-time">
            {formatTime(startTime)} - {formatTime(endTime)}
          </div>
        </div>
      </div>

      {/* FOOTER SECTION: ACTIONS */}
      <div className="card-action-footer">
        {isOwner ? (
          <div className="owner-actions-solid">
            {status === 'PENDING' && (
              <button className="btn-edit-direct" onClick={() => onEdit(booking)}>
                Edit Booking
              </button>
            )}
            
            {(status === 'PENDING' || status === 'APPROVED') && (
              <button className="btn-delete-direct" onClick={() => onDelete(id)}>
                Delete Booking
              </button>
            )}
            {status === 'CANCELLED' && (
              <button className="btn-edit-direct" onClick={() => onBookAgain(booking)}>
                Book Again
              </button>
            )}
          </div>
        ) : (
          <div className="admin-review-panel">
            {isAdminBooking ? (
              <div className="admin-status-indicator">
                <span className="admin-booking-status-text">Admin Booking</span>
              </div>
            ) : (
              status === 'PENDING' && (
                <div className="review-btn-group">
                  <button className="btn-approve-direct" onClick={() => onApprove(id)}>Approve</button>
                  <button className="btn-reject-direct" onClick={() => onReject(booking)}>Reject</button>
                </div>
              )
            )}
            {status === 'REJECTED' && rejectedReason && (
              <div className="rejection-info">
                <p className="rejection-reason-small"><strong>Reason:</strong> {rejectedReason}</p>
              </div>
            ) || status === 'CANCELLED' && (
               <div className="rejection-info">
                <p className="rejection-reason-small">Booking Cancelled</p>
              </div>
            )}
          </div>
        )}

        {status === 'PENDING' && !isOwner && !isAdmin && (
          <div className="pending-footer">
            <span className="muted-italic-text">Modification disabled while pending</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingCard;
