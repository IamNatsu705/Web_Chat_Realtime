import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../providers/AuthProvider';
import { WebSocketProvider } from '../providers/WebSocketProvider';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import HomePage from '../pages/home/HomePage';
import ChatPage from '../pages/messages/ChatPage';
import NetworkPage from '../pages/network/NetworkPage';
import ConnectionsPage from '../pages/network/ConnectionsPage';
import ProfilePage from '../pages/profile/ProfilePage';
import AdminLayout from '../layouts/AdminLayout';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminPosts from '../pages/admin/AdminPosts';

import CommunitiesPage from '../pages/communities/CommunitiesPage';

/**
 * Route bảo vệ — chỉ cho phép truy cập khi đã đăng nhập.
 * Tự động chuyển hướng admin sang /admin, user chưa đăng nhập sang /login.
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-indigo-600 font-bold">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}

/**
 * Route quản trị viên — yêu cầu role admin.
 * User thường bị chuyển hướng về trang chủ.
 */
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-indigo-600 font-bold">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

/**
 * Route xác thực — ngăn user đã đăng nhập truy cập trang login/register.
 * Tự động chuyển hướng admin sang /admin, user thường sang trang chủ.
 */
function AuthRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-indigo-600 font-bold">Loading...</div>;
  }

  if (isAuthenticated) {
    if (user?.role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

/**
 * Component lắng nghe sự kiện 401 Unauthorized toàn cục.
 *
 * Khi axios interceptor phát hiện 401, dispatch event `auth:unauthorized`.
 * Component này bắt event đó, thực hiện đăng xuất và chuyển về trang login.
 * Dùng cờ `hasLoggedOut` để tránh gọi logout nhiều lần cùng lúc.
 */
function GlobalAuthListener() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Cờ ngăn logout chạy nhiều lần khi có nhiều 401 đồng thời
    let hasLoggedOut = false;

    const handleUnauthorized = () => {
      if (hasLoggedOut) return; // Chỉ chạy 1 lần duy nhất
      hasLoggedOut = true;
      logout();
      navigate('/login');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [logout, navigate]);

  return null;
}

/**
 * Component gốc định nghĩa toàn bộ cấu trúc routing của ứng dụng.
 *
 * Cấu trúc Provider:
 * AuthProvider → BrowserRouter → GlobalAuthListener + WebSocketProvider → Routes
 *
 * Các nhóm route:
 * - /login, /register: Trang xác thực (AuthRoute).
 * - /, /messages, /communities, /network, /profile: Trang chính (ProtectedRoute).
 * - /admin/*: Trang quản trị (AdminRoute + AdminLayout).
 */
export default function AppRoutes() {
  return (
    <AuthProvider>
      <BrowserRouter>
          <GlobalAuthListener />
          <WebSocketProvider>
            <Routes>
              {/* ── Trang xác thực ── */}
              <Route
                path="/login"
                element={
                  <AuthRoute>
                    <LoginPage />
                  </AuthRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <AuthRoute>
                    <RegisterPage />
                  </AuthRoute>
                }
              />

              {/* ── Trang chính (yêu cầu đăng nhập) ── */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <HomePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/messages"
                element={
                  <ProtectedRoute>
                    <ChatPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/communities"
                element={
                  <ProtectedRoute>
                    <CommunitiesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/network"
                element={
                  <ProtectedRoute>
                    <NetworkPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/network/connections"
                element={
                  <ProtectedRoute>
                    <ConnectionsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile/:userId"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* ── Trang quản trị (yêu cầu role admin) ── */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminLayout />
                  </AdminRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="posts" element={<AdminPosts />} />
              </Route>
            </Routes>
          </WebSocketProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}
