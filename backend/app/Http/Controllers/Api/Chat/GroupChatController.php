<?php

namespace App\Http\Controllers\Api\Chat;

use App\Http\Controllers\Controller;
use App\Http\Requests\Chat\AddGroupMemberRequest;
use App\Http\Requests\Chat\CreateGroupRequest;
use App\Http\Requests\Chat\UpdateGroupRequest;
use App\Http\Resources\ConversationResource;
use App\Services\Chat\GroupChatServiceInterface;
use App\Traits\ApiResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Controller Chat nhóm (Group Chat Controller).
 *
 * Xử lý các API endpoint liên quan đến quản lý nhóm chat:
 * - CRUD nhóm (tạo, cập nhật, giải tán).
 * - Quản lý thành viên (thêm, xóa, rời nhóm).
 * - Cộng đồng (khám phá, tham gia, duyệt yêu cầu).
 * - Quản lý phó nhóm (thăng cấp, hạ cấp).
 */
class GroupChatController extends Controller
{
    use ApiResponses;

    public function __construct(
        protected GroupChatServiceInterface $groupChatService
    ) {}

    // ── CRUD Nhóm ───────────────────────────────────────────────────────────

    /**
     * POST /api/v1/chat/groups
     * Tạo nhóm chat mới.
     */
    public function createGroup(CreateGroupRequest $request): JsonResponse
    {
        $conversation = $this->groupChatService->createGroup(
            (int) auth()->id(),
            $request->validated()
        );

        return $this->success(
            ['conversation' => new ConversationResource($conversation)],
            'Tạo nhóm thành công.',
            201
        );
    }

    /**
     * PUT /api/v1/chat/groups/{groupId}
     * Cập nhật thông tin nhóm.
     */
    public function updateGroup(UpdateGroupRequest $request, int $groupId): JsonResponse
    {
        $conversation = $this->groupChatService->updateGroup(
            $groupId,
            (int) auth()->id(),
            $request->validated()
        );

        return $this->success(
            ['conversation' => new ConversationResource($conversation)],
            'Cập nhật nhóm thành công.'
        );
    }

    // ── Thành viên ──────────────────────────────────────────────────────────

    /**
     * POST /api/v1/chat/groups/{groupId}/members
     * Thêm thành viên mới vào nhóm.
     */
    public function addGroupMember(AddGroupMemberRequest $request, int $groupId): JsonResponse
    {
        $this->groupChatService->addGroupMember(
            $groupId,
            (int) auth()->id(),
            $request->validated()['user_id']
        );

        return $this->success(null, 'Thêm thành viên thành công.');
    }

    /**
     * DELETE /api/v1/chat/groups/{groupId}/members/{userId}
     * Xóa thành viên khỏi nhóm (kick).
     */
    public function removeGroupMember(Request $request, int $groupId, int $userId): JsonResponse
    {
        $this->groupChatService->removeGroupMember(
            $groupId,
            (int) auth()->id(),
            $userId
        );

        return $this->success(null, 'Xóa thành viên thành công.');
    }

    /**
     * POST /api/v1/chat/groups/{groupId}/leave
     * Rời nhóm.
     */
    public function leaveGroup(Request $request, int $groupId): JsonResponse
    {
        $this->groupChatService->leaveGroup($groupId, (int) auth()->id());

        return $this->success(null, 'Rời nhóm thành công.');
    }

    /**
     * DELETE /api/v1/chat/groups/{groupId}
     * Giải tán nhóm (chỉ trưởng nhóm).
     */
    public function dissolveGroup(Request $request, int $groupId): JsonResponse
    {
        $this->groupChatService->dissolveGroup($groupId, (int) auth()->id());

        return $this->success(null, 'Giải tán nhóm thành công.');
    }

    // ── Cộng đồng: Khám phá ─────────────────────────────────────────────────

