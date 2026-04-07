<?php

namespace App\Http\Requests\Network;

use Illuminate\Foundation\Http\FormRequest;

class GetIncomingRequests extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'page' => ['nullable', 'integer', 'min:1'],
        ];
    }

    public function messages(): array
    {
        return [
            'per_page.integer' => 'Số lượng bản ghi mỗi trang phải là số nguyên.',
            'per_page.max' => 'Bạn không thể lấy quá 100 bản ghi mỗi lần.',
        ];
    }
}
