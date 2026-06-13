<?php

namespace App\Http\Controllers\Api\Chat;

use App\Http\Controllers\Controller;
use App\Http\Requests\Chat\SendMessageRequest;
use App\Http\Resources\ConversationResource;
use App\Http\Resources\MessageResource;
use App\Services\Chat\ChatServiceInterface;
use App\Traits\ApiResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Controller Chat (Chat Controller).
 *
 * Xử lý các API endpoint liên quan đến trò chuyện:
 * - Lấy danh sách cuộc trò chuyện, tạo cuộc trò chuyện 1-1.
 * - Gửi/lấy tin nhắn, đánh dấu đã đọc.
 * - Thu hồi, xóa phía mình, xóa lịch sử.
 * - Chấp nhận/từ chối cuộc trò chuyện từ người lạ.
 */
class ChatController extends Controller
{
    use ApiResponses;

    public function __construct(
        protected ChatServiceInterface $chatService
    ) {}

    /**
     * GET /api/v1/chat/conversations
     * Lấy danh sách cuộc trò chuyện của người dùng (hiển thị trên Sidebar).
     */
    public function getConversations(Request $request): JsonResponse
    {
        $conversations = $this->chatService->getUserConversations((int) auth()->id());

        return $this->success(
            ['conversations' => ConversationResource::collection($conversations)],
            'Lấy danh sách cuộc trò chuyện thành công.'
        );
    }

    /**
     * POST /api/v1/chat/conversations/direct
     * Lấy hoặc tạo cuộc trò chuyện 1-1 với một người dùng.
     */
    public function getOrCreateDirect(Request $request): JsonResponse
    {
        $request->validate([
            'friend_id' => 'required|integer|exists:users,id'
        ]);

        $conversation = $this->chatService->getOrCreateDirectConversation(
            (int) auth()->id(),
            $request->input('friend_id')
        );

        return $this->success(
            ['conversation' => new ConversationResource($conversation)],
            'Lấy cuộc trò chuyện liên lạc thành công.'
        );
    }

    /**
     * GET /api/v1/chat/conversations/{conversationId}/messages
     * Lấy danh sách tin nhắn (phân trang cursor).
     */
    public function getMessages(Request $request, int $conversationId): JsonResponse
    {
        $limit = $request->input('limit', 20);
        $cursor = $request->input('cursor');

        $messagesPaginated = $this->chatService->getMessages($conversationId, (int) auth()->id(), $limit, $cursor);

        return $this->success(
            [
                'messages' => MessageResource::collection($messagesPaginated->items()),
                'next_cursor' => $messagesPaginated->nextCursor()?->encode(),
                'has_more' => $messagesPaginated->hasMorePages()
            ],
            'Lấy danh sách tin nhắn thành công.'
        );
    }

    /**
     * POST /api/v1/chat/conversations/{conversationId}/messages
     * Gửi tin nhắn mới (text, image, hoặc file).
     */
    public function sendMessage(SendMessageRequest $request, int $conversationId): JsonResponse
    {
        $data = $request->validated();

        // Đính kèm file ảnh nếu có
        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image');
        }

        $message = $this->chatService->sendMessage(
            $conversationId,
            (int) auth()->id(),
            $data
        );

        return $this->success(
            ['message' => new MessageResource($message)],
            'Gửi tin nhắn thành công.'
        );
    }

    /**
     * POST /api/v1/chat/conversations/{conversationId}/read
     * Đánh dấu tất cả tin nhắn trong cuộc trò chuyện là đã đọc.
     */
    public function markRead(Request $request, int $conversationId): JsonResponse
    {
        $this->chatService->markAsRead($conversationId, (int) auth()->id());

        return $this->success(null, 'Đã đánh dấu đọc tin nhắn.');
    }

    /**
     * POST /api/v1/chat/messages/{messageId}/recall
     * Thu hồi tin nhắn (chỉ người gửi).
     */
    public function recallMessage(Request $request, int $messageId): JsonResponse
    {
        $message = $this->chatService->recallMessage($messageId, (int) auth()->id());
        
        return $this->success(
            ['message' => new MessageResource($message)],
            'Tin nhắn đã được thu hồi.'
        );
    }

    /**
     * DELETE /api/v1/chat/messages/{messageId}/delete-for-me
     * Xóa tin nhắn chỉ ở phía mình.
     */
    public function deleteMessageForMe(Request $request, int $messageId): JsonResponse
    {
        $message = $this->chatService->deleteMessageForMe($messageId, (int) auth()->id());
        
        return $this->success(
            ['message' => new MessageResource($message)],
            'Đã xóa tin nhắn phía bạn.'
        );
    }

    /**
     * DELETE /api/v1/chat/conversations/{conversationId}/clear
     * Xóa toàn bộ lịch sử trò chuyện phía mình.
     */
    public function clearConversation(Request $request, int $conversationId): JsonResponse
    {
        $this->chatService->clearConversation($conversationId, (int) auth()->id());

        return $this->success(null, 'Đã xóa lịch sử trò chuyện phía bạn.');
    }

    /**
     * POST /api/v1/chat/conversations/{conversationId}/accept
     * Chấp nhận cuộc trò chuyện từ người lạ.
     */
    public function acceptStranger(Request $request, int $conversationId): JsonResponse
    {
        $this->chatService->acceptStrangerConversation($conversationId, (int) auth()->id());

        return $this->success(null, 'Đã chấp nhận cuộc trò chuyện.');
    }

    /**
     * POST /api/v1/chat/conversations/{conversationId}/reject
     * Từ chối cuộc trò chuyện từ người lạ.
     */
    public function rejectStranger(Request $request, int $conversationId): JsonResponse
    {
        $this->chatService->rejectStrangerConversation($conversationId, (int) auth()->id());

        return $this->success(null, 'Đã từ chối cuộc trò chuyện.');
    }
}
