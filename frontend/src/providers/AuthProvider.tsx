/* eslint-disable no-useless-catch */
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { User, LoginCredentials, RegisterCredentials } from '../features/auth/types';
import { authApi } from '../features/auth/api/authApi';
import { reinitializeEcho, destroyEcho } from '../lib/echo';
import { setLoggingOut } from '../lib/axios';
import { resetPresence } from '../features/chat/hooks/usePresence';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<User>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


/**
 * `AuthProvider` — Thành phần bao bọc (Context Provider) quản lý toàn bộ trạng thái xác thực người dùng.
 *
 * **Chức năng chính:**
 * - Cung cấp trạng thái đăng nhập (`user`, `isAuthenticated`).
 * - Xử lý quá trình tự động đăng nhập khi có Token lưu trong LocalStorage.
 * - Cung cấp các hàm Login, Register, Logout để thay đổi trạng thái toàn cục.
 * - Quản lý việc khởi tạo hoặc hủy kết nối WebSocket/Laravel Echo dựa theo phiên đăng nhập.
 */
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');



      if (token) {
        try {
          const res = await authApi.getCurrentUser();
          setUser(res.data.user);
          setIsAuthenticated(true);
          // Khởi tạo lại kết nối WebSocket (Laravel Echo) bằng token hiện tại từ LocalStorage.
          // Bước này thiết yếu để Echo có thể xác thực (authenticate) khi subscribe vào các private/presence channels.
          reinitializeEcho();
        } catch (error) {
          console.error("Failed to load user session", error);
          localStorage.removeItem('token');
        }
      }
      setIsLoading(false);
    };

    loadUser();
  }, []);

  /**
   * Đăng nhập người dùng bằng thông tin cung cấp.
   * Cập nhật LocalStorage, khởi tạo lại Echo WebSocket để kết nối private channels.
   * @param credentials Thông tin đăng nhập (Email, Mật khẩu).
   */
  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      const res = await authApi.login(credentials);
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        setIsAuthenticated(true);
        // Sau khi đăng nhập thành công, hủy bỏ instance Echo cũ (nếu có) và khởi tạo instance mới
        // với token vừa nhận được. Đảm bảo luồng realtime kết nối đúng với session của user mới.
        reinitializeEcho();
      }
      return res.data.user;
    } catch (error) {
      throw error;
    }
  }, []);

  /**
   * Đăng ký tài khoản mới và tự động đăng nhập nếu thành công.
   * @param credentials Thông tin đăng ký.
   */
  const register = useCallback(async (credentials: RegisterCredentials) => {
    try {
      const res = await authApi.register(credentials);
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        setIsAuthenticated(true);
        // Sau khi đăng ký và tự động đăng nhập, khởi tạo lại Echo instance
        // với token mới để đảm bảo có quyền truy cập vào các WebSockets channel.
        reinitializeEcho();
      }
    } catch (error) {
      throw error;
    }
  }, []);

  /**
   * Xử lý quy trình Đăng xuất an toàn:
   * 1. Đặt cờ ngắt vòng lặp API Unauthorized (`setLoggingOut`).
   * 2. Xóa Token khỏi LocalStorage.
   * 3. Ngắt kết nối WebSockets (`destroyEcho`).
   * 4. Reset trạng thái Online/Offline (`resetPresence`).
   * 5. Xóa sạch bộ đệm TanStack Query để tránh rò rỉ dữ liệu tài khoản cũ.
   */
  const logout = useCallback(async () => {
    // ĐẶT CỜ TRƯỚC: Báo cho axios interceptor KHÔNG fire `auth:unauthorized` nữa
    // Điều này ngăn vòng lặp: logout() → API 401 → event → logout() → ∞
    setLoggingOut(true);
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout failed on server, cleaning client state anyway.", error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);

      destroyEcho();
      resetPresence();
      queryClient.clear();

      setLoggingOut(false);
    }
  }, [queryClient]);

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
  }, []);

  // Đóng gói (Memoize) giá trị của Context bằng useMemo để đảm bảo tham chiếu (reference) không thay đổi
  // giữa các lần render của AuthProvider nếu các dependency không đổi. Điều này giúp ngăn chặn
  // việc re-render hàng loạt (unnecessary re-renders) ở tất cả các component con đang tiêu thụ (consume) AuthContext.
  const contextValue = useMemo(() => ({
    user, isAuthenticated, isLoading, login, register, logout, updateUser
  }), [user, isAuthenticated, isLoading, login, register, logout, updateUser]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
