import axios from 'axios';

/**
 * Tạo instance Axios với base URL trỏ đến Laravel backend.
 * Tất cả API request trong ứng dụng đều đi qua instance này.
 */
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',       // Thông báo cho server biết dạng dữ liệu gửi là JSON
    'Accept': 'application/json',             // Mong muốn server trả về dữ liệu dạng JSON
  },
  withCredentials: true, // Gửi kèm cookie cho xác thực CSRF (Sanctum) nếu cần
});

import { getSocketId } from './echo';

/**
 * Request Interceptor — Can thiệp TRƯỚC khi gửi request.
 *
 * - Tự động đính kèm Bearer Token từ LocalStorage vào header Authorization.
 * - Tự động đính kèm X-Socket-ID để server loại bỏ event gửi lại cho chính người gửi.
 */
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

// ── Chống spam logout: chỉ fire event 1 lần duy nhất ──────────────────────
let isLoggingOut = false;

/**
 * Đặt cờ khi đang trong quá trình logout để interceptor không fire lại.
 * AuthProvider sẽ gọi hàm này trước khi gọi API logout.
 */
export function setLoggingOut(value: boolean) {
  isLoggingOut = value;
}

/**
 * Response Interceptor — Xử lý lỗi 401 Unauthorized toàn cục.
 *
 * Khi nhận 401 (token hết hạn hoặc không hợp lệ):
 * - Xóa token khỏi LocalStorage.
 * - Dispatch event `auth:unauthorized` để AuthProvider xử lý đăng xuất.
 * - Dùng cờ `isLoggingOut` để tránh vòng lặp vô hạn: logout → 401 → logout → ∞
 */
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Bỏ qua nếu đang logout hoặc request là tới endpoint logout
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
