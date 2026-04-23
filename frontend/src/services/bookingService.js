import axios from '../api/axiosConfig';

// USER
export const getMyBookings = () => {
  return axios.get('/bookings/my').catch(err => {
    console.error("GET_MY_BOOKINGS_ERROR:", err.response?.data || err.message);
    throw err;
  });
};

// ADMIN
export const getAllBookings = () => {
  return axios.get('/bookings').catch(err => {
    console.error("GET_ALL_BOOKINGS_ERROR:", err.response?.data || err.message);
    throw err;
  });
};

export const createBooking = (data) => {
  return axios.post('/bookings', data).catch(err => {
    console.error("CREATE_BOOKING_ERROR:", err.response?.data || err.message);
    throw err;
  });
};

export const updateBooking = (id, data) => {
  return axios.put(`/bookings/${id}`, data).catch(err => {
    console.error("UPDATE_BOOKING_ERROR:", err.response?.data || err.message);
    throw err;
  });
};

export const cancelBooking = (id, reason) => {
  return axios.put(`/bookings/${id}/cancel`, reason ? { reason } : {}).catch(err => {
    console.error("CANCEL_BOOKING_ERROR:", err.response?.data || err.message);
    throw err;
  });
};

export const approveBooking = (id) => {
  return axios.put(`/bookings/${id}/approve`).catch(err => {
    console.error("APPROVE_BOOKING_ERROR:", err.response?.data || err.message);
    throw err;
  });
};

export const rejectBooking = (id, reason) => {
  return axios.put(`/bookings/${id}/reject`, { reason }).catch(err => {
    console.error("REJECT_BOOKING_ERROR:", err.response?.data || err.message);
    throw err;
  });
};

export const deleteBooking = (id) => {
  return axios.delete(`/bookings/${id}`).catch(err => {
    console.error("DELETE_BOOKING_ERROR:", err.response?.data || err.message);
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
  deleteBooking
};

export default bookingService;
