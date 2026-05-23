<?php

namespace Database\Seeders\Traits;

use App\Models\Conversation;
use App\Models\ConversationParticipant;
use App\Models\Friendship;
use App\Models\FriendRequest;
use App\Models\Message;
use App\Models\MessageReadReceipt;
use App\Models\Post;
use App\Models\PostComment;
use App\Models\PostLike;
use App\Models\PostMedia;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Collection;

/**
 * Trait chứa các helper methods dùng chung cho tất cả seeders.
 * Mục đích: loại bỏ code lặp giữa các seeder files.
 */
trait SeederHelper
{
    protected Collection $users;

    /*
    |--------------------------------------------------------------------------
    | User Helpers
    |--------------------------------------------------------------------------
    */

    /** Load toàn bộ users vào bộ nhớ, index theo email. */
    protected function loadUsers(): void
    {
        $this->users = User::orderBy('id')->get()->keyBy('email');
    }

    /** Lấy user theo email. */
    protected function user(string $email): User
    {
        return $this->users[$email];
    }

    /** Tạo URL avatar từ ui-avatars.com. */
    protected function avatar(string $name, string $bg = 'random'): string
    {
        return 'https://ui-avatars.com/api/?name=' . urlencode($name)
            . '&background=' . $bg . '&color=ffffff&size=200&bold=true';
    }

    /*
    |--------------------------------------------------------------------------
    | Friendship Helpers
    |--------------------------------------------------------------------------
    */