    /**
     * GET /api/v1/chat/communities
     * Lấy danh sách nhóm cộng đồng cho trang Khám phá.
     */
    public function getCommunities(Request $request): JsonResponse
    {
        $communities = $this->groupChatService->getCommunities(
            $request->query('search'),
            $request->query('category'),
            (int) $request->query('per_page', 12),
            (int) auth()->id()
        );

        return $this->success([
            'communities' => ConversationResource::collection($communities),
            'pagination'  => [
                'current_page' => $communities->currentPage(),
                'last_page'    => $communities->lastPage(),
                'per_page'     => $communities->perPage(),
                'total'        => $communities->total(),
            ],
        ]);
    }

    // ── Cộng đồng: Tham gia nhóm ────────────────────────────────────────────

    /**
     * POST /api/v1/chat/communities/{groupId}/join
     * Tham gia nhóm open hoặc gửi yêu cầu tham gia nhóm request.
     */
    public function joinGroup(Request $request, int $groupId): JsonResponse
    {
        $result = $this->groupChatService->joinGroup($groupId, (int) auth()->id());

        if ($result['type'] === 'joined') {
            return $this->success(null, 'Tham gia nhóm thành công.');
        }

        // type === 'requested' — yêu cầu đã được gửi, chờ duyệt
        return $this->success(['request' => $result['data']], 'Đã gửi yêu cầu tham gia. Vui lòng chờ duyệt.', 201);
    }

    /**
     * DELETE /api/v1/chat/communities/{groupId}/cancel-request
     * Hủy yêu cầu tham gia nhóm đang chờ duyệt.
     */
    public function cancelJoinRequest(Request $request, int $groupId): JsonResponse
    {
        $this->groupChatService->cancelJoinRequest($groupId, (int) auth()->id());
        return $this->success(null, 'Đã hủy yêu cầu tham gia.');
    }

    // ── Cộng đồng: Quản lý yêu cầu tham gia ─────────────────────────────────

    /**
     * GET /api/v1/chat/groups/{groupId}/join-requests
     * Lấy danh sách yêu cầu tham gia đang chờ duyệt.
     */
    public function getJoinRequests(Request $request, int $groupId): JsonResponse
    {
        $requests = $this->groupChatService->getPendingJoinRequests($groupId, (int) auth()->id());

        return $this->success(['requests' => $requests]);
    }

    /**
     * POST /api/v1/chat/groups/{groupId}/join-requests/{requestId}
     * Duyệt hoặc từ chối yêu cầu tham gia.
     */
    public function respondToJoinRequest(Request $request, int $groupId, int $requestId): JsonResponse
    {
        $request->validate([
            'action' => ['required', 'in:approve,reject'],
        ]);

        $this->groupChatService->respondToJoinRequest(
            $requestId,
            (int) auth()->id(),
            $request->input('action')
        );

        $message = $request->input('action') === 'approve'
            ? 'Đã duyệt yêu cầu tham gia.'
            : 'Đã từ chối yêu cầu tham gia.';

        return $this->success(null, $message);
    }

    // ── Cộng đồng: Quản lý phó nhóm ─────────────────────────────────────────

    /**
     * POST /api/v1/chat/groups/{groupId}/moderators/{userId}/promote
     * Thăng cấp thành viên lên phó nhóm.
     */
    public function promoteModerator(Request $request, int $groupId, int $userId): JsonResponse
    {
        $this->groupChatService->promoteModerator($groupId, (int) auth()->id(), $userId);

        return $this->success(null, 'Đã thêm phó nhóm thành công.');
    }

    /**
     * POST /api/v1/chat/groups/{groupId}/moderators/{userId}/demote
     * Hạ cấp phó nhóm thành thành viên.
     */
    public function demoteModerator(Request $request, int $groupId, int $userId): JsonResponse
    {
        $this->groupChatService->demoteModerator($groupId, (int) auth()->id(), $userId);

        return $this->success(null, 'Đã gỡ phó nhóm thành công.');
    }
}
