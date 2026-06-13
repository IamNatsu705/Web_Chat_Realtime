<?php

namespace App\Http\Requests\Profile;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Request Đổi mật khẩu (Update Password Request).
 *
 * Xác thực dữ liệu đổi mật khẩu:
 * - old_password: Mật khẩu cũ (bắt buộc).
 * - new_password: Mật khẩu mới (tối thiểu 8 ký tự, phải xác nhận).
 */
class UpdatePasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'old_password'              => ['required', 'string'],
            'new_password'              => ['required', 'string', 'min:8', 'confirmed'],
            'new_password_confirmation' => ['required', 'string'],
        ];
    }
}
