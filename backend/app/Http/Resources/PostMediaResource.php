<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

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
