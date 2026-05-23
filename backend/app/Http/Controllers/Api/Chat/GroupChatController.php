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

    public function createGroup(CreateGroupRequest $request): JsonResponse
    {
        $conversation = $this->groupChatService->createGroup(
            $request->user()->id,
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
            $request->user()->id,
            $request->validated()
        );

        return $this->success(
            ['conversation' => new ConversationResource($conversation)],
            'Cập nhật nhóm thành công.'
        );
    }

    public function addGroupMember(AddGroupMemberRequest $request, int $groupId): JsonResponse
    {
        $this->groupChatService->addGroupMember(
            $groupId,
            $request->user()->id,
            $request->validated()['user_id']
        );

        return $this->success(null, 'Thêm thành viên thành công.');
    }

    public function removeGroupMember(Request $request, int $groupId, int $userId): JsonResponse
    {
        $this->groupChatService->removeGroupMember(
            $groupId,
            $request->user()->id,
            $userId
        );

        return $this->success(null, 'Xóa thành viên thành công.');
    }

    public function leaveGroup(Request $request, int $groupId): JsonResponse
    {
        $this->groupChatService->leaveGroup($groupId, $request->user()->id);

        return $this->success(null, 'Rời nhóm thành công.');
    }

    public function dissolveGroup(Request $request, int $groupId): JsonResponse
    {
        $this->groupChatService->dissolveGroup($groupId, $request->user()->id);

        return $this->success(null, 'Giải tán nhóm thành công.');
    }
}
