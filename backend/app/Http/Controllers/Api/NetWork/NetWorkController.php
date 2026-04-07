<?php

namespace App\Http\Controllers\Api\Network;

use App\Http\Controllers\Controller;
use App\Http\Requests\Network\GetIncomingRequests;
use App\Http\Requests\Network\RespondFriendRequest;
use App\Http\Requests\Network\SendFriendRequest;
use App\Http\Requests\User\SearchUserRequest;
use App\Http\Resources\FriendRequestResource;
use App\Http\Resources\FriendshipResource;
use App\Http\Resources\UserResource;
use App\Services\NetworkServiceInterface;
use App\Services\UserServiceInterface;
use App\Traits\ApiResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NetworkController extends Controller
{
    use ApiResponses;

    public function __construct(
        protected NetworkServiceInterface $networkService,
        protected UserServiceInterface    $userService
    ) {}

    public function search(SearchUserRequest $request): JsonResponse
    {
        $users = $this->userService->search(
            $request->validated(),
            $request->user()->id
        );

        return $this->success(
            UserResource::collection($users),
            'Tìm kiếm người dùng thành công.'
        );
    }

    public function sendRequest(SendFriendRequest $request): JsonResponse
    {
        try {
            $result = $this->networkService->sendFriendRequest(
                $request->user()->id,
                $request->validated()['receiver_id']
            );

            return $this->success(
                new FriendRequestResource($result),
                'Gửi lời mời kết bạn thành công.',
                201
            );
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), 422);
        }
    }

    public function getIncomingRequests(GetIncomingRequests $request): JsonResponse
    {
        $requests = $this->networkService->getIncomingRequests($request->user()->id);

        return $this->success(
            FriendRequestResource::collection($requests),
            'Lấy danh sách lời mời kết bạn thành công.'
        );
    }

    public function getFriends(Request $request): JsonResponse
    {
        $friends = $this->networkService->getFriends($request->user()->id);

        return $this->success(
            FriendshipResource::collection($friends),
            'Lấy danh sách bạn bè thành công.'
        );
    }

    public function cancelFriendRequest(Request $request, int $userId): JsonResponse
    {
        try {
            $this->networkService->cancelFriendRequest($request->user()->id, $userId);

            return $this->success(null, 'Đã hủy lời mời kết bạn.');
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), 422);
        }
    }

    public function respondToRequest(RespondFriendRequest $request, int $requestId): JsonResponse
    {
        try {
            $this->networkService->respondToRequest(
                $requestId,
                $request->user()->id,
                $request->validated()['action']
            );

            $message = $request->validated()['action'] === 'accept'
                ? 'Đã chấp nhận lời mời kết bạn.'
                : 'Đã từ chối lời mời kết bạn.';

            return $this->success(null, $message);
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), 422);
        }
    }

    public function unfriend(Request $request, int $userId): JsonResponse
    {
        try {
            $this->networkService->unfriend($request->user()->id, $userId);

            return $this->success(null, 'Đã hủy kết bạn thành công.');
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), 422);
        }
    }
}
