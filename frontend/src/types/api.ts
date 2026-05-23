/**
 * Shared API response wrapper.
 * Tất cả API endpoints trả về cùng cấu trúc này.
 * Các feature KHÔNG cần định nghĩa riêng (ChatResponse, NetworkResponse, ProfileResponse...).
 */
export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}
