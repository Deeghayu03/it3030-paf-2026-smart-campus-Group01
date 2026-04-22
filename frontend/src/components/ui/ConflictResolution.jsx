import React from 'react';
import './ConflictResolution.css';
import { formatTime } from '../../utils/formatTime';

const ConflictResolution = ({ suggestions, onSelect }) => {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="conflict-resolution">
      <div className="conflict-header">
        <span className="conflict-icon">⚠️</span>
        <div className="conflict-info">
          <h3>Time slot already booked</h3>
          <p>The resource is already booked for the requested time. Please try one of the suggested slots below.</p>
        </div>
      </div>

      <div className="suggestions-list">
        {suggestions.map((slot, index) => (
          <div key={index} className="suggestion-card">
            <div className="suggestion-details">
              <span className={`suggestion-label ${slot.type === 'RECOMMENDED' ? 'label-recommended' : 'label-available'}`}>
                {slot.type || 'AVAILABLE'}
              </span>
              <div className="suggestion-time">
                {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
              </div>
              <div className="suggestion-context">
                {slot.context || 'Available for the same date'}
              </div>
            </div>
            <button 
              className="btn-select-suggestion" 
              onClick={() => onSelect(slot)}
            >
              Select
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConflictResolution;
