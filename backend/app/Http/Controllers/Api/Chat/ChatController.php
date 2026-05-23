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

class ChatController extends Controller
{
    use ApiResponses;

    public function __construct(
        protected ChatServiceInterface $chatService
    ) {}

    public function getConversations(Request $request): JsonResponse
    {
        $conversations = $this->chatService->getUserConversations($request->user()->id);

        return $this->success(
            ['conversations' => ConversationResource::collection($conversations)],
            'Lấy danh sách cuộc trò chuyện thành công.'
        );
    }

    public function getOrCreateDirect(Request $request): JsonResponse
    {
        $request->validate([
            'friend_id' => 'required|integer|exists:users,id'
        ]);

        $conversation = $this->chatService->getOrCreateDirectConversation(
            $request->user()->id,
            $request->input('friend_id')
        );

        return $this->success(
            ['conversation' => new ConversationResource($conversation)],
            'Lấy cuộc trò chuyện liên lạc thành công.'
        );
    }

    public function getMessages(Request $request, int $conversationId): JsonResponse
    {
        $limit = $request->input('limit', 20);
        $cursor = $request->input('cursor');

        $messagesPaginated = $this->chatService->getMessages($conversationId, $request->user()->id, $limit, $cursor);

        return $this->success(
            [
                'messages' => MessageResource::collection($messagesPaginated->items()),
                'next_cursor' => $messagesPaginated->nextCursor()?->encode(),
                'has_more' => $messagesPaginated->hasMorePages()
            ],
            'Lấy danh sách tin nhắn thành công.'
        );
    }

    public function sendMessage(SendMessageRequest $request, int $conversationId): JsonResponse
    {
        $data = $request->validated();

        // Include uploaded image file if present
        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image');
        }

        $message = $this->chatService->sendMessage(
            $conversationId,
            $request->user()->id,
            $data
        );

        return $this->success(
            ['message' => new MessageResource($message)],
            'Gửi tin nhắn thành công.'
        );
    }

    public function markRead(Request $request, int $conversationId): JsonResponse
    {
        $this->chatService->markAsRead($conversationId, $request->user()->id);

        return $this->success(null, 'Đã đánh dấu đọc tin nhắn.');
    }

    public function recallMessage(Request $request, int $messageId): JsonResponse
    {
        $message = $this->chatService->recallMessage($messageId, $request->user()->id);
        
        return $this->success(
            ['message' => new MessageResource($message)],
            'Tin nhắn đã được thu hồi.'
        );
    }

    public function deleteMessageForMe(Request $request, int $messageId): JsonResponse
    {
        $message = $this->chatService->deleteMessageForMe($messageId, $request->user()->id);
        
        return $this->success(
            ['message' => new MessageResource($message)],
            'Đã xóa tin nhắn phí bạn.'
        );
    }

    public function clearConversation(Request $request, int $conversationId): JsonResponse
    {
        $this->chatService->clearConversation($conversationId, $request->user()->id);

        return $this->success(null, 'Đã xóa lịch sử trò chuyện phía bạn.');
    }

    public function acceptStranger(Request $request, int $conversationId): JsonResponse
    {
        $this->chatService->acceptStrangerConversation($conversationId, $request->user()->id);

        return $this->success(null, 'Đã chấp nhận cuộc trò chuyện.');
    }

    public function rejectStranger(Request $request, int $conversationId): JsonResponse
    {
        $this->chatService->rejectStrangerConversation($conversationId, $request->user()->id);

        return $this->success(null, 'Đã từ chối cuộc trò chuyện.');
    }
}
