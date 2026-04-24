import api from '../api/axiosConfig';

export const getResources = (filters = {}) => {
  const params = {};

  if (filters.type) params.type = filters.type;
  if (filters.location) params.location = filters.location;
  if (filters.minCapacity) params.minCapacity = filters.minCapacity;

  return api.get('/resources', { params });
};

export const getResourceById = (id) => {
  return api.get(`/resources/${id}`);
};

export const createResource = (resourceData) => {
  return api.post('/resources', resourceData);
};

export const updateResource = (id, resourceData) => {
  return api.put(`/resources/${id}`, resourceData);
};

export const deleteResource = (id) => {
  return api.delete(`/resources/${id}`);
};

const resourceService = {
  getResources,
  getAllResources: getResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource
};

export default resourceService;