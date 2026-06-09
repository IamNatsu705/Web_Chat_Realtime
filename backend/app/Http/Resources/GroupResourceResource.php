<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Resource biến đổi GroupResource model thành JSON.
 * Tự động format file_size thành dạng đọc được (VD: "2.3 MB").
 */
class GroupResourceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'conversation_id'=> $this->conversation_id,
            'title'          => $this->title,
            'description'    => $this->description,
            'file_url'       => $this->file_url,
            'file_type'      => $this->file_type,
            'file_size'      => $this->file_size,
            'file_size_human'=> $this->formatFileSize($this->file_size),
            'category'       => $this->category,
            'download_count' => $this->download_count,
            'is_pinned'      => $this->is_pinned,
            'created_at'     => $this->created_at,
            'updated_at'     => $this->updated_at,
            'uploader'       => new UserResource($this->whenLoaded('uploader')),
        ];
    }

    /**
     * Format kích thước file thành dạng đọc được.
     */
    private function formatFileSize(int $bytes): string
    {
        if ($bytes >= 1073741824) {
            return number_format($bytes / 1073741824, 1) . ' GB';
        }
        if ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 1) . ' MB';
        }
        if ($bytes >= 1024) {
            return number_format($bytes / 1024, 1) . ' KB';
        }
        return $bytes . ' B';
    }
}
