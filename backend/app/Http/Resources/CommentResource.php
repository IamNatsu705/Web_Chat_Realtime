<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Resource Bình luận (Comment Resource).
 *
 * Biến đổi model PostComment thành JSON cho API response.
 * Hỗ trợ cấu trúc lồng: replies (bình luận con) cũng dùng CommentResource.
 */
class CommentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'post_id' => $this->post_id,
            'user_id' => $this->user_id,
            'parent_id' => $this->parent_id,
            'content' => $this->content,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'user' => new UserResource($this->whenLoaded('user')),
            'replies_count' => $this->whenCounted('replies', $this->replies_count ?? 0),
            'replies' => CommentResource::collection($this->whenLoaded('replies')),
        ];
    }
}
