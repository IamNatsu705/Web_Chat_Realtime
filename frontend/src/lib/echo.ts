/* eslint-disable @typescript-eslint/ban-ts-comment */
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// @ts-expect-error
window.Pusher = Pusher;

type ReverbEcho = Echo<'reverb'>;

/** Instance Echo duy nhất trong toàn bộ ứng dụng (Singleton Pattern) */
let echoInstance: ReverbEcho | null = null;

/**
 * Tạo một instance Echo mới sử dụng token xác thực hiện tại.
 *
 * Được gọi sau khi đăng nhập/đăng ký để kết nối WebSocket
 * xác thực đúng với Bearer token của người dùng.
 */
function createEchoInstance(): ReverbEcho {
    const token = localStorage.getItem('token');

    return new Echo({
        broadcaster: 'reverb',
        key: import.meta.env.VITE_REVERB_APP_KEY || 'reverbkey',
        wsHost: import.meta.env.VITE_REVERB_HOST || window.location.hostname,
        wsPort: import.meta.env.VITE_REVERB_PORT || 8080,
        wssPort: import.meta.env.VITE_REVERB_PORT || 8080,
        forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'http') === 'https',
        enabledTransports: ['ws', 'wss'],
        authEndpoint: (import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1').replace('/api/v1', '') + '/broadcasting/auth',
        auth: {
            headers: {
                Authorization: token ? `Bearer ${token}` : '',
                Accept: 'application/json'
            }
        }
    });
}

/**
 * Lấy instance Echo hiện tại (tạo mới nếu chưa có — Lazy Initialization).
 */
export function getEcho(): ReverbEcho {
    if (!echoInstance) {
        echoInstance = createEchoInstance();
    }
    return echoInstance;
}

/**
 * Hủy instance cũ và tạo instance mới với token mới nhất.
 * Gọi sau khi đăng nhập / đăng ký để xác thực private channel hoạt động đúng.
 */
export function reinitializeEcho(): ReverbEcho {
    if (echoInstance) {
        try {
            echoInstance.disconnect();
        } catch {
            // Bỏ qua lỗi ngắt kết nối
        }
    }
    echoInstance = createEchoInstance();
    return echoInstance;
}

/**
 * Ngắt kết nối và hủy instance Echo.
 * Gọi khi đăng xuất để giải phóng tài nguyên WebSocket.
 */
export function destroyEcho(): void {
    if (echoInstance) {
        try {
            echoInstance.disconnect();
        } catch {
            // Bỏ qua lỗi
        }
        echoInstance = null;
    }
}

/**
 * Proxy tương thích ngược: `import { echo } from './echo'`
 * Ủy quyền (delegate) tất cả truy cập thuộc tính đến instance tạo lười (lazy-created).
 */
export const echo = new Proxy({} as ReverbEcho, {
    get(_target, prop) {
        return Reflect.get(getEcho(), prop);
    },
});

/**
 * Lấy Socket ID hiện tại một cách an toàn mà không ép khởi tạo Echo.
 * Dùng để gửi kèm header X-Socket-ID trong HTTP request (tránh nhận lại event của chính mình).
 */
export function getSocketId(): string | undefined {
    return echoInstance?.socketId();
}
