import axiosInstance from '../api/axiosConfig';

export const getResources = async (filters = {}) => {
  const params = {};

  if (filters.type) params.type = filters.type;
  if (filters.location) params.location = filters.location;
  if (filters.minCapacity) params.minCapacity = filters.minCapacity;

  const response = await axiosInstance.get('/resources', { params });
  return response.data;
};

export const getResourceById = async (id) => {
  const response = await axiosInstance.get(`/resources/${id}`);
  return response.data;
};

export const createResource = async (resourceData) => {
  const response = await axiosInstance.post('/resources', resourceData);
  return response.data;
};

export const updateResource = async (id, resourceData) => {
  const response = await axiosInstance.put(`/resources/${id}`, resourceData);
  return response.data;
};

export const deleteResource = async (id) => {
  const response = await axiosInstance.delete(`/resources/${id}`);
  return response.data;
};