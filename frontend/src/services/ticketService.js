import api from '../api/axiosConfig';

export const ticketService = {
  createTicket: (data) => {
    return api.post('/tickets', data);
  },
  getMyTickets: () => {
    return api.get('/tickets/my');
  },
  addComment: (ticketId, comment) => {
    return api.post(`/tickets/${ticketId}/comments`, { comment });
  }
};

export default ticketService;