    /** Tạo quan hệ bạn bè 2 chiều (FriendRequest accepted + Friendship record). */
    protected function befriend(User $a, User $b): void
    {
        $requestExists = FriendRequest::where(function ($q) use ($a, $b) {
            $q->where('sender_id', $a->id)->where('receiver_id', $b->id);
        })->orWhere(function ($q) use ($a, $b) {
            $q->where('sender_id', $b->id)->where('receiver_id', $a->id);
        })->exists();

        if (!$requestExists) {
            FriendRequest::create([
                'sender_id'   => $a->id,
                'receiver_id' => $b->id,
                'status'      => 'accepted',
                'created_at'  => now()->subDays(rand(10, 50)),
                'updated_at'  => now()->subDays(rand(1, 9)),
            ]);
        }

        Friendship::firstOrCreate([
            'user_id'   => $a->id,
            'friend_id' => $b->id,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Conversation Helpers
    |--------------------------------------------------------------------------
    */

    /**
     * Tạo DM conversation giữa 2 user, kèm messages và read receipts.
     *
     * @param array $msgs Mảng các cặp [$senderUser, 'nội dung tin nhắn']
     */
    protected function makeDM(User $a, User $b, array $msgs): Conversation
    {
        $conv = Conversation::create([
            'name'       => null,
            'is_group'   => false,
            'admin_id'   => null,
            'created_at' => now()->subDays(rand(5, 30)),
        ]);

        ConversationParticipant::create([
            'conversation_id' => $conv->id,
            'user_id'         => $a->id,
            'status'          => 'active',
        ]);
        ConversationParticipant::create([
            'conversation_id' => $conv->id,
            'user_id'         => $b->id,
            'status'          => 'active',
        ]);

        $created  = $this->insertMessages($conv, $msgs);
        $this->generateDmReadReceipts($created, $a, $b);

        return $conv;
    }

    /**
     * Tạo group conversation kèm messages và read receipts.
     *
     * @param array $members Danh sách User (không bao gồm admin)
     * @param array $msgs    Mảng các cặp [$senderUser, 'nội dung']
     */
    protected function makeGroup(
        string $name,
        ?string $avatarUrl,
        User $admin,
        array $members,
        array $msgs,
    ): Conversation {
        $conv = Conversation::create([
            'name'       => $name,
            'avatar'     => $avatarUrl,
            'is_group'   => true,
            'admin_id'   => $admin->id,
            'created_at' => now()->subDays(rand(10, 40)),
        ]);

        ConversationParticipant::create([
            'conversation_id' => $conv->id,
            'user_id'         => $admin->id,
            'status'          => 'active',
        ]);

        foreach ($members as $member) {
            ConversationParticipant::create([
                'conversation_id' => $conv->id,
                'user_id'         => $member->id,
                'status'          => 'active',
            ]);
        }

        $allMembers = array_merge([$admin], $members);
        $created    = $this->insertMessages($conv, $msgs);
        $this->generateGroupReadReceipts($created, $allMembers);

        return $conv;
    }

    /** Insert messages vào conversation. */
    private function insertMessages(Conversation $conv, array $msgs): array
    {
        $baseTime = now()->subDays(rand(1, 5));
        $created  = [];

        foreach ($msgs as $i => $m) {
            $msgTime   = (clone $baseTime)->addMinutes($i * rand(2, 12));
            $created[] = Message::create([
                'conversation_id' => $conv->id,
                'sender_id'       => $m[0]->id,
                'content'         => $m[1],
                'type'            => 'text',
                'is_recalled'     => false,
                'deleted_by'      => null,
                'created_at'      => $msgTime,
                'updated_at'      => $msgTime,
            ]);
        }

        return $created;
    }

    /** Tạo read receipts cho DM (reader = người còn lại). */
    private function generateDmReadReceipts(array $messages, User $a, User $b): void
    {
        foreach ($messages as $idx => $msg) {
            $reader = ($msg->sender_id === $a->id) ? $b : $a;
            $readAt = $this->calculateReadAt($messages, $idx, $reader);

            if ($readAt) {
                MessageReadReceipt::create([
                    'message_id' => $msg->id,
                    'user_id'    => $reader->id,
                    'read_at'    => $readAt,
                ]);
            }
        }
    }

    /** Tạo read receipts cho Group (mỗi member không phải sender). */
    private function generateGroupReadReceipts(array $messages, array $allMembers): void
    {
        foreach ($messages as $idx => $msg) {
            foreach ($allMembers as $member) {
                if ($member->id === $msg->sender_id) {
                    continue;
                }

                $readAt = $this->calculateReadAt($messages, $idx, $member, 70);

                if ($readAt) {
                    MessageReadReceipt::create([
                        'message_id' => $msg->id,
                        'user_id'    => $member->id,
                        'read_at'    => $readAt,
                    ]);
                }
            }
        }
    }

    /**
     * Tính thời gian đọc tin nhắn dựa trên logic:
     * - Nếu reader trả lời sau đó → chắc chắn đã đọc trước khi reply
     * - Nếu không reply → xác suất đọc (mặc định 80%)
     */
    private function calculateReadAt(
        array $messages,
        int $currentIdx,
        User $reader,
        int $readProbability = 80,
    ): ?Carbon {
        $msg = $messages[$currentIdx];

        // Tìm tin nhắn tiếp theo từ reader
        $nextReplyTime = null;
        for ($j = $currentIdx + 1; $j < count($messages); $j++) {
            if ($messages[$j]->sender_id === $reader->id) {
                $nextReplyTime = $messages[$j]->created_at;
                break;
            }
        }

        if ($nextReplyTime) {
            $diff = $msg->created_at->diffInSeconds($nextReplyTime);
            return $msg->created_at->copy()->addSeconds(rand(1, max(1, min(60, $diff))));
        }

        // Không reply → xác suất đọc
        if (rand(0, 100) < $readProbability) {
            return $msg->created_at->copy()->addSeconds(rand(5, 300));
        }

        return null;
    }

    /*
    |--------------------------------------------------------------------------
    | Post Helpers
    |--------------------------------------------------------------------------
    */

    /**
     * Tạo bài viết kèm media, likes, comments và replies.
     *
     * @param array $comments Mảng [$userObj, 'nội dung', ?[[$replyUser, 'reply']]]
     */
    protected function makePost(
        User $author,
        string $content,
        array $mediaUrls = [],
        array $likers = [],
        array $comments = [],
        bool $isPinned = false,
        int $daysAgo = 1,
    ): Post {
        $postTime = now()->subDays($daysAgo)->subHours(rand(0, 8));

        $post = Post::create([
            'user_id'        => $author->id,
            'content'        => $content,
            'media_url'      => $mediaUrls[0] ?? null,
            'likes_count'    => count($likers),
            'comments_count' => count($comments),
            'is_pinned'      => $isPinned,
            'status'         => 'active',
            'created_at'     => $postTime,
            'updated_at'     => $postTime,
        ]);

        foreach ($mediaUrls as $i => $url) {
            PostMedia::create([
                'post_id'    => $post->id,
                'media_url'  => $url,
                'media_type' => 'image',
                'sort_order' => $i,
                'created_at' => $postTime,
            ]);
        }

        foreach ($likers as $liker) {
            PostLike::create([
                'post_id'    => $post->id,
                'user_id'    => $liker->id,
                'created_at' => $postTime->copy()->addMinutes(rand(1, 120)),
            ]);
        }

        foreach ($comments as $c) {
            $commentTime = $postTime->copy()->addMinutes(rand(5, 180));

            $comment = PostComment::create([
                'post_id'    => $post->id,
                'user_id'    => $c[0]->id,
                'parent_id'  => null,
                'content'    => $c[1],
                'created_at' => $commentTime,
                'updated_at' => $commentTime,
            ]);

            if (!empty($c[2])) {
                foreach ($c[2] as $reply) {
                    $replyTime = $commentTime->copy()->addMinutes(rand(1, 30));
                    PostComment::create([
                        'post_id'    => $post->id,
                        'user_id'    => $reply[0]->id,
                        'parent_id'  => $comment->id,
                        'content'    => $reply[1],
                        'created_at' => $replyTime,
                        'updated_at' => $replyTime,
                    ]);
                }
            }
        }

        return $post;
    }
}
