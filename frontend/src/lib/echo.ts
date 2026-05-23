/* eslint-disable @typescript-eslint/ban-ts-comment */
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// @ts-expect-error
window.Pusher = Pusher;

type ReverbEcho = Echo<'reverb'>;

let echoInstance: ReverbEcho | null = null;

/**
 * Create a fresh Echo instance using the current auth token.
 * Called after login/register so the WebSocket connection
 * authenticates with the correct Bearer token.
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
 * Get the current Echo instance (lazy-created on first access).
 */
export function getEcho(): ReverbEcho {
    if (!echoInstance) {
        echoInstance = createEchoInstance();
    }
    return echoInstance;
}

/**
 * Tear down the old instance and create a new one with the latest token.
 * Call this after login / register so private-channel auth works.
 */
export function reinitializeEcho(): ReverbEcho {
    if (echoInstance) {
        try {
            echoInstance.disconnect();
        } catch {
            // ignore disconnect errors
        }
    }
    echoInstance = createEchoInstance();
    return echoInstance;
}

/**
 * Disconnect and destroy the Echo instance.
 * Call this on logout.
 */
export function destroyEcho(): void {
    if (echoInstance) {
        try {
            echoInstance.disconnect();
        } catch {
            // ignore
        }
        echoInstance = null;
    }
}

// Backward-compat proxy: `import { echo } from './echo'`
// Delegates all property access to the lazily-created instance.
export const echo = new Proxy({} as ReverbEcho, {
    get(_target, prop) {
        return Reflect.get(getEcho(), prop);
    },
});

/**
 * Safely get the current socket ID without forcing Echo initialization.
 */
export function getSocketId(): string | undefined {
    return echoInstance?.socketId();
}

