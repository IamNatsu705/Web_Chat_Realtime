import { useState, useEffect } from 'react';

/**
 * Hook trì hoãn giá trị (Debounce).
 *
 * Chỉ cập nhật giá trị sau khi người dùng ngừng thay đổi trong khoảng `delay` ms.
 * Thường dùng cho: tìm kiếm real-time, tránh spam API request.
 *
 * @param value Giá trị cần trì hoãn.
 * @param delay Thời gian trì hoãn (milliseconds).
 * @returns Giá trị đã được trì hoãn.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Đặt timer cập nhật giá trị sau khoảng delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Xóa timer nếu giá trị thay đổi (hoặc component unmount)
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
