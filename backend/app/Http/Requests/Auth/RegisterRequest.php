<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Request Đăng ký (Register Request).
 *
 * Xác thực dữ liệu đăng ký tài khoản:
 * - name: Họ tên (tối đa 255 ký tự).
 * - email: Email duy nhất trong hệ thống.
 * - password: Mật khẩu (tối thiểu 8 ký tự, phải xác nhận).
 * - student_id, department: Thông tin sinh viên (tùy chọn).
 */
class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'       => ['required', 'string', 'max:255'],
            'email'      => ['required', 'email', 'unique:users,email'],
            'password'   => ['required', 'string', 'min:8', 'confirmed'],
            'student_id' => ['nullable', 'string', 'max:20'],
            'department' => ['nullable', 'string', 'max:100'],
        ];
    }
}
