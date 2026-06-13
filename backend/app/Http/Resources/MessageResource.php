<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Resource Tin nhắn (Message Resource).
 *
 * Biến đổi model Message thành JSON cho API response.
 * Tính toán thêm trường 'status' dựa trên read_at để FE luôn có giá trị sử dụng được.
 */
class MessageResource extends JsonResource
{
    /**
     * Biến đổi tin nhắn thành mảng dữ liệu.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'conversation_id' => $this->conversation_id,
            'sender_id' => $this->sender_id,
            'content' => $this->content,
            'type' => $this->type,
            'read_at' => $this->read_at,
            'is_recalled' => $this->is_recalled,
            'deleted_by' => $this->deleted_by,
            // Trạng thái tính toán: 'read' nếu đã đọc, 'sent' nếu chưa
            'status' => $this->read_at ? 'read' : 'sent',
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'sender' => new UserResource($this->whenLoaded('sender')),
        ];
    }
}
