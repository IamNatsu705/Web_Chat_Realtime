import axios from 'axios';

// Create an Axios instance with base URL pointing to Laravel backend
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',       // Thông báo cho server biết dạng dữ liệu gửi là Json
    'Accept': 'application/json',             // Mong muốn server trả về dữ liệu dạng là Json
  },
  withCredentials: true, // Important for Sanctum CSRF cookies if used later, or just general cookies
});

// Request Interceptor (Can thiệp trước khi gửi request): Attach Token automatically
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Global 401 Unauthorized
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and optionally redirect to login
      localStorage.removeItem('token');
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
