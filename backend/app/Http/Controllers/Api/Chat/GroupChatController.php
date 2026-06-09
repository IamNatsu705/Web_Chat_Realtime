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

class GroupChatController extends Controller
{
    use ApiResponses;

    public function __construct(
        protected GroupChatServiceInterface $groupChatService
    ) {}

    // ── CRUD Nhóm ───────────────────────────────────────────────────────────

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

    public function addGroupMember(AddGroupMemberRequest $request, int $groupId): JsonResponse
    {
        $this->groupChatService->addGroupMember(
            $groupId,
            (int) auth()->id(),
            $request->validated()['user_id']
        );

        return $this->success(null, 'Thêm thành viên thành công.');
    }

    public function removeGroupMember(Request $request, int $groupId, int $userId): JsonResponse
    {
        $this->groupChatService->removeGroupMember(
            $groupId,
            (int) auth()->id(),
            $userId
        );

        return $this->success(null, 'Xóa thành viên thành công.');
    }

    public function leaveGroup(Request $request, int $groupId): JsonResponse
    {
        $this->groupChatService->leaveGroup($groupId, (int) auth()->id());

        return $this->success(null, 'Rời nhóm thành công.');
    }

    public function dissolveGroup(Request $request, int $groupId): JsonResponse
    {
        $this->groupChatService->dissolveGroup($groupId, (int) auth()->id());

        return $this->success(null, 'Giải tán nhóm thành công.');
    }

    // ── Community: Khám phá ─────────────────────────────────────────────────

    /**
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

    // ── Community: Tham gia nhóm ────────────────────────────────────────────

    /**
     * Tham gia nhóm open hoặc gửi yêu cầu tham gia nhóm request.
     * Tự động phân biệt dựa trên join_type của nhóm.
     */
    public function joinGroup(Request $request, int $groupId): JsonResponse
    {
        $group = app(\App\Repositories\ConversationRepo\ConversationRepositoryInterface::class)->findOrFail($groupId);

        if ($group->join_type === 'open') {
            $this->groupChatService->joinOpenGroup($groupId, (int) auth()->id());
            return $this->success(null, 'Tham gia nhóm thành công.');
        }

        if ($group->join_type === 'request') {
            $joinRequest = $this->groupChatService->requestToJoin($groupId, (int) auth()->id());
            return $this->success(['request' => $joinRequest], 'Đã gửi yêu cầu tham gia. Vui lòng chờ duyệt.', 201);
        }

        return $this->error('Nhóm này chỉ cho phép tham gia qua lời mời.', 403);
    }

    /**
     * Hủy yêu cầu tham gia nhóm.
     */
    public function cancelJoinRequest(Request $request, int $groupId): JsonResponse
    {
        $this->groupChatService->cancelJoinRequest($groupId, (int) auth()->id());
        return $this->success(null, 'Đã hủy yêu cầu tham gia.');
    }

    // ── Community: Quản lý yêu cầu tham gia ─────────────────────────────────

    /**
     * Lấy danh sách yêu cầu đang chờ duyệt.
     */
    public function getJoinRequests(Request $request, int $groupId): JsonResponse
    {
        $requests = $this->groupChatService->getPendingJoinRequests($groupId, (int) auth()->id());

        return $this->success(['requests' => $requests]);
    }

    /**
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

    // ── Community: Quản lý phó nhóm ─────────────────────────────────────────

    /**
     * Thăng cấp thành viên lên phó nhóm.
     */
    public function promoteModerator(Request $request, int $groupId, int $userId): JsonResponse
    {
        $this->groupChatService->promoteModerator($groupId, (int) auth()->id(), $userId);

        return $this->success(null, 'Đã thêm phó nhóm thành công.');
    }

    /**
     * Hạ cấp phó nhóm thành thành viên.
     */
    public function demoteModerator(Request $request, int $groupId, int $userId): JsonResponse
    {
        $this->groupChatService->demoteModerator($groupId, (int) auth()->id(), $userId);

        return $this->success(null, 'Đã gỡ phó nhóm thành công.');
    }
}
