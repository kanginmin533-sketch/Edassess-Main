import axiosInstance from './axiosInstance';

export const settingsApi = {
  getSettings: async () => {
    const response = await axiosInstance.get('/admin/settings');
    return response.data;
  },

  saveSettings: async (settings) => {
    const response = await axiosInstance.put('/admin/settings', settings);
    return response.data;
  },
};

export default settingsApi;