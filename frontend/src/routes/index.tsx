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

// Protected Route wrapper for authenticated pages
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

// Admin Route wrapper - requires admin role
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

// Auth Route wrapper to prevent logged-in users from seeing login/register
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

// Global Event Listener Component to handle 401 Unauthorized globally
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

export default function AppRoutes() {
  return (
    <AuthProvider>
      <BrowserRouter>
          <GlobalAuthListener />
          <WebSocketProvider>
            <Routes>
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

              {/* Admin Routes - Separate layout */}
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
