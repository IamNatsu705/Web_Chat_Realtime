<?php

namespace App\Services\Chat;

use App\Events\Chat\MessageRead;
use App\Events\Chat\MessageSent;
use App\Events\Chat\MessageRecalled;
use App\Repositories\ConversationRepo\ConversationRepositoryInterface;
use App\Repositories\MessageRepo\MessageRepositoryInterface;
use App\Repositories\FriendshipRepo\FriendshipRepositoryInterface;
use App\Repositories\ConversationParticipantRepo\ConversationParticipantRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Exception;

/**
 * Service Chat (Chat Service).
 *
 * Xử lý toàn bộ nghiệp vụ liên quan đến trò chuyện 1-1 và nhóm:
 * - Quản lý cuộc trò chuyện (lấy danh sách, tạo mới).
 * - Gửi tin nhắn (text, image, file) kèm broadcast sự kiện real-time.
 * - Thu hồi, xóa phía mình, xóa lịch sử.
 * - Xử lý cuộc trò chuyện từ người lạ (accept/reject).
 * - Tích hợp StreakService để cập nhật chuỗi nhắn tin.
 */
class ChatService implements ChatServiceInterface
{
    public function __construct(
        protected ConversationRepositoryInterface $conversationRepository,
        protected MessageRepositoryInterface $messageRepository,
        protected FriendshipRepositoryInterface $friendshipRepository,
        protected ConversationParticipantRepositoryInterface $participantRepository,
        protected StreakServiceInterface $streakService,
    ) {}

    /** {@inheritdoc} */
    public function getUserConversations(int $userId)
    {
        return $this->conversationRepository->getUserConversations($userId);
    }

    /**
     * Lấy hoặc tạo cuộc trò chuyện 1-1.
     * Nếu chưa tồn tại: tạo mới với trạng thái 'active' cho người gửi,
     * 'active' nếu đã là bạn bè hoặc 'pending' nếu là người lạ.
     */
    public function getOrCreateDirectConversation(int $userId, int $friendId)
    {
        $conversation = $this->conversationRepository->getDirectConversation($userId, $friendId);

        if (!$conversation) {
            DB::beginTransaction();
            try {
                $conversation = $this->conversationRepository->create([
                    'is_group' => false,
                ]);

                // Kiểm tra quan hệ bạn bè để xác định trạng thái ban đầu
                $isFriend = $this->friendshipRepository->getFriendshipStatus($userId, $friendId);
                $receiverStatus = $isFriend ? 'active' : 'pending';

                $this->participantRepository->createConversationParticipant($conversation->id, $userId, 'active');
                $this->participantRepository->createConversationParticipant($conversation->id, $friendId, $receiverStatus);

                DB::commit();
                $conversation->load(['participants.user', 'lastMessage.sender', 'streak']);
            } catch (Exception $e) {
                DB::rollBack();
                throw $e;
            }
        }

        return $conversation;
    }

    /** {@inheritdoc} */
    public function getMessages(int $conversationId, int $userId, int $limit, ?string $cursor)
    {
        $this->checkParticipation($conversationId, $userId, allowRejected: true);
        return $this->messageRepository->getMessagesByConversationId($conversationId, $userId, $limit, $cursor);
    }

