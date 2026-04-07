<?php

namespace App\Http\Requests\Network;

use Illuminate\Foundation\Http\FormRequest;

class RespondFriendRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'action' => ['required', 'string', 'in:accept,reject'],
        ];
    }
}
