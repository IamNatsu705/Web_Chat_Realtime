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

import { getSocketId } from './echo';

// Request Interceptor (Can thiệp trước khi gửi request): Attach Token automatically
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const socketId = getSocketId();
    if (socketId && config.headers) {
      config.headers['X-Socket-ID'] = socketId;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ── Anti-spam logout: chỉ fire event 1 lần duy nhất ──────────────────────
let isLoggingOut = false;

/**
 * Đặt cờ khi đang trong quá trình logout để interceptor không fire lại.
 * AuthProvider sẽ gọi hàm này trước khi gọi API logout.
 */
export function setLoggingOut(value: boolean) {
  isLoggingOut = value;
}

// Response Interceptor: Handle Global 401 Unauthorized
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Nếu đang trong quá trình logout, KHÔNG fire event lại (tránh vòng lặp vô hạn)
      // Cũng bỏ qua nếu request là tới endpoint logout
      const requestUrl = error.config?.url || '';
      const isLogoutRequest = requestUrl.includes('/auth/logout');

      if (!isLoggingOut && !isLogoutRequest) {
        // Xóa token và thông báo cho AuthProvider xử lý logout
        localStorage.removeItem('token');
        // Chỉ dispatch 1 lần: dùng cờ isLoggingOut để chặn các 401 đồng thời
        isLoggingOut = true;
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
