// 📁 adminApi.js
import axiosInstance from './axiosInstance';

export const adminApi = {
  // 1. Kuhanin ang lahat ng users (Read All)
  getUsers: async () => {
    const response = await axiosInstance.get('/admin/users/');
    return response.data;
  },

  // 2. Kuhanin ang detalye ng iisang user gamit ang ID (Read Single)
  getUserById: async (userId) => {
    const response = await axiosInstance.get(`/admin/users/${userId}/`);
    return response.data;
  },

  // 3. Gumawa ng bagong user (Create)
  createUser: async (userData) => {
    const response = await axiosInstance.post('/admin/users/create/', userData);
    return response.data;
  },

  // 4. I-update ang detalye ng user (Update)
  updateUser: async (userId, userData) => {
    const response = await axiosInstance.put(`/admin/users/${userId}/update/`, userData);
    return response.data;
  },

  // 5. I-delete ang user (Delete)
  deleteUser: async (userId) => {
    const response = await axiosInstance.delete(`/admin/users/${userId}/delete/`);
    return response.data;
  },

  // 6. Dashboard — stats + recent users + activity sa iisang call
  getDashboard: async () => {
    const response = await axiosInstance.get('/admin/dashboard/');
    return response.data;
  },

  // NOTE: tinawag ito sa UserPage.jsx (handleToggleStatus) pero wala pang
  // backend endpoint para dito. Kailangan mo pang gawin ang view + url para
  // gumana ito — sabihin mo lang kung gusto mo na rin itong ayusin ngayon.
  toggleUserStatus: async (userId, newStatus) => {
    const response = await axiosInstance.patch(`/admin/users/${userId}/status/`, { status: newStatus });
    return response.data;
  },

  // Exam Configuration (global settings)
  getExamConfig: async () => {
    const response = await axiosInstance.get('/exam-config');
    return response.data;
  },

  saveExamConfig: async (config) => {
    const response = await axiosInstance.put('/exam-config', config);
    return response.data;
  },
};

export default adminApi;