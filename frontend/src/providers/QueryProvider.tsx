import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useState } from 'react';

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Cấu hình vòng đời của Cache (Tuning Cache Lifecycle)
            staleTime: 60 * 1000, // Thời gian dữ liệu được coi là "tươi" (fresh). Trong 1 phút này, các hook (useQuery) sẽ trả về dữ liệu từ cache mà không gọi API background refetch.
            gcTime: 10 * 60 * 1000, // Garbage Collection Time: Thời gian giữ dữ liệu trong bộ nhớ sau khi toàn bộ component sử dụng query đó đã unmount (10 phút).

            // Cấu hình chiến lược Re-fetch (Refetching Strategies)
            refetchOnWindowFocus: false, // Tắt tính năng tự động gọi lại API khi user focus lại vào tab trình duyệt để tiết kiệm băng thông và tránh spam request.
            retry: 1, // Số lần tự động gọi lại API nếu request thất bại do lỗi mạng trước khi throw error ra ErrorBoundary.
            refetchOnMount: true, // Ép buộc gọi lại API ở lần mount đầu tiên của component nếu dữ liệu đã bị đánh dấu là stale.
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}

    </QueryClientProvider>
  );
}
