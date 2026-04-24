import api from '../api/axiosConfig';

// USER
export const getMyBookings = () => {
  return api.get('/bookings/my').catch(err => {
    console.error("GET_MY_BOOKINGS_ERROR:", err.response?.data || err.message);
    throw err;
  });
};

// ADMIN
export const getAllBookings = () => {
  return api.get('/bookings').catch(err => {
    console.error("GET_ALL_BOOKINGS_ERROR:", err.response?.data || err.message);
    throw err;
  });
};

export const createBooking = (data) => {
  return api.post('/bookings', data).catch(err => {
    console.error("CREATE_BOOKING_ERROR:", err.response?.data || err.message);
    throw err;
  });
};

export const updateBooking = (id, data) => {
  return api.put(`/bookings/${id}`, data).catch(err => {
    console.error("UPDATE_BOOKING_ERROR:", err.response?.data || err.message);
    throw err;
  });
};

export const cancelBooking = (id, reason) => {
  return api.put(`/bookings/${id}/cancel`, reason ? { reason } : {}).catch(err => {
    console.error("CANCEL_BOOKING_ERROR:", err.response?.data || err.message);
    throw err;
  });
};

export const approveBooking = (id) => {
  return api.put(`/bookings/${id}/approve`).catch(err => {
    console.error("APPROVE_BOOKING_ERROR:", err.response?.data || err.message);
    throw err;
  });
};

export const rejectBooking = (id, reason) => {
  return api.put(`/bookings/${id}/reject`, { reason }).catch(err => {
    console.error("REJECT_BOOKING_ERROR:", err.response?.data || err.message);
    throw err;
  });
};

export const getBookingTimeline = (id) => {
  return api.get(`/bookings/${id}/timeline`).catch(err => {
    console.error("GET_TIMELINE_ERROR:", err.response?.data || err.message);
    throw err;
  });
};



// Also keep default export for compatibility if needed, but the user requested named exports fix
const bookingService = {
  getMyBookings,
  getAllBookings,
  createBooking,
  updateBooking,
  cancelBooking,
  approveBooking,
  rejectBooking,
  getBookingTimeline
};

export default bookingService;
