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
  // -- Detail & History Methods --
  getTicketById: async (id) => {
    const response = await axiosInstance.get(`/tickets/${id}`);
    return response.data;
  },
  getTicketHistory: async (id) => {
    const response = await axiosInstance.get(`/tickets/${id}/history`);
    return response.data;
  },
  
  // -- Comment Management --
  addComment: async (ticketId, commentData) => {
    const response = await axiosInstance.post(`/tickets/${ticketId}/comments`, commentData);
    return response.data;
  },
  updateComment: async (ticketId, commentId, commentData) => {
    const response = await axiosInstance.put(`/tickets/${ticketId}/comments/${commentId}`, commentData);
    return response.data;
  },
  deleteComment: async (ticketId, commentId) => {
    await axiosInstance.delete(`/tickets/${ticketId}/comments/${commentId}`);
  },

  getAllTickets: () => {
    return axiosInstance.get('/tickets');
  },

  // -- Analytics --
  getStats: async () => {
    const response = await axiosInstance.get('/tickets/stats');
    return response.data;
  },
};

export default ticketService;
