import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Profile APIs
export const profileAPI = {
  getProfile: () => api.get('/profile'),
  updateProfile: (data: any) => api.put('/profile', data),
  getDashboardStats: () => api.get('/profile/dashboard'),
};

// Resume APIs
export const resumeAPI = {
  upload: (formData: FormData) =>
    api.post('/resume/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getAll: () => api.get('/resume'),
  getOne: (id: string) => api.get(`/resume/${id}`),
  delete: (id: string) => api.delete(`/resume/${id}`),
  analyze: (id: string) => api.post(`/resume/${id}/analyze`),
  compare: (resumeId1: string, resumeId2: string) =>
    api.post('/resume/compare', { resumeId1, resumeId2 }),
};

// Job Match APIs
export const jobMatchAPI = {
  match: (data: { jobDescription: string; jobTitle?: string; company?: string; resumeId?: string }) =>
    api.post('/jobmatch', data),
  getAll: () => api.get('/jobmatch'),
  getOne: (id: string) => api.get(`/jobmatch/${id}`),
  delete: (id: string) => api.delete(`/jobmatch/${id}`),
};

// Interview APIs
export const interviewAPI = {
  start: (data: { type: string; domain: string; difficulty?: string; totalQuestions?: number }) =>
    api.post('/interview/start', data),
  submitAnswer: (id: string, answer: string) =>
    api.post(`/interview/${id}/answer`, { answer }),
  getAll: () => api.get('/interview'),
  getOne: (id: string) => api.get(`/interview/${id}`),
  delete: (id: string) => api.delete(`/interview/${id}`),
};

// Skill Gap APIs
export const skillGapAPI = {
  analyze: (data: { jobDescription: string; jobTitle?: string; resumeId?: string }) =>
    api.post('/skillgap', data),
  getAll: () => api.get('/skillgap'),
  getOne: (id: string) => api.get(`/skillgap/${id}`),
  delete: (id: string) => api.delete(`/skillgap/${id}`),
};

// Learning APIs
export const learningAPI = {
  generate: (data: { goal: string; currentLevel?: string; durationDays?: number }) =>
    api.post('/learning', data),
  getAll: () => api.get('/learning'),
  getOne: (id: string) => api.get(`/learning/${id}`),
  updateTask: (id: string, data: { dayNumber: number; taskId: string; isCompleted: boolean }) =>
    api.put(`/learning/${id}/task`, data),
  delete: (id: string) => api.delete(`/learning/${id}`),
};
// Job Tracker APIs
export const jobTrackerAPI = {
  create: (data: any) => api.post('/jobs', data),
  getAll: () => api.get('/jobs'),
  updateStatus: (id: string, status: string) => api.put(`/jobs/${id}/status`, { status }),
  update: (id: string, data: any) => api.put(`/jobs/${id}`, data),
  delete: (id: string) => api.delete(`/jobs/${id}`),
};

// Analytics API
export const analyticsAPI = {
  get: () => api.get('/analytics'),
};

// Portfolio API
export const portfolioAPI = {
  analyze: (githubUsername: string) => api.post('/portfolio', { githubUsername }),
  getAll: () => api.get('/portfolio'),
  getOne: (id: string) => api.get(`/portfolio/${id}`),
  delete: (id: string) => api.delete(`/portfolio/${id}`),
};

// Cover Letter API
export const coverLetterAPI = {
  generate: (data: { resumeId: string; jobDescription: string; companyName: string; jobTitle: string }) =>
    api.post('/coverletter', data),
  getAll: () => api.get('/coverletter'),
  getOne: (id: string) => api.get(`/coverletter/${id}`),
  update: (id: string, content: string) => api.put(`/coverletter/${id}`, { content }),
  delete: (id: string) => api.delete(`/coverletter/${id}`),
};

// Notifications API
export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  markAsRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  delete: (id: string) => api.delete(`/notifications/${id}`),
};

// Admin API
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/admin/users'),
};

export default api;
