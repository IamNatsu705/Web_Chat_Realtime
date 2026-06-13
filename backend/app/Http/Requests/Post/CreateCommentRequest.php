<?php

namespace App\Http\Requests\Post;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Request Tạo bình luận (Create Comment Request).
 *
 * Xác thực dữ liệu bình luận:
 * - content: Nội dung bình luận (bắt buộc, tối đa 2000 ký tự).
 * - parent_id: ID bình luận cha (tùy chọn, để trả lời bình luận).
 */
class CreateCommentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'content' => 'required|string|max:2000',
            'parent_id' => 'nullable|integer|exists:post_comments,id',
        ];
    }
}
