<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $isAuthUser = $request->user() && $request->user()->id === $this->id;

        return [
            'id' => $this->id,
            'name' => $this->name,
            'avatar' => $this->avatar,

            'relationship_status' => $this->relationship_status ?? 'none',
            'friend_request_id' => $this->friend_request_id,
            'is_sender' => (bool) $this->is_sender,
            // Private
            'email' => $this->when($isAuthUser, $this->email),
            'created_at' => $this->when($isAuthUser, $this->created_at),
            'updated_at' => $this->when($isAuthUser, $this->updated_at),
        ];
    }
}
