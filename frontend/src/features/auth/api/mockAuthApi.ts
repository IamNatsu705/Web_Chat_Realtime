import type { AuthResponse, LoginCredentials, RegisterCredentials } from '../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockAuthApi = {
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        await delay(100);
        if (!(credentials.email === "admin@gmail.com" && credentials.password === "123456")) {
            throw new Error("Sai tài khoản hoặc mật khẩu");
        }
        return {
            status: "success",
            message: "Đăng nhập thành công",
            data: {
                user: {
                    id: 1,
                    name: "Thái dím",
                    email: credentials.email,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
                token: "fake-jwt-token-12345"
            }
        };
    },

    register: async (data: RegisterCredentials): Promise<AuthResponse> => {
        await delay(100);
        console.log("Im here");
        return {
            status: "success",
            message: "Đăng kí thành công",
            data: {
                user: {
                    id: 1,
                    name: data.name,
                    email: data.email,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
                token: "fake-jwt-token-123456",
            }
        }
    },

    getCurrentUser: async (): Promise<AuthResponse> => {
        await delay(100);
        return {
            status: "success",
            message: "Đăng kí thành công",
            data: {
                user: {
                    id: 1,
                    name: "mockData",
                    email: "mockEmail",
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
                token: "",
            }
        }
    },

    logout: async (): Promise<void> => {
        console.log("Đã gọi đến api logout")
    },
}
