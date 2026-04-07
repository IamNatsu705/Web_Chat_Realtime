<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FriendshipResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $authUserId = $request->user()->id;

        $friendData = ($this->user_id === $authUserId)
            ? $this->friend
            : $this->user;

        return [
            'id' => $this->id,
            'created_at' => $this->created_at,
            'friend' => new UserResource($friendData),
        ];
    }
}
