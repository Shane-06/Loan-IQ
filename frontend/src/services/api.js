import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hdfc_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors (like 401 token expiry)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear storage and redirect if token is expired/invalid
      localStorage.removeItem('hdfc_token');
      localStorage.removeItem('hdfc_user');
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register') && window.location.pathname !== '/') {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  register: async (email, password, full_name) => {
    const response = await api.post('/auth/register', { email, password, full_name });
    return response.data;
  },
};

export const predictionAPI = {
  predict: async (data) => {
    const response = await api.post('/predict', data);
    return response.data;
  },
};

export const applicationsAPI = {
  getMyHistory: async () => {
    const response = await api.get('/applications');
    return response.data;
  },
  getAllHistory: async () => {
    const response = await api.get('/applications/all');
    return response.data;
  },
  getDetails: async (id) => {
    const response = await api.get(`/applications/${id}`);
    return response.data;
  },
};

export const analyticsAPI = {
  getAnalytics: async () => {
    const response = await api.get('/analytics');
    return response.data;
  },
};

export const modelMetricsAPI = {
  getMetrics: async () => {
    const response = await api.get('/model-metrics');
    return response.data;
  },
  getHealth: async () => {
    const response = await api.get('/model-metrics/health');
    return response.data;
  },
  getFeatureImportance: async () => {
    const response = await api.get('/model-metrics/feature-importance');
    return response.data;
  },
};

export default api;
