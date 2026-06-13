<?php

namespace App\Http\Requests\Network;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Request Phản hồi lời mời kết bạn (Respond Friend Request).
 *
 * Xác thực hành động phản hồi: chỉ chấp nhận 'accept' hoặc 'reject'.
 */
class RespondFriendRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'action' => ['required', 'string', 'in:accept,reject'],
        ];
    }
}