    /**
     * Gửi tin nhắn mới.
     *
     * Luồng xử lý:
     * 1. Kiểm tra quyền tham gia cuộc trò chuyện.
     * 2. Kiểm tra người nhận có từ chối tin nhắn không (chat 1-1).
     * 3. Xử lý upload ảnh/file nếu có.
     * 4. Lưu tin nhắn vào database.
     * 5. Broadcast sự kiện MessageSent qua WebSocket.
     * 6. Cập nhật Streak (nếu là chat 1-1).
     */
    public function sendMessage(int $conversationId, int $userId, array $data)
    {
        $this->checkParticipation($conversationId, $userId);

        // Kiểm tra người nhận có từ chối tin nhắn không (chỉ áp dụng chat 1-1)
        $conversation = $this->conversationRepository->findOrFail($conversationId);
        if (!$conversation->is_group) {
            $otherParticipant = $this->participantRepository->getOtherParticipant($conversationId, $userId);
            if ($otherParticipant && $otherParticipant->status === 'rejected') {
                throw new Exception('Người nhận đã từ chối tin nhắn của bạn.');
            }
        }

        $type = $data['type'] ?? 'text';
        $content = $data['content'] ?? '';

        // Xử lý upload ảnh
        if (isset($data['image']) && $data['image'] instanceof \Illuminate\Http\UploadedFile) {
            $path = $data['image']->store('chat_images', 'public');
            $content = $path;
            $type = 'image';
        }

        // Xử lý upload file (tài liệu)
        if (isset($data['file']) && $data['file'] instanceof \Illuminate\Http\UploadedFile) {
            $uploadedFile = $data['file'];
            $path = $uploadedFile->store('chat_files', 'public');
            
            $fileExtension = $uploadedFile->getClientOriginalExtension();
            $fileName = $uploadedFile->getClientOriginalName();
            $fileSize = $uploadedFile->getSize();
            
            // Xác định loại file dựa trên extension
            $ext = strtolower($fileExtension);
            $resourceType = 'other';
            if (in_array($ext, ['pdf'])) $resourceType = 'pdf';
            elseif (in_array($ext, ['doc', 'docx'])) $resourceType = 'doc';
            elseif (in_array($ext, ['xls', 'xlsx'])) $resourceType = 'excel';
            elseif (in_array($ext, ['ppt', 'pptx'])) $resourceType = 'ppt';
            elseif (in_array($ext, ['jpg', 'jpeg', 'png', 'gif', 'webp'])) $resourceType = 'image';
            elseif (in_array($ext, ['zip', 'rar', '7z'])) $resourceType = 'archive';

            // Lưu vào bảng group_resources (Kho tài liệu chung)
            $resource = \App\Models\GroupResource::create([
                'conversation_id' => $conversationId,
                'uploader_id' => $userId,
                'title' => $data['file_title'] ?? $fileName,
                'category' => $data['file_category'] ?? 'other',
                'description' => $data['file_description'] ?? null,
                'file_url' => $path,
                'file_type' => $resourceType,
                'file_size' => $fileSize,
            ]);

            // Lưu JSON metadata để frontend hiển thị
            $content = json_encode([
                'resource_id' => $resource->id,
                'name' => $fileName,
                'url' => $path,
                'size' => $fileSize,
                'type' => $resourceType
            ]);
            $type = 'file';
        }

        $messageData = [
            'conversation_id' => $conversationId,
            'sender_id' => $userId,
            'content' => $content,
            'type' => $type,
        ];

        $message = $this->messageRepository->create($messageData);
        $message->load('sender');

        $participantIds = $this->participantRepository->getParticipantIds($conversationId);

        // Phát sự kiện real-time tới tất cả thành viên (trừ người gửi)
        broadcast(new MessageSent($message, $participantIds))->toOthers();

        // Cập nhật Streak (bắt lỗi để không ảnh hưởng việc gửi tin nhắn)
        try {
            $this->streakService->handleMessageSent($conversationId, $userId);
        } catch (Exception $e) {
            \Log::warning('Streak handling failed: ' . $e->getMessage());
        }

        return $message;
    }

    /**
     * Đánh dấu đã đọc — phân biệt logic giữa chat 1-1 và nhóm.
     */
    public function markAsRead(int $conversationId, int $userId)
    {
        $this->checkParticipation($conversationId, $userId);

        $conversation = $this->conversationRepository->findOrFail($conversationId);

        if ($conversation->is_group) {
            $this->messageRepository->markGroupMessagesAsRead($conversationId, $userId);
        } else {
            $this->messageRepository->markMessagesAsRead($conversationId, $userId);
        }

        broadcast(new MessageRead($conversationId, $userId))->toOthers();
    }

