<?php

namespace App\Http\Requests\Chat;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Request Thêm thành viên nhóm (Add Group Member Request).
 *
 * Xác thực dữ liệu thêm thành viên: user_id phải tồn tại trong hệ thống.
 */
class AddGroupMemberRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => ['required', 'integer', 'exists:users,id'],
        ];
    }
}
