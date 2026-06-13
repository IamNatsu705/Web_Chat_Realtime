<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Request Tìm kiếm người dùng (Search User Request).
 *
 * Xác thực từ khóa tìm kiếm: bắt buộc, 1-255 ký tự.
 */
class SearchUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'keyword' => ['required', 'string', 'min:1', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'keyword.required' => 'Vui lòng nhập từ khóa để tìm kiếm.',
        ];
    }
}
