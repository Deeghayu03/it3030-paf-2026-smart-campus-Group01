import React from 'react';
import './BookingTimeline.css';
import { formatRole } from '../../utils/helpers';

const formatTime = (time) => {
  if (!time || time === "") return "";
  try {
    return new Date(time).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short"
    });
  } catch (e) {
    return "";
  }
};

const BookingTimeline = ({ timelineData }) => {
  console.log("TIMELINE DATA:", timelineData);

  if (!timelineData) return null;

  return (
    <div className="timeline">
      <h4 style={{ marginBottom: '15px' }}>Booking Lifecycle</h4>

      {/* CREATED */}
      <div className="timeline-item">
        <div className="dot blue"></div>
        <div>
          <strong>Booking Created</strong>
          <p>{formatTime(timelineData.createdAt)}</p>
        </div>
      </div>

      {/* APPROVED */}
      {timelineData.approvedAt && (
        <div className="timeline-item">
          <div className="dot green"></div>
          <div>
            <strong>Approved</strong>
            <p>{formatTime(timelineData.approvedAt)}</p>
          </div>
        </div>
      )}

      {/* REJECTED */}
      {timelineData.rejectedAt && (
        <div className="timeline-item">
          <div className="dot red"></div>
          <div>
            <strong>Rejected</strong>
            <p>{formatTime(timelineData.rejectedAt)}</p>
          </div>
        </div>
      )}

      {/* CANCELLED */}
      {timelineData.cancelledAt && (
        <div className="timeline-item">
          <div className="dot gray"></div>
          <div>
            <strong>Cancelled</strong>
            <p>{formatTime(timelineData.cancelledAt)}</p>

            {timelineData.cancelledBy && (
              <p className="cancelled-by">
                Cancelled by: <strong>{formatRole(timelineData.cancelledBy)}</strong>
              </p>
            )}

            {timelineData.cancellationReason && (
              <p className="reason">
                <b>Reason:</b> {timelineData.cancellationReason}
              </p>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default BookingTimeline;
