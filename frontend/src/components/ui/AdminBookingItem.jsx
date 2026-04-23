import React from 'react';
import './AdminBookingItem.css';
import React, { useState } from 'react';
import './AdminBookingItem.css';

import { formatTime, formatTimeRange } from '../../utils/timeFormatter';
import { formatRole } from '../../utils/helpers';

import BookingTimeline from '../booking/BookingTimeline';
import { getBookingTimeline } from '../../services/bookingService';

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
    cancellationReason,
    cancelledBy
  } = booking;

  const [showTimeline, setShowTimeline] = useState(false);
  const [timelineData, setTimelineData] = useState(null);
  const [timelineLoading, setTimelineLoading] = useState(false);

  const toggleTimeline = async () => {
    setShowTimeline(prev => !prev);
    if (!showTimeline && !timelineData) {
      setTimelineLoading(true);
      try {
        const response = await getBookingTimeline(id);
        setTimelineData(response.data);
      } catch (err) {
        console.error("Failed to fetch timeline:", err);
      } finally {
        setTimelineLoading(false);
      }
    }
  };


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
          <span className="info-text">{formatTimeRange(startTime, endTime)}</span>
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
        {status === 'CANCELLED' && (
          <div className="reason-box cancelled">
            <p style={{ margin: 0, marginBottom: '4px' }}>
              <strong>Cancelled by:</strong> {formatRole(cancelledBy)}
            </p>
            {cancellationReason && (
              <p style={{ margin: 0 }}>
                <strong>Reason:</strong> {cancellationReason}
              </p>
            )}
          </div>
        )}
      </div>
      
      {status === 'APPROVED' && (
        <div className="card-actions">
          <button 
            className="btn-reject-card" 
            style={{ backgroundColor: '#64748b' }}
            onClick={() => onCancel(id)}
          >
            Cancel Booking
          </button>
        </div>
      )}

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

      {/* TIMELINE TOGGLE */}
      <div className="admin-timeline-toggle" style={{ padding: '12px 16px', borderTop: '1px solid #f1f5f9' }}>
        <button 
          onClick={toggleTimeline}
          style={{ 
            background: 'none', 
            border: 'none', 
            fontSize: '0.75rem', 
            fontWeight: '600', 
            color: '#64748b', 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          {showTimeline ? 'Hide History ▲' : 'View History ▼'}
        </button>
      </div>

      {showTimeline && (
        <div className="timeline-container" style={{ padding: '0 16px 16px 16px' }}>
          {timelineLoading ? (
            <div style={{ padding: '10px', textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8' }}>Loading timeline...</div>
          ) : timelineData ? (
            <BookingTimeline timelineData={timelineData} />
          ) : (
            <div style={{ padding: '10px', textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8' }}>No timeline data</div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminBookingItem;
