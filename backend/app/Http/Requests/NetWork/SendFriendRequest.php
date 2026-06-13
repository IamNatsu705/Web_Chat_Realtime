<?php

namespace App\Http\Requests\Network;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Request Gửi lời mời kết bạn (Send Friend Request).
 *
 * Xác thực: receiver_id phải tồn tại và không được trùng với chính mình.
 */
class SendFriendRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'receiver_id' => [
                'required',
                'integer',
                'exists:users,id',
                'different:' . $this->user()->id,
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'receiver_id.exists' => 'Người dùng không tồn tại.',
            'receiver_id.different' => 'Bạn không thể gửi lời mời kết bạn cho chính mình.',
        ];
    }
}
