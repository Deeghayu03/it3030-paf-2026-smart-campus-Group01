import React, { useState, useEffect, useContext } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout/DashboardLayout';
import BookingCard from '../../components/ui/BookingCard';
import BookingForm from '../../components/ui/BookingForm';
import ConflictResolution from '../../components/ui/ConflictResolution';
import AdminBookingItem from '../../components/ui/AdminBookingItem';
import Button from '../../components/ui/Button/Button';
import { getMyBookings, getAllBookings, createBooking, updateBooking, cancelBooking, approveBooking, rejectBooking, deleteBooking } from '../../services/bookingService';
import { AuthContext } from '../../context/AuthContext';
import { formatTime } from '../../utils/formatTime';
import './BookingsPage.css';

const BookingsPage = () => {
  const { role, user } = useContext(AuthContext);

  // Helper function to convert 12h format (AM/PM) to 24h format (HH:mm:ss)
  const convertTo24Hour = (time12h) => {
    if (!time12h) return "";

    // Check if time is already in 24h format (contains no AM/PM)
    if (!time12h.includes('AM') && !time12h.includes('PM')) {
      return time12h.includes(':') && time12h.split(':').length === 2 ? `${time12h}:00` : time12h;
    }

    const [time, modifier] = time12h.split(" ");
    if (!modifier) return time.includes(':') && time.split(':').length === 2 ? `${time}:00` : time; // Fallback if no space

    let [hours, minutes] = time.split(":");

    if (modifier === "PM" && hours !== "12") {
      hours = String(parseInt(hours, 10) + 12);
    }

    if (modifier === "AM" && hours === "12") {
      hours = "00";
    }

    return `${hours.padStart(2, "0")}:${minutes}:00`;
  };

  // Helper function to format date to ISO format (YYYY-MM-DD)
  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
  };

  const [bookings, setBookings] = useState([]);
  const [adminBookings, setAdminBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState(role === 'ADMIN' ? 'admin' : 'user'); // Default to admin panel for admins
  const [conflictSuggestions, setConflictSuggestions] = useState(null);
  const [message, setMessage] = useState(null);
  const [formDataToEdit, setFormDataToEdit] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('date_desc');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteBookingId, setDeleteBookingId] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelBookingId, setCancelBookingId] = useState(null);

  useEffect(() => {
    if (role === 'ADMIN' && viewMode === 'admin') {
      fetchAdminBookings();
    } else {
      fetchBookings();
    }
  }, [role, viewMode]);

  // Set default view mode when role is loaded
  useEffect(() => {
    if (role === 'ADMIN') {
      setViewMode('admin');
    }
  }, [role]);

  const fetchBookings = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const response = await getMyBookings();
      console.log("My Bookings:", response.data);
      setBookings(response.data);
    } catch (err) {
      console.error(err.response?.data || err.message);
      setMessage({ type: 'error', text: 'Failed to load bookings' });
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const fetchAdminBookings = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const response = await getAllBookings();
      setAdminBookings(response.data);
      console.log("ADMIN BOOKINGS DATA:", response.data);
    } catch (err) {
      console.error(err.response?.data || err.message);
      setMessage({ type: 'error', text: 'Failed to load bookings' });
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleCreateOrUpdateBooking = async (formData) => {
    setFormLoading(true);
    setMessage(null);
    setConflictSuggestions(null);
    
    try {
      const payload = {
        resourceId: formData.resourceId,
        bookingDate: formatDate(formData.bookingDate),
        startTime: convertTo24Hour(formData.startTime),
        endTime: convertTo24Hour(formData.endTime),
        purpose: formData.purpose,
        expectedAttendees: formData.expectedAttendees
      };

      if (isEditing && formDataToEdit?.id) {
        await updateBooking(formDataToEdit.id, payload);
        setMessage({ type: 'success', text: 'Booking updated successfully!' });
      } else {
        // Automatically approve admin bookings
        if (role === 'ADMIN') {
          payload.status = 'APPROVED';
          payload.role = 'admin';
          payload.createdBy = user?.id; // Set creator ID
        } else {
          payload.role = 'student';
        }

        await createBooking(payload);
        setMessage({ 
          type: 'success', 
          text: role === 'ADMIN' ? 'Booking created and auto-approved!' : 'Booking request submitted successfully!' 
        });
      }
      
      setShowForm(false);
      setIsEditing(false);
      setFormDataToEdit(null);
      fetchBookings();
    } catch (err) {
      if (err.response && err.response.status === 409) {
        setConflictSuggestions(err.response.data.suggestions || []);
        setMessage({ type: 'error', text: 'Time slot already booked' });
      } else {
        setMessage({ type: 'error', text: err.response?.data?.message || 'Error processing request' });
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (booking) => {
    setFormDataToEdit(booking);
    setIsEditing(true);
    setShowForm(true);
    setConflictSuggestions(null);
    setMessage(null);
  };

  const handleCancel = async (id) => {
    const isActuallyAdmin = role === 'ADMIN' && viewMode === 'admin';
    let reason = null;

    if (isActuallyAdmin) {
      reason = window.prompt('Enter cancellation reason (REQUIRED for admin):');
      if (reason === null) return; // User cancelled prompt
      if (!reason.trim()) {
        alert('Reason is required for admin cancellation');
        return;
      }
    }
    
    try {
      await cancelBooking(id, reason);
      setMessage({ type: 'success', text: 'Booking cancelled successfully' });
      if (isActuallyAdmin) fetchAdminBookings(); else fetchBookings();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to cancel booking' });
    }
  };

  const initiateCancel = (id) => {
    const isActuallyAdmin = role === 'ADMIN' && viewMode === 'admin';
    if (isActuallyAdmin) {
      handleCancel(id);
    } else {
      setCancelBookingId(id);
      setShowCancelModal(true);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteBooking(id);
      setMessage({ type: 'success', text: 'Booking deleted permanently' });
      
      // Immediately remove from UI without refresh
      setBookings(prev => prev.filter(b => b.id !== id));
      setAdminBookings(prev => prev.filter(b => b.id !== id));
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to delete booking' });
    }
  };

  const initiateDelete = (id) => {
    setDeleteBookingId(id);
    setShowDeleteModal(true);
  };

  const handleApprove = async (id) => {
    try {
      await approveBooking(id);
      setMessage({ type: 'success', text: 'Booking approved successfully' });
      fetchAdminBookings();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to approve booking' });
    }
  };

  const handleReject = (booking) => {
    setSelectedBooking(booking);
    setSelectedBookingId(booking.id);
    setShowRejectModal(true);
    setRejectReason("");
  };

  const submitReject = async () => {
    if (!rejectReason.trim()) return;
    
    try {
      await rejectBooking(selectedBookingId, rejectReason);
      setMessage({ type: 'success', text: 'Booking rejected successfully' });
      setShowRejectModal(false);
      setRejectReason("");
      fetchAdminBookings();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to reject booking' });
    }
  };

  const handleBookAgain = (booking) => {
    setFormDataToEdit({
      resourceId: booking.resourceId,
      purpose: booking.purpose,
      bookingDate: booking.bookingDate,
      expectedAttendees: booking.expectedAttendees
    });
    setShowForm(true);
    setConflictSuggestions(null);
    setMessage(null);
  };

  const handleSelectSuggestion = (slot) => {
    setFormDataToEdit(prev => ({
      ...prev,
      startTime: slot.startTime,
      endTime: slot.endTime
    }));
    setConflictSuggestions(null);
    setMessage(null);
  };

  return (
    <DashboardLayout title="Bookings">
        <div className="bookings-page-container">
        <div className="bookings-header">
          <div className="header-left">
            <div className="header-title-section">
              <h1>{showForm ? (isEditing ? 'Edit Booking' : 'Create New Booking') : (viewMode === 'admin' ? 'Booking Management' : 'Your Reservations')}</h1>
              {!showForm && (
                <p className="header-subtitle">
                  {viewMode === 'admin' ? 'Review and manage all booking requests' : 'View and manage your upcoming bookings'}
                </p>
              )}
            </div>
            {role === 'ADMIN' && !showForm && (
              <div className="view-toggle">
                <button 
                  className={viewMode === 'admin' ? 'active' : ''} 
                  onClick={() => setViewMode('admin')}
                >
                  Admin Panel
                </button>
                <button 
                  className={viewMode === 'user' ? 'active' : ''} 
                  onClick={() => setViewMode('user')}
                >
                  My Bookings
                </button>
              </div>
            )}
            {viewMode === 'admin' && !showForm && (
              <div className="admin-filters-container">
                <div className="filter-group">
                  <span className="filter-label">
                    Status:
                  </span>
                  <select 
                    className="filter-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>

                <div className="filter-group">
                  <span className="filter-label">
                    Sort:
                  </span>
                  <select 
                    className="filter-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="date_desc">Newest First</option>
                    <option value="date_asc">Oldest First</option>
                  </select>
                </div>

                <span className="booking-count-badge">
                  {adminBookings.filter(b => statusFilter === 'ALL' || b.status === statusFilter).length} bookings
                </span>
              </div>
            )}
          </div>

          {!showForm && viewMode === 'user' && (
            <div className="header-right">
              <Button 
                label="+ New Booking" 
                onClick={() => {
                  setShowForm(true);
                  setIsEditing(false);
                  setFormDataToEdit(null);
                  setConflictSuggestions(null);
                  setMessage(null);
                }} 
              />
            </div>
          )}
        </div>

        {message && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}

        {showForm ? (
          <div className="booking-form-section">
            <button className="btn-back" onClick={() => setShowForm(false)}>
              ← Back to My Bookings
            </button>
            <BookingForm 
              onSubmit={handleCreateOrUpdateBooking} 
              loading={formLoading} 
              initialData={formDataToEdit}
              conflictSuggestions={conflictSuggestions}
              onSelectSuggestion={handleSelectSuggestion}
            />
          </div>
        ) : (
          <div className="bookings-list-section bookings-list-container">
            {loading ? (
              <div className="loading-state">Loading booking data...</div>
            ) : viewMode === 'admin' ? (
              <div className="bookings-grid">
                {adminBookings
                  .filter(b => statusFilter === 'ALL' || b.status === statusFilter)
                  .filter(b => b.role === 'student' || b.userRole === 'STUDENT' || (b.userRole !== 'ADMIN' && b.role !== 'admin')) // Show only student requests here
                  .sort((a, b) => {
                    const dateA = new Date(a.bookingDate + 'T' + a.startTime);
                    const dateB = new Date(b.bookingDate + 'T' + b.startTime);
                    return sortBy === 'date_desc' ? dateB - dateA : dateA - dateB;
                  })
                  .length > 0 ? (
                  adminBookings
                    .filter(b => statusFilter === 'ALL' || b.status === statusFilter)
                    .filter(b => b.role === 'student' || b.userRole === 'STUDENT' || (b.userRole !== 'ADMIN' && b.role !== 'admin')) // Safety check: only students
                    .sort((a, b) => {
                      const dateA = new Date(a.bookingDate + 'T' + a.startTime);
                      const dateB = new Date(b.bookingDate + 'T' + b.startTime);
                      return sortBy === 'date_desc' ? dateB - dateA : dateA - dateB;
                    })
                    .map(booking => (
                      <AdminBookingItem 
                        key={booking.id} 
                        booking={booking} 
                        onApprove={handleApprove}
                        onReject={handleReject}
                        onCancel={initiateCancel}
                      />
                    ))
                ) : (
                  <div className="no-bookings">No matching booking requests found.</div>
                )}
              </div>
            ) : (
              bookings
                .filter(b => statusFilter === 'ALL' || b.status === statusFilter)
                .filter(b => role !== 'ADMIN' || (
                  (b.userId && String(b.userId) === String(user?.id)) || 
                  (b.createdBy && String(b.createdBy) === String(user?.id)) ||
                  (b.userEmail === user?.email)
                )) // Personal tab: show bookings owned/created by the admin
                .length > 0 ? (
                <div className="bookings-grid">
                  {bookings
                    .filter(b => statusFilter === 'ALL' || b.status === statusFilter)
                    .filter(b => role !== 'ADMIN' || (
                      (b.userId && String(b.userId) === String(user?.id)) || 
                      (b.createdBy && String(b.createdBy) === String(user?.id)) ||
                      (b.userEmail === user?.email)
                    ))
                    .sort((a, b) => new Date(b.bookingDate + 'T' + b.startTime) - new Date(a.bookingDate + 'T' + a.startTime))
                    .map(booking => (
                      <BookingCard 
                        key={booking.id} 
                        booking={booking} 
                        currentUser={user}
                        onDelete={initiateDelete}
                        onEdit={handleEdit}
                        onBookAgain={handleBookAgain}
                        onApprove={handleApprove}
                        onReject={handleReject}
                      />
                    ))}
                </div>
              ) : (
                <div className="no-bookings">
                  <p>You haven't made any bookings yet.</p>
                  <Button 
                    label="Make your first booking" 
                    variant="secondary" 
                    onClick={() => setShowForm(true)} 
                  />
                </div>
              )
            )}
          </div>
        )}
      </div>
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 animate-scaleIn">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 tracking-tight">
                Reject Booking
              </h2>
              <button
                onClick={() => setShowRejectModal(false)}
                className="text-gray-400 hover:text-gray-700 text-lg"
              >
                ×
              </button>
            </div>

            {/* Booking Info Card */}
            <div className="bg-gray-100 rounded-xl p-4 mb-5 border border-gray-200">
              <p className="text-sm font-semibold text-gray-900">
                {selectedBooking?.resourceName}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {selectedBooking?.bookingDate} • {selectedBooking ? `${formatTime(selectedBooking.startTime)} - ${formatTime(selectedBooking.endTime)}` : ''}
              </p>
            </div>

            {/* Input */}
            <label className="text-sm font-semibold text-gray-800 mb-1 block">
              Reason for rejection
            </label>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Explain why this booking is being rejected..."
              rows={3}
              autoFocus
              className="w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none"
            />

            {/* Quick Select Chips */}
            <div className="flex gap-2 mt-3 flex-wrap">
              {["Time conflict", "Resource unavailable", "Invalid request"].map((reason) => (
                <button
                  key={reason}
                  onClick={() => setRejectReason(reason)}
                  className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-full hover:bg-green-100 hover:text-green-700 transition"
                >
                  {reason}
                </button>
              ))}
            </div>

            {/* Helper Text */}
            {!rejectReason.trim() && (
              <p className="text-xs text-gray-500 mt-2">
                A reason is required to reject this booking
              </p>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
              >
                Cancel
              </button>

              <button
                disabled={!rejectReason.trim()}
                onClick={submitReject}
                className={`px-4 py-2 rounded-lg font-medium text-white transition ${
                  rejectReason.trim()
                    ? "bg-red-500 hover:bg-red-600 shadow-sm"
                    : "bg-red-300 cursor-not-allowed"
                }`}
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-[400px] p-6 animate-scaleIn">
            <h2 className="text-lg font-semibold text-gray-900">
              Delete Booking
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              Are you sure you want to permanently delete this booking? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDelete(deleteBookingId);
                  setShowDeleteModal(false);
                }}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 shadow-sm transition"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showCancelModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-[400px] p-6 animate-scaleIn">
            <h2 className="text-lg font-semibold text-gray-900">
              Cancel Booking
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              Are you sure you want to cancel this booking? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
              >
                Keep Booking
              </button>
              <button
                onClick={() => {
                  handleCancel(cancelBookingId);
                  setShowCancelModal(false);
                }}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 shadow-sm transition"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default BookingsPage;