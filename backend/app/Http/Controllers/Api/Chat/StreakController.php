<?php

namespace App\Http\Controllers\Api\Chat;

use App\Http\Controllers\Controller;
use App\Services\Chat\StreakServiceInterface;
use App\Traits\ApiResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StreakController extends Controller
{
    use ApiResponses;

    public function __construct(
        protected StreakServiceInterface $streakService
    ) {}

    /**
     * POST /api/v1/chat/streaks/{conversationId}/restore
     * User manually restores a streak.
     */
    public function restore(Request $request, int $conversationId): JsonResponse
    {
        try {
            $result = $this->streakService->restoreStreak($conversationId, (int) auth()->id());
            return $this->success($result, 'Khôi phục chuỗi thành công!');
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), 400);
        }
    }

    /**
     * POST /api/v1/chat/streaks/{conversationId}/share
     * User shares streak milestone to their personal wall.
     */
    public function share(Request $request, int $conversationId): JsonResponse
    {
        try {
            $result = $this->streakService->shareStreak($conversationId, (int) auth()->id());
            return $this->success($result, 'Đã chia sẻ chuỗi lên tường!');
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), 400);
        }
    }

    /**
     * GET /api/v1/chat/streaks/{conversationId}
     * Get streak info for a conversation.
     */
    public function show(Request $request, int $conversationId): JsonResponse
    {
        $data = $this->streakService->getStreakForConversation($conversationId, (int) auth()->id());
        return $this->success(['streak' => $data], 'Lấy thông tin chuỗi thành công.');
    }
}
