import axios from '../api/axiosConfig';

// USER
export const getMyBookings = () => {
  const token = localStorage.getItem('token');
  return axios.get('/bookings/my', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

// ADMIN
export const getAllBookings = () => {
  return axios.get('/bookings/all');
};

export const createBooking = (data) => {
  const token = localStorage.getItem('token');
  return axios.post('/bookings', data, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const updateBooking = (id, data) => {
  return axios.put(`/bookings/${id}`, data);
};

export const cancelBooking = (id, reason) => {
  return axios.put(`/bookings/${id}/cancel`, reason ? { reason } : {});
};

export const approveBooking = (id) => {
  return axios.put(`/bookings/${id}/approve`);
};

export const rejectBooking = (id, reason) => {
  return axios.put(`/bookings/${id}/reject`, { reason });
};

export const deleteBooking = (id) => {
  return axios.delete(`/bookings/${id}`);
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
