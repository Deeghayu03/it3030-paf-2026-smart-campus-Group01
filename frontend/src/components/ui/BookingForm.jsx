import React, { useState, useEffect } from 'react';
import './BookingForm.css';
import Button from './Button/Button';
import resourceService from '../../services/resourceService';

const BookingForm = ({ onSubmit, loading, initialData = null, conflictSuggestions = null, onSelectSuggestion = null }) => {
  const [formData, setFormData] = useState({
    resourceId: '',
    bookingDate: '',
    startTime: '',
    endTime: '',
    purpose: '',
    expectedAttendees: ''
  });

  const [resources, setResources] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await resourceService.getAllResources();
        setResources(response.data);
      } catch (err) {
        console.error('Error fetching resources:', err);
      }
    };
    fetchResources();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        resourceId: initialData.resourceId || '',
        bookingDate: initialData.bookingDate || initialData.date || '',
        startTime: initialData.startTime || '',
        endTime: initialData.endTime || '',
        purpose: initialData.purpose || '',
        expectedAttendees: initialData.expectedAttendees || initialData.attendees || ''
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.resourceId) newErrors.resourceId = 'Resource is required';
    if (!formData.bookingDate) newErrors.bookingDate = 'Date is required';
    if (!formData.startTime) newErrors.startTime = 'Start time is required';
    if (!formData.endTime) newErrors.endTime = 'End time is required';
    if (!formData.purpose) newErrors.purpose = 'Purpose is required';

    if (formData.startTime && formData.endTime) {
      if (formData.endTime <= formData.startTime) {
        newErrors.endTime = 'End time must be after start time';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form className="booking-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="resourceId">Select Resource*</label>
        <select 
          id="resourceId" 
          name="resourceId" 
          value={formData.resourceId} 
          onChange={handleChange}
          className={errors.resourceId ? 'error' : ''}
        >
          <option value="">-- Select a resource --</option>
          {resources.map(res => (
            <option key={res.id} value={res.id}>{res.name} ({res.location})</option>
          ))}
        </select>
        {errors.resourceId && <span className="error-text">{errors.resourceId}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="bookingDate">Date*</label>
        <input 
          type="date" 
          id="bookingDate" 
          name="bookingDate" 
          value={formData.bookingDate} 
          onChange={handleChange}
          className={errors.bookingDate ? 'error' : ''}
          min={new Date().toISOString().split('T')[0]}
        />
        {errors.bookingDate && <span className="error-text">{errors.bookingDate}</span>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="startTime">Start Time*</label>
          <input 
            type="time" 
            id="startTime" 
            name="startTime" 
            value={formData.startTime} 
            onChange={handleChange}
            className={errors.startTime ? 'error' : ''}
          />
          {errors.startTime && <span className="error-text">{errors.startTime}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="endTime">End Time*</label>
          <input 
            type="time" 
            id="endTime" 
            name="endTime" 
            value={formData.endTime} 
            onChange={handleChange}
            className={errors.endTime ? 'error' : ''}
          />
          {errors.endTime && <span className="error-text">{errors.endTime}</span>}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="purpose">Purpose of Booking*</label>
        <textarea 
          id="purpose" 
          name="purpose" 
          value={formData.purpose} 
          onChange={handleChange}
          placeholder="Briefly describe the purpose of your booking"
          className={errors.purpose ? 'error' : ''}
          rows="3"
        ></textarea>
        {errors.purpose && <span className="error-text">{errors.purpose}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="expectedAttendees">Number of Attendees (Optional)</label>
        <input 
          type="number" 
          id="expectedAttendees" 
          name="expectedAttendees" 
          value={formData.expectedAttendees} 
          onChange={handleChange}
          min="1"
        />
      </div>

      {conflictSuggestions && (
        <div className="conflict-suggestions-box">
          <p className="conflict-message">
            ⚠️ Time slot already booked
          </p>
          <p className="suggestions-hint">Available time slots:</p>
          <div className="suggestions-list">
            {conflictSuggestions.map((slot, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onSelectSuggestion(slot)}
                className="suggestion-pill"
              >
                {slot.startTime} - {slot.endTime}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="form-actions">
        <Button 
          type="submit" 
          label={loading ? "Submitting..." : "Submit Booking Request"} 
          disabled={loading}
          variant="primary"
        />
      </div>
    </form>
  );
};

export default BookingForm;
