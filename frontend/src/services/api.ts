import axios, { AxiosError } from 'axios';
import { API_BASE_URL } from '../utils/constants';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Check if the error is due to authentication failure
    if (error.response?.status === 401) {
      // Check if we're already on login page to avoid infinite redirect
      if (window.location.pathname !== '/login') {
        // Clear authentication data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Show expiration message
        const errorMessage = error.response?.data as { message?: string };
        if (errorMessage?.message?.includes('token') || errorMessage?.message?.includes('Invalid authentication')) {
          // Import toast dynamically to avoid circular dependency
          import('react-hot-toast').then(({ default: toast }) => {
            toast.error('Your session has expired. Please login again.');
          });
        }
        
        // Redirect to login page after a short delay
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
