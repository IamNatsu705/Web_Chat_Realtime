<?php

use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\Network\NetworkController;
use App\Http\Controllers\Api\Profile\ProfileController;
use App\Http\Controllers\Api\Chat\ChatController;
use App\Http\Controllers\Api\Chat\GroupChatController;
use App\Http\Controllers\Api\Chat\StreakController;
use App\Http\Controllers\Api\Post\PostController;
use App\Http\Controllers\Api\Admin\AdminController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — v1
|--------------------------------------------------------------------------
| Prefix: /api/v1
|
| Auth:    Route công khai (đăng ký, đăng nhập)
|          Route bảo vệ (lấy thông tin, đăng xuất)
|
| Profile: Bảo vệ — cập nhật hồ sơ, đổi mật khẩu, lấy bài đăng
|
| Network: Bảo vệ — tìm kiếm, lời mời kết bạn, quản lý bạn bè
|
| Post:    Bảo vệ — bảng tin, CRUD bài viết, lượt thích, bình luận
|
| Admin:   Bảo vệ + AdminMiddleware — thống kê, quản lý user/bài viết
|
*/

Route::prefix('v1')->group(function () {

    // ─── Xác thực (công khai) ────────────────────────────────────────────
    Route::prefix('auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login',    [AuthController::class, 'login']);
    });

    // ─── Route bảo vệ (yêu cầu đăng nhập) ──────────────────────────────
    Route::middleware('auth:sanctum')->group(function () {

        // Xác thực
        Route::prefix('auth')->group(function () {
            Route::get('/me',     [AuthController::class, 'me']);
            Route::post('/logout', [AuthController::class, 'logout']);
        });

        // Hồ sơ cá nhân
        Route::prefix('profile')->group(function () {
            Route::post('/update',   [ProfileController::class, 'updateProfile']);
            Route::put('/password',  [ProfileController::class, 'updatePassword']);
            Route::get('/posts',     [ProfileController::class, 'getMyPosts']);
        });

        // Mạng lưới bạn bè
        Route::prefix('network')->group(function () {
            Route::get('/search',  [NetworkController::class, 'search']);
            Route::get('/friends', [NetworkController::class, 'getFriends']);
            Route::get('/requests', [NetworkController::class, 'getIncomingRequests']);
            Route::get('/suggestions', [NetworkController::class, 'suggestions']);

            // Lời mời kết bạn
            Route::prefix('request')->group(function () {
                Route::post('/send',                    [NetworkController::class, 'sendRequest']);
                Route::delete('/cancel/{userId}',       [NetworkController::class, 'cancelFriendRequest']);
                Route::post('/{requestId}/respond',     [NetworkController::class, 'respondToRequest']);
            });

            // Quản lý bạn bè
            Route::delete('/friend/{userId}', [NetworkController::class, 'unfriend']);
            Route::get('/users/{userId}', [NetworkController::class, 'getUser']);
        });

        // Chat (Trò chuyện)
        Route::prefix('chat')->group(function () {
            Route::get('/conversations', [ChatController::class, 'getConversations']);
            Route::post('/conversations/direct', [ChatController::class, 'getOrCreateDirect']);
            
            Route::prefix('conversations/{conversationId}')->group(function () {
                Route::get('/messages', [ChatController::class, 'getMessages']);
                Route::post('/messages', [ChatController::class, 'sendMessage']);
                Route::post('/read', [ChatController::class, 'markRead']);
                Route::delete('/clear', [ChatController::class, 'clearConversation']);

                Route::post('/accept', [ChatController::class, 'acceptStranger']);
                Route::post('/reject', [ChatController::class, 'rejectStranger']);

                // ── Tài liệu (dùng cho mọi loại chat: DM, nhóm, cộng đồng) ────
                Route::get('/resources', [\App\Http\Controllers\Api\Chat\GroupResourceController::class, 'index']);
                Route::post('/resources', [\App\Http\Controllers\Api\Chat\GroupResourceController::class, 'store']);
                Route::get('/resources/{resourceId}/download', [\App\Http\Controllers\Api\Chat\GroupResourceController::class, 'download']);
                Route::delete('/resources/{resourceId}', [\App\Http\Controllers\Api\Chat\GroupResourceController::class, 'destroy']);
                Route::post('/resources/{resourceId}/pin', [\App\Http\Controllers\Api\Chat\GroupResourceController::class, 'togglePin']);
            });

            // Quản lý tin nhắn
            Route::prefix('messages')->group(function() {
                Route::post('/{messageId}/recall', [ChatController::class, 'recallMessage']);
                Route::delete('/{messageId}/delete', [ChatController::class, 'deleteMessageForMe']);
            });

            // Quản lý nhóm chat
            Route::prefix('groups')->group(function () {
                Route::post('/', [GroupChatController::class, 'createGroup']);
                Route::put('/{groupId}', [GroupChatController::class, 'updateGroup']);
                Route::delete('/{groupId}', [GroupChatController::class, 'dissolveGroup']);
                Route::post('/{groupId}/leave', [GroupChatController::class, 'leaveGroup']);
                
                Route::post('/{groupId}/members', [GroupChatController::class, 'addGroupMember']);
                Route::delete('/{groupId}/members/{userId}', [GroupChatController::class, 'removeGroupMember']);

                // ── Cộng đồng: Tham gia nhóm ────────────────────────────────
                Route::post('/{groupId}/join', [GroupChatController::class, 'joinGroup']);
                Route::delete('/{groupId}/join', [GroupChatController::class, 'cancelJoinRequest']);

                // ── Cộng đồng: Quản lý yêu cầu tham gia ────────────────────
                Route::get('/{groupId}/join-requests', [GroupChatController::class, 'getJoinRequests']);
                Route::post('/{groupId}/join-requests/{requestId}/respond', [GroupChatController::class, 'respondToJoinRequest']);

                // ── Cộng đồng: Quản lý phó nhóm ────────────────────────────
                Route::post('/{groupId}/moderators/{userId}', [GroupChatController::class, 'promoteModerator']);
                Route::delete('/{groupId}/moderators/{userId}', [GroupChatController::class, 'demoteModerator']);

                // ── Tài liệu nhóm ──────────────────────────────────────────
                Route::get('/{groupId}/resources', [\App\Http\Controllers\Api\Chat\GroupResourceController::class, 'index']);
                Route::post('/{groupId}/resources', [\App\Http\Controllers\Api\Chat\GroupResourceController::class, 'store']);
                Route::get('/{groupId}/resources/{resourceId}/download', [\App\Http\Controllers\Api\Chat\GroupResourceController::class, 'download']);
                Route::delete('/{groupId}/resources/{resourceId}', [\App\Http\Controllers\Api\Chat\GroupResourceController::class, 'destroy']);
                Route::post('/{groupId}/resources/{resourceId}/pin', [\App\Http\Controllers\Api\Chat\GroupResourceController::class, 'togglePin']);
            });

            // ── Cộng đồng: Khám phá nhóm ─────────────────────────────────
            Route::get('/communities', [GroupChatController::class, 'getCommunities']);

            // Chuỗi nhắn tin (Streak)
            Route::prefix('streaks/{conversationId}')->group(function () {
                Route::get('/', [StreakController::class, 'show']);
                Route::post('/restore', [StreakController::class, 'restore']);
                Route::post('/share', [StreakController::class, 'share']);
            });
        });

        // Bài đăng
        Route::prefix('posts')->group(function () {
            Route::get('/feed', [PostController::class, 'feed']);
            Route::post('/', [PostController::class, 'store']);
            Route::get('/{postId}', [PostController::class, 'show']);
            Route::put('/{postId}', [PostController::class, 'update']);
            Route::delete('/{postId}', [PostController::class, 'destroy']);
            Route::post('/{postId}/like', [PostController::class, 'toggleLike']);
            Route::get('/{postId}/comments', [PostController::class, 'getComments']);
            Route::post('/{postId}/comments', [PostController::class, 'storeComment']);

            // Quản lý bình luận
            Route::put('/comments/{commentId}', [PostController::class, 'updateComment']);
            Route::delete('/comments/{commentId}', [PostController::class, 'destroyComment']);
        });

        // Bài viết theo người dùng (trang cá nhân)
        Route::get('/users/{userId}/posts', [PostController::class, 'userPosts']);

        // Quản trị viên (yêu cầu role admin)
        Route::prefix('admin')->middleware(\App\Http\Middleware\AdminMiddleware::class)->group(function () {
            Route::get('/dashboard', [AdminController::class, 'dashboard']);
            Route::get('/users', [AdminController::class, 'getUsers']);
            Route::post('/users/{userId}/ban', [AdminController::class, 'banUser']);
            Route::post('/users/{userId}/unban', [AdminController::class, 'unbanUser']);
            Route::get('/posts', [AdminController::class, 'getPosts']);
            Route::put('/posts/{postId}/hide', [AdminController::class, 'hidePost']);
            Route::put('/posts/{postId}/restore', [AdminController::class, 'restorePost']);
        });
    });
});
