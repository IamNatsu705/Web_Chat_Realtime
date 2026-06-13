<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Resource Media bài đăng (PostMedia Resource).
 *
 * Biến đổi model PostMedia thành JSON cho API response.
 * Bao gồm: URL media, loại (image/video), và thứ tự sắp xếp.
 */
class PostMediaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'media_url' => $this->media_url,
            'media_type' => $this->media_type,
            'sort_order' => $this->sort_order,
        ];
    }
}
