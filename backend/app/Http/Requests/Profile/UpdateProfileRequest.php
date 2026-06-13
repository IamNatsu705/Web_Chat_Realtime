<?php

namespace App\Http\Requests\Profile;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Request Cập nhật hồ sơ (Update Profile Request).
 *
 * Xác thực dữ liệu cập nhật hồ sơ cá nhân:
 * - name: Họ tên (bắt buộc).
 * - avatar: Ảnh đại diện (tối đa 2MB, định dạng jpg/jpeg/png/webp).
 * - bio: Tiểu sử (tối đa 300 ký tự).
 * - student_id: Mã số sinh viên (tối đa 20 ký tự).
 * - department: Khoa/Ngành (tối đa 100 ký tự).
 */
class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'       => ['required', 'string', 'max:255'],
            'avatar'     => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'bio'        => ['nullable', 'string', 'max:300'],
            'student_id' => ['nullable', 'string', 'max:20'],
            'department' => ['nullable', 'string', 'max:100'],
        ];
    }
}
