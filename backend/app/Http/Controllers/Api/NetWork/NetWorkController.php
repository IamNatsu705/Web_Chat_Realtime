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
use App\Services\Network\NetworkServiceInterface;
use App\Services\User\UserServiceInterface;
use App\Traits\ApiResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Controller Mạng lưới (Network Controller).
 *
 * Xử lý các API endpoint liên quan đến mạng lưới bạn bè:
 * tìm kiếm người dùng, gửi/hủy/phản hồi lời mời kết bạn,
 * lấy danh sách bạn bè, hủy kết bạn, và gợi ý kết bạn.
 */
class NetworkController extends Controller
{
    use ApiResponses;

    public function __construct(
        protected NetworkServiceInterface $networkService,
        protected UserServiceInterface    $userService
    ) {}

    /**
     * GET /api/v1/network/search
     * Tìm kiếm người dùng theo từ khóa (tên hoặc email).
     */
    public function search(SearchUserRequest $request): JsonResponse
    {
        $users = $this->userService->search(
            $request->validated(),
            (int) auth()->id()
        );

        return $this->success(
            UserResource::collection($users),
            'Tìm kiếm người dùng thành công.'
        );
    }

    /**
     * POST /api/v1/network/friend-requests
     * Gửi lời mời kết bạn.
     */
    public function sendRequest(SendFriendRequest $request): JsonResponse
    {
        try {
            $result = $this->networkService->sendFriendRequest(
                (int) auth()->id(),
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

    /**
     * GET /api/v1/network/friend-requests/incoming
     * Lấy danh sách lời mời kết bạn đang chờ.
     */
    public function getIncomingRequests(GetIncomingRequests $request): JsonResponse
    {
        $requests = $this->networkService->getIncomingRequests((int) auth()->id());

        return $this->success(
            FriendRequestResource::collection($requests),
            'Lấy danh sách lời mời kết bạn thành công.'
        );
    }

    /**
     * GET /api/v1/network/friends
     * Lấy danh sách tất cả bạn bè.
     */
    public function getFriends(Request $request): JsonResponse
    {
        $friends = $this->networkService->getFriends((int) auth()->id());

        return $this->success(
            FriendshipResource::collection($friends),
            'Lấy danh sách bạn bè thành công.'
        );
    }

    /**
     * DELETE /api/v1/network/friend-requests/{userId}/cancel
     * Hủy lời mời kết bạn đã gửi.
     */
    public function cancelFriendRequest(Request $request, int $userId): JsonResponse
    {
        try {
            $this->networkService->cancelFriendRequest((int) auth()->id(), $userId);

            return $this->success(null, 'Đã hủy lời mời kết bạn.');
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), 422);
        }
    }

    /**
     * POST /api/v1/network/friend-requests/{requestId}/respond
     * Phản hồi lời mời kết bạn (chấp nhận hoặc từ chối).
     */
    public function respondToRequest(RespondFriendRequest $request, int $requestId): JsonResponse
    {
        try {
            $this->networkService->respondToRequest(
                $requestId,
                (int) auth()->id(),
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

    /**
     * DELETE /api/v1/network/friends/{userId}
     * Hủy kết bạn (unfriend).
     */
    public function unfriend(Request $request, int $userId): JsonResponse
    {
        try {
            $this->networkService->unfriend((int) auth()->id(), $userId);

            return $this->success(null, 'Đã hủy kết bạn thành công.');
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), 422);
        }
    }

    /**
     * GET /api/v1/network/users/{userId}
     * Lấy thông tin chi tiết người dùng (kèm trạng thái quan hệ).
     */
    public function getUser(int $userId): JsonResponse
    {
        $wrappedUser = $this->userService->search(['keyword' => ''], auth()->id())
            ->where('id', $userId)
            ->first();

        if (!$wrappedUser) {
            $wrappedUser = $this->userService->getUserById($userId);
        }

        return $this->success(
            new UserResource($wrappedUser),
            'Lấy thông tin người dùng thành công.'
        );
    }

    /**
     * GET /api/v1/network/suggestions
     * Gợi ý kết bạn dựa trên bạn chung (Mutual Friends).
     */
    public function suggestions(Request $request): JsonResponse
    {
        $suggestions = $this->networkService->getSuggestedFriends(
            (int) auth()->id(),
            $request->query('limit', 10)
        );

        return $this->success(
            UserResource::collection($suggestions),
            'Lấy gợi ý kết bạn thành công.'
        );
    }
}
