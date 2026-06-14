import AppRoutes from './routes';
import { Toaster } from 'react-hot-toast';
import { ConfirmProvider } from './hooks/useConfirm';

/**
 * Component gốc của ứng dụng (App Root).
 *
 * Kết hợp:
 * - ConfirmProvider: Cung cấp hộp thoại xác nhận toàn cục (thay thế window.confirm).
 * - AppRoutes: Hệ thống điều hướng (routing) + Providers (Auth, WebSocket).
 * - Toaster: Hiển thị thông báo toast (react-hot-toast) ở góc trên bên phải.
 */
function App() {
  return (
    <ConfirmProvider>
      <AppRoutes />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            borderRadius: '12px',
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: 500,
          },
          success: {
            iconTheme: { primary: '#4f46e5', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#fff' },
          },
        }}
      />
    </ConfirmProvider>
  );
}

export default App;
