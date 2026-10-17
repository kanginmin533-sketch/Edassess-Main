// frontend/src/api/activityApi.js
import axiosInstance from './axiosInstance';

export const activityApi = {
  // params: { department, category, actor_role, q, date_from, date_to, page, page_size }
  getLogs: async (params = {}) => {
    const response = await axiosInstance.get('/admin/activity-log/', { params });
    return response.data;
  },
};

export default activityApi;