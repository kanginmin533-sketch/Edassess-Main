// 📁 frontend/src/api/questionApi.js
import axiosInstance from './axiosInstance';

export const questionApi = {
  getQuestions: async () => {
    const response = await axiosInstance.get('/instructor/questions');
    return response.data;
  },
  createQuestion: async (data) => {
    const response = await axiosInstance.post('/instructor/questions', data);
    return response.data;
  },
  updateQuestion: async (id, data) => {
    const response = await axiosInstance.put(`/instructor/questions/${id}`, data);
    return response.data;
  },
  deleteQuestion: async (id) => {
    const response = await axiosInstance.delete(`/instructor/questions/${id}`);
    return response.data;
  },
  bulkCreateQuestions: async (questions) => {
    const response = await axiosInstance.post('/instructor/questions/bulk', { questions });
    return response.data.created;
  },
  // category: 'All' | 'GenEd' | 'ProfEd' | 'Major'. axiosInstance.delete needs
  // the body wrapped in a `data` key — DELETE requests don't take a body as
  // the second positional argument the way POST/PUT do.
  bulkDeleteQuestions: async (category) => {
    const response = await axiosInstance.delete('/instructor/questions/bulk-delete', {
      data: { category },
    });
    return response.data;
  },
};

export default questionApi;