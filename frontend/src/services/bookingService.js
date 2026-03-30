// Module B (booking API calls) - Team Member 2
import axiosInstance from '../api/axiosConfig';

export const bookingService = {
  createBooking: (data) => {
    return axiosInstance.post('/bookings', data);
  },
  getMyBookings: () => {
    return axiosInstance.get('/bookings/my');
  },
  cancelBooking: (id) => {
    return axiosInstance.put(`/bookings/${id}/cancel`);
  }
};

export default bookingService;
