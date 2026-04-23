import React from 'react';
import './AdminBookingItem.css';
import { formatTime } from '../../utils/formatTime';

const AdminBookingItem = ({ booking, onApprove, onReject, onCancel }) => {
  const {
    id,
    resourceName,
    userName,
    userEmail,
    bookingDate,
    startTime,
    endTime,
    purpose,
    status,
    rejectedReason,
    cancellationReason
  } = booking;

  const displayDate = (dateStr) => {
    if (!dateStr) return '';
    if (dateStr.includes('-')) {
      const [y, m, d] = dateStr.split('-');
      return `${m}/${d}/${y}`;
    }
    return dateStr;
  };

  const isProcessed = status && status !== 'PENDING';
  const isUrgent = bookingDate === new Date().toISOString().split('T')[0];

  return (
    <div className={`admin-card ${isProcessed ? 'processed' : ''} ${isUrgent ? 'urgent' : ''}`}>
      <div className="card-header">
        <div className="status-container">
          <span className="status-badge" data-status={status}>{status}</span>
          {isUrgent && <span className="urgent-tag">TODAY</span>}
        </div>
        <h3 className="resource-name">{resourceName}</h3>
      </div>

      <div className="card-body">
        <div className="info-row">
          <span className="info-text">{displayDate(bookingDate)}</span>
        </div>
        <div className="info-row">
          <span className="info-text">{formatTime(startTime)} - {formatTime(endTime)}</span>
        </div>
        <div className="info-row">
          <span className="info-text truncate" title={userEmail}>{userEmail}</span>
        </div>
        
        <div className="purpose-section">
          <span className="label">Purpose:</span>
          <p className="purpose-text">{purpose}</p>
        </div>

        {status === 'REJECTED' && rejectedReason && (
          <div className="reason-box rejected">
            <strong>Reason:</strong> {rejectedReason}
          </div>
        )}
        {status === 'CANCELLED' && cancellationReason && (
          <div className="reason-box cancelled">
            <strong>Reason:</strong> {cancellationReason}
          </div>
        )}
      </div>
      
      {status === 'PENDING' && (
        <div className="card-actions">
          <button 
            className="btn-approve-card" 
            onClick={() => onApprove(id)}
          >
            Approve
          </button>
          <button 
            className="btn-reject-card" 
            onClick={() => onReject(booking)}
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminBookingItem;
