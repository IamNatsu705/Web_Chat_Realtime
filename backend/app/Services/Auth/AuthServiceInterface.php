<?php

namespace App\Services\Auth;

/**
 * Interface Service Xác thực (Auth Service Interface).
 *
 * Định nghĩa các phương thức xác thực người dùng: đăng ký và đăng nhập.
 */
interface AuthServiceInterface
{
    /**
     * Đăng ký tài khoản mới và tạo token xác thực.
     *
     * @param array $data Dữ liệu đăng ký (name, email, password, student_id, department).
     * @return array Mảng chứa ['user' => User, 'token' => string].
     */
    public function register(array $data): array;

    /**
     * Đăng nhập bằng email và mật khẩu, trả về token mới.
     *
     * @param array $credentials Thông tin đăng nhập (email, password).
     * @return array Mảng chứa ['user' => User, 'token' => string].
     * @throws \Illuminate\Validation\ValidationException Nếu thông tin không đúng hoặc tài khoản bị khóa.
     */
    public function login(array $credentials): array;
}
