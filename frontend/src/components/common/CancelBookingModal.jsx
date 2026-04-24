import React, { useState, useEffect } from 'react';
import './CancelBookingModal.css';

const CancelBookingModal = ({ isOpen, onClose, onConfirm, isAdmin }) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setReason('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (isAdmin && !reason.trim()) {
      setError('A reason is required for admin cancellations.');
      return;
    }
    onConfirm(reason);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-scaleIn">
        <div className="modal-header">
          <h2>Cancel Booking</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <div className="modal-body">
          <p className="subtitle">Please provide a reason for cancellation</p>
          
          <textarea
            className={`reason-textarea ${error ? 'input-error' : ''}`}
            placeholder={isAdmin ? "Enter reason (Required)..." : "Enter reason (Optional)..."}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (error) setError('');
            }}
            maxLength={200}
            rows={4}
          />
          
          <div className="meta-info">
            <span className="char-count">{reason.length}/200 characters</span>
            {error && <span className="error-message">{error}</span>}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Back
          </button>
          <button 
            className="btn-danger-modal" 
            onClick={handleConfirm}
            disabled={isAdmin && !reason.trim()}
          >
            Confirm Cancellation
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelBookingModal;
