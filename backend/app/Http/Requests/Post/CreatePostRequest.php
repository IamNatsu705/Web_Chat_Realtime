<?php

namespace App\Http\Requests\Post;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Request Tạo bài đăng (Create Post Request).
 *
 * Xác thực dữ liệu bài đăng:
 * - content: Nội dung bài viết (bắt buộc, tối đa 5000 ký tự).
 * - media: Ảnh/video đính kèm (tùy chọn, tối đa 10 file, mỗi file tối đa 20MB).
 */
class CreatePostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'content' => 'required|string|max:5000',
            'media' => 'nullable|array|max:10',
            'media.*' => 'file|mimes:jpg,jpeg,png,gif,mp4,mov,avi|max:20480', // tối đa 20MB mỗi file
        ];
    }
}
