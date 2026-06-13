import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import QueryProvider from './providers/QueryProvider.tsx'

/**
 * Điểm khởi chạy ứng dụng React (Entry Point).
 *
 * Cấu trúc Provider (từ ngoài vào trong):
 * 1. StrictMode: Phát hiện lỗi tiềm ẩn trong development.
 * 2. QueryProvider: Cung cấp TanStack Query Client cho toàn bộ ứng dụng.
 * 3. App: Component gốc chứa routing và UI.
 */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryProvider>
      <App />
    </QueryProvider>
  </StrictMode>,
)
