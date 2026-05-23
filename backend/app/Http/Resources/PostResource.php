<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PostResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'content' => $this->content,
            'media_url' => $this->media_url,
            'likes_count' => $this->likes_count,
            'comments_count' => $this->comments_count,
            'is_pinned' => $this->is_pinned,
            'status' => $this->status,
            'hide_reason' => $this->hide_reason,
            'hidden_by_admin' => $this->whenLoaded('hiddenByAdmin', fn () => $this->hiddenByAdmin?->name),
            'is_liked' => (bool) ($this->is_liked ?? false),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'user' => new UserResource($this->whenLoaded('user')),
            'media' => PostMediaResource::collection($this->whenLoaded('media')),
        ];
    }
}
