// Module C (ticket API calls) - Team Member 3
import axiosInstance from '../api/axiosConfig';

export const ticketService = {
  createTicket: (data) => {
    return axiosInstance.post('/tickets', data);
  },
  getMyTickets: () => {
    return axiosInstance.get('/tickets/my');
  },
  getTicketDetail: (id) => {
    return axiosInstance.get(`/tickets/${id}`);
  },
  updateStatus: (id, data) => {
    return axiosInstance.put(`/tickets/${id}/status`, data);
  },
  uploadAttachments: (ticketId, formData) => {
    return axiosInstance.post(`/tickets/${ticketId}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  deleteAttachment: (attachId) => {
    return axiosInstance.delete(`/tickets/attachments/${attachId}`);
  },
  addComment: (ticketId, content) => {
    return axiosInstance.post(`/tickets/${ticketId}/comments`, { content });
  },
  deleteComment: (commentId) => {
    return axiosInstance.delete(`/comments/${commentId}`);
  },
  getAllTickets: () => {
    return axiosInstance.get('/tickets');
  }
};

export default ticketService;
