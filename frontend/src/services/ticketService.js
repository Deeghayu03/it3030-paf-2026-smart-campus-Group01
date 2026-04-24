import api from '../api/axiosConfig';

const ticketService = {
  createTicket: (data) => api.post('/tickets', data),
  
  getMyTickets: () => api.get('/tickets/my'),
  
  getAllTickets: () => api.get('/tickets'),
  
  getTicketDetail: (id) => api.get(`/tickets/${id}`),
  
  updateStatus: (id, data) => api.put(`/tickets/${id}/status`, data),
  
  addComment: (ticketId, content) => 
    api.post(`/tickets/${ticketId}/comments`, { content }),
  
  uploadAttachments: (ticketId, formData) => 
    api.post(`/tickets/${ticketId}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  deleteAttachment: (attachId) => 
    api.delete(`/tickets/attachments/${attachId}`)
};

export default ticketService;
