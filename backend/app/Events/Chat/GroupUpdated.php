<?php

namespace App\Events\Chat;

use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * GroupUpdated — Broadcast khi có thay đổi trong nhóm chat.
 *
 * Gửi đến kênh riêng `user.{id}` của TẤT CẢ thành viên trong nhóm
 * (bao gồm cả người bị kick) để FE cập nhật UI ngay lập tức.
 *
 * @property string $type             Loại sự kiện: member_added, member_removed,
 *                                    member_left, group_renamed, group_avatar_changed,
 *                                    group_dissolved
 * @property int    $conversationId   ID cuộc hội thoại nhóm
 * @property array  $actor            Người thực hiện hành động (UserResource resolved)
 * @property array|null $target       Người bị ảnh hưởng (thêm/xóa) (UserResource resolved)
 * @property string|null $newName     Tên mới (cho group_renamed)
 */
class GroupUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public string $type;
    public int $conversationId;
    public array $actor;
    public ?array $target;
    public ?string $newName;

    /** @var int[] Danh sách user_id cần nhận event này */
    private array $recipientIds;

    public function __construct(
        string $type,
        int $conversationId,
        User $actor,
        array $recipientIds,
        ?User $targetUser = null,
        ?string $newName = null,
    ) {
        $this->type = $type;
        $this->conversationId = $conversationId;
        $this->actor = (new UserResource($actor))->resolve();
        $this->recipientIds = $recipientIds;
        $this->target = $targetUser ? (new UserResource($targetUser))->resolve() : null;
        $this->newName = $newName;
    }

    /**
     * Gửi đến kênh riêng của từng thành viên để đảm bảo cả người bị kick
     * (đã rời khỏi channel chat.{id}) vẫn nhận được thông báo.
     */
    public function broadcastOn(): array
    {
        return array_map(
            fn(int $userId) => new PrivateChannel('user.' . $userId),
            $this->recipientIds
        );
    }

    public function broadcastAs(): string
    {
        return 'GroupUpdated';
    }

    /**
     * Chỉ gửi các trường public (loại bỏ recipientIds khỏi payload).
     */
    public function broadcastWith(): array
    {
        return [
            'type' => $this->type,
            'conversationId' => $this->conversationId,
            'actor' => $this->actor,
            'target' => $this->target,
            'newName' => $this->newName,
        ];
    }
}
