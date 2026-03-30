// Module A (resource API calls) - Team Member 1
import axiosInstance from '../api/axiosConfig';

export const resourceService = {
  getAllResources: () => {
    return axiosInstance.get('/resources');
  },
  getResourceById: (id) => {
    return axiosInstance.get(`/resources/${id}`);
  },
  searchResources: (filters) => {
    return axiosInstance.get('/resources/search', { params: filters });
  }
};

export default resourceService;
