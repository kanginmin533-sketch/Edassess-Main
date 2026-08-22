import axiosInstance from './axiosInstance';

export const reportApi = {
  getReports: async () => {
    const response = await axiosInstance.get('/admin/reports');
    return response.data;
  },
  getStudentMonitor: async () => {
    const response = await axiosInstance.get('/instructor/student-monitor');
    return response.data;
  },
};
export default reportApi;