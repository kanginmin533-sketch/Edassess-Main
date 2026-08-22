import axiosInstance from './axiosInstance';

export const examApi = {
  getInstructorDashboard: async () => {
    const response = await axiosInstance.get('/instructor/dashboard');
    return response.data;
  },

  // Instructor's own exams
  getExams: async () => {
    const response = await axiosInstance.get('/instructor/exams');
    return response.data;
  },

  createExam: async (examData) => {
    const response = await axiosInstance.post('/instructor/exams', examData);
    return response.data;
  },

  updateExam: async (examId, examData) => {
    const response = await axiosInstance.put(`/instructor/exams/${examId}`, examData);
    return response.data;
  },

  deleteExam: async (examId) => {
    const response = await axiosInstance.delete(`/instructor/exams/${examId}`);
    return response.data;
  },

  // Question pool for the picker
  getQuestions: async () => {
    const response = await axiosInstance.get('/instructor/questions');
    return response.data;
  },

  // Student exam attempts
  createAttempt: async (attemptData) => {
    const response = await axiosInstance.post('/exams/history', attemptData);
    return response.data;
  },

  getAttemptHistory: async () => {
    const response = await axiosInstance.get('/exams/history');
    return response.data;
  },

  // Public — para sa student side, kukunin yung mga active exams
  getPublicExams: async () => {
    const response = await axiosInstance.get('/exams');
    return response.data;
  },

  getExamById: async (examId) => {
    const response = await axiosInstance.get(`/exams/${examId}`);
    return response.data;
  },

  getAttemptById: async (attemptId) => {
    const response = await axiosInstance.get(`/exams/history/${attemptId}`);
    return response.data;
  },
};

export default examApi;