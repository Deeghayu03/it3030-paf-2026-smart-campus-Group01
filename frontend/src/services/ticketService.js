// Module C (ticket API calls) - Team Member 3
import axiosInstance from '../api/axiosConfig';

export const ticketService = {
  createTicket: (data) => {
    return axiosInstance.post('/tickets', data);
  },
  getMyTickets: () => {
    return axiosInstance.get('/tickets/my');
  },
  addComment: (ticketId, comment) => {
    return axiosInstance.post(`/tickets/${ticketId}/comments`, { comment });
  }
};

export default ticketService;
