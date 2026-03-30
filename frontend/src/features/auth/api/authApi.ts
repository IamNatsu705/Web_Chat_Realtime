import { realAuthApi } from './realAuthApi';
import { mockAuthApi } from './mockAuthApi';

const useMockApi = import.meta.env.VITE_USE_MOCK_API === 'true';

if (useMockApi) {
    console.log("Chú ý: Ứng dụng đang chạy với MOCK API (Dữ liệu giả).");
}

export const authApi = useMockApi ? mockAuthApi : realAuthApi;
