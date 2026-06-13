<?php

namespace App\Http\Requests\Chat;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Request Tạo nhóm (Create Group Request).
 *
 * Xác thực dữ liệu tạo nhóm chat:
 * - name: Tên nhóm (bắt buộc).
 * - description: Mô tả (tùy chọn, tối đa 1000 ký tự).
 * - join_type: Kiểu tham gia (invite/open/request).
 * - category: Danh mục nhóm.
 * - member_ids: Danh sách thành viên ban đầu.
 * - avatar: Ảnh đại diện nhóm (tối đa 5MB).
 */
class CreateGroupRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'         => ['required', 'string', 'max:255'],
            'description'  => ['nullable', 'string', 'max:1000'],
            'join_type'    => ['nullable', 'string', 'in:invite,open,request'],
            'category'     => ['nullable', 'string', 'in:subject,department,project,research,club,other'],
            'member_ids'   => ['nullable', 'array'],
            'member_ids.*' => ['integer', 'exists:users,id'],
            'avatar'       => ['nullable', 'image', 'max:5120'], // tối đa 5MB
        ];
    }
}
