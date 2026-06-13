<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Request Khóa tài khoản (Ban User Request).
 *
 * Xác thực dữ liệu khi admin khóa tài khoản: yêu cầu lý do (10-500 ký tự).
 */
class BanUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'reason' => ['required', 'string', 'min:10', 'max:500'],
        ];
    }
}
