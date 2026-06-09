<?php

namespace App\Http\Requests\Chat;

use Illuminate\Foundation\Http\FormRequest;

class SendMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'content' => ['required_without_all:image,file', 'nullable', 'string'],
            'image'   => ['required_without_all:content,file', 'nullable', 'image', 'max:10240'], // 10MB
            'file'    => ['required_without_all:content,image', 'nullable', 'file', 'max:30720'], // 30MB
            'type'    => ['nullable', 'string', 'in:text,image,file'],
            'file_title' => ['nullable', 'string', 'max:255'],
            'file_category' => ['nullable', 'string', 'in:exam,lecture,exercise,note,other'],
            'file_description' => ['nullable', 'string', 'max:1000'],
        ];
    }
}

