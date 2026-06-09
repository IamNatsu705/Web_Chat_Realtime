<?php

namespace App\Http\Requests\Chat;

use Illuminate\Foundation\Http\FormRequest;

class UpdateGroupRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'        => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'join_type'   => ['nullable', 'string', 'in:invite,open,request'],
            'category'    => ['nullable', 'string', 'in:subject,department,project,research,club,other'],
            'avatar'      => ['nullable', 'image', 'max:5120'],
        ];
    }
}
