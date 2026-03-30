import { networkApi as realNetworkApi } from './networkApi';
import { mockNetworkApi } from './mockNetworkApi';

const useMockApi = import.meta.env.VITE_USE_MOCK_API === 'true';

if (useMockApi) {
    console.log("Network Feature: Đang chạy với MOCK API (Dữ liệu giả).");
}

export const networkApi = useMockApi ? mockNetworkApi : realNetworkApi;
