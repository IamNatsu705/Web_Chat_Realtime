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
            'content' => ['required_without:image', 'nullable', 'string'],
            'image'   => ['required_without:content', 'nullable', 'image', 'max:5120'], // 5MB max
            'type'    => ['nullable', 'string', 'in:text,image'],
        ];
    }
}