    /**
     * Kiểm tra người dùng có phải thành viên hợp lệ của cuộc trò chuyện không.
     *
     * @param bool $allowRejected Nếu true, người đã từ chối cuộc trò chuyện người lạ
     *             vẫn được thực hiện hành động (VD: xem tin nhắn, xóa phía mình, xóa lịch sử).
     */
    protected function checkParticipation(int $conversationId, int $userId, bool $allowRejected = false): void
    {
        $participant = $this->participantRepository->getParticipant($conversationId, $userId);

        if (!$participant) {
            throw new Exception('Bạn không thuộc cuộc trò chuyện này.');
        }

        if (!$allowRejected && $participant->status === 'rejected') {
            throw new Exception('Cuộc trò chuyện đã bị từ chối.');
        }
    }

    /**
     * Thu hồi tin nhắn — chỉ người gửi mới được thu hồi.
     * Nếu tin nhắn chứa file, xóa file trên storage và bản ghi GroupResource.
     */
    public function recallMessage(int $messageId, int $userId)
    {
        $message = $this->messageRepository->findOrFail($messageId);

        // Kiểm tra user còn là thành viên của cuộc hội thoại không
        // (Ngăn user đã bị kick thu hồi tin nhắn cũ)
        $this->checkParticipation($message->conversation_id, $userId);

        if ($message->sender_id !== $userId) {
            throw new Exception('Bạn không thể thu hồi tin nhắn của người khác.');
        }

        // Nếu tin nhắn chứa file → xóa file trên storage và bản ghi tài liệu
        if ($message->type === 'file') {
            $content = json_decode($message->content, true);
            if (isset($content['resource_id'])) {
                $resourceId = $content['resource_id'];
                $resource = \App\Models\GroupResource::find($resourceId);
                if ($resource) {
                    \Illuminate\Support\Facades\Storage::disk('public')->delete($resource->file_url);
                    $resource->delete();
                }
            }
        }

        $message->update([
            'is_recalled' => true,
            'content' => 'Tin nhắn đã bị thu hồi'
        ]);

        broadcast(new MessageRecalled($message->id, $message->conversation_id))->toOthers();

        return $message;
    }

    /**
     * Xóa tin nhắn chỉ ở phía mình — thêm userId vào mảng deleted_by.
     */
    public function deleteMessageForMe(int $messageId, int $userId)
    {
        $message = $this->messageRepository->findOrFail($messageId);

        $this->checkParticipation($message->conversation_id, $userId, allowRejected: true);

        $deletedBy = $message->deleted_by ?? [];
        if (!in_array($userId, $deletedBy)) {
            $deletedBy[] = $userId;
            $message->update(['deleted_by' => $deletedBy]);
        }

        return $message;
    }

    /**
     * Xóa toàn bộ lịch sử trò chuyện phía mình (cập nhật cleared_at = now()).
     */
    public function clearConversation(int $conversationId, int $userId)
    {
        $this->checkParticipation($conversationId, $userId, allowRejected: true);

        $this->participantRepository->updateClearedAt($conversationId, $userId);
    }

    /**
     * Chấp nhận cuộc trò chuyện từ người lạ — chuyển trạng thái pending → active.
     * Đánh dấu đã đọc ngay để đồng bộ trạng thái đọc về phía người gửi.
     */
    public function acceptStrangerConversation(int $conversationId, int $userId)
    {
        $participant = $this->participantRepository->getParticipant($conversationId, $userId);

        if (!$participant || $participant->status !== 'pending') {
            throw new Exception('Không thể chấp nhận cuộc trò chuyện này.');
        }

        $participant->update(['status' => 'active']);

        // Đánh dấu đã đọc ngay để đồng bộ trạng thái đọc về phía người gửi
        $this->markAsRead($conversationId, $userId);
    }

    /**
     * Từ chối cuộc trò chuyện từ người lạ — chuyển trạng thái pending → rejected.
     */
    public function rejectStrangerConversation(int $conversationId, int $userId)
    {
        $participant = $this->participantRepository->getParticipant($conversationId, $userId);

        if (!$participant || $participant->status !== 'pending') {
            throw new Exception('Không thể từ chối cuộc trò chuyện này.');
        }

        $participant->update(['status' => 'rejected']);
    }
}
