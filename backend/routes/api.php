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
| Auth:    Public routes (register, login)
|          Protected routes (me, logout)
|
| Profile: Protected — update profile, change password, get posts
|
| Network: Protected — search, friend requests, friends management
|
| Post:    Protected — feed, CRUD posts, like, comments
|
| Notification: Protected — list, count, mark read
|
| Admin:   Protected + AdminMiddleware — dashboard, users, posts management
|
*/

Route::prefix('v1')->group(function () {

    // ─── Auth (Public) ────────────────────────────────────────────────────
    Route::prefix('auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login',    [AuthController::class, 'login']);
    });

    // ─── Protected Routes ─────────────────────────────────────────────────
    Route::middleware('auth:sanctum')->group(function () {

        // Auth
        Route::prefix('auth')->group(function () {
            Route::get('/me',     [AuthController::class, 'me']);
            Route::post('/logout', [AuthController::class, 'logout']);
        });

        // Profile
        Route::prefix('profile')->group(function () {
            Route::post('/update',   [ProfileController::class, 'updateProfile']);
            Route::put('/password',  [ProfileController::class, 'updatePassword']);
            Route::get('/posts',     [ProfileController::class, 'getMyPosts']);
        });

        // Network
        Route::prefix('network')->group(function () {
            Route::get('/search',  [NetworkController::class, 'search']);
            Route::get('/friends', [NetworkController::class, 'getFriends']);
            Route::get('/requests', [NetworkController::class, 'getIncomingRequests']);
            Route::get('/suggestions', [NetworkController::class, 'suggestions']);

            // Friend Request actions
            Route::prefix('request')->group(function () {
                Route::post('/send',                    [NetworkController::class, 'sendRequest']);
                Route::delete('/cancel/{userId}',       [NetworkController::class, 'cancelFriendRequest']);
                Route::post('/{requestId}/respond',     [NetworkController::class, 'respondToRequest']);
            });

            // Friendship
            Route::delete('/friend/{userId}', [NetworkController::class, 'unfriend']);
            Route::get('/users/{userId}', [NetworkController::class, 'getUser']);
        });

        // Chat
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

                // ── Tài liệu (dùng cho mọi loại chat: DM, group, community) ────
                Route::get('/resources', [\App\Http\Controllers\Api\Chat\GroupResourceController::class, 'index']);
                Route::post('/resources', [\App\Http\Controllers\Api\Chat\GroupResourceController::class, 'store']);
                Route::get('/resources/{resourceId}/download', [\App\Http\Controllers\Api\Chat\GroupResourceController::class, 'download']);
                Route::delete('/resources/{resourceId}', [\App\Http\Controllers\Api\Chat\GroupResourceController::class, 'destroy']);
                Route::post('/resources/{resourceId}/pin', [\App\Http\Controllers\Api\Chat\GroupResourceController::class, 'togglePin']);
            });

            Route::prefix('messages')->group(function() {
                Route::post('/{messageId}/recall', [ChatController::class, 'recallMessage']);
                Route::delete('/{messageId}/delete', [ChatController::class, 'deleteMessageForMe']);
            });

            Route::prefix('groups')->group(function () {
                Route::post('/', [GroupChatController::class, 'createGroup']);
                Route::put('/{groupId}', [GroupChatController::class, 'updateGroup']);
                Route::delete('/{groupId}', [GroupChatController::class, 'dissolveGroup']);
                Route::post('/{groupId}/leave', [GroupChatController::class, 'leaveGroup']);
                
                Route::post('/{groupId}/members', [GroupChatController::class, 'addGroupMember']);
                Route::delete('/{groupId}/members/{userId}', [GroupChatController::class, 'removeGroupMember']);

                // ── Community: Tham gia nhóm ────────────────────────────────
                Route::post('/{groupId}/join', [GroupChatController::class, 'joinGroup']);
                Route::delete('/{groupId}/join', [GroupChatController::class, 'cancelJoinRequest']);

                // ── Community: Quản lý yêu cầu tham gia ────────────────────
                Route::get('/{groupId}/join-requests', [GroupChatController::class, 'getJoinRequests']);
                Route::post('/{groupId}/join-requests/{requestId}/respond', [GroupChatController::class, 'respondToJoinRequest']);

                // ── Community: Quản lý phó nhóm ────────────────────────────
                Route::post('/{groupId}/moderators/{userId}', [GroupChatController::class, 'promoteModerator']);
                Route::delete('/{groupId}/moderators/{userId}', [GroupChatController::class, 'demoteModerator']);

                // ── Tài liệu nhóm ──────────────────────────────────────────
                Route::get('/{groupId}/resources', [\App\Http\Controllers\Api\Chat\GroupResourceController::class, 'index']);
                Route::post('/{groupId}/resources', [\App\Http\Controllers\Api\Chat\GroupResourceController::class, 'store']);
                Route::get('/{groupId}/resources/{resourceId}/download', [\App\Http\Controllers\Api\Chat\GroupResourceController::class, 'download']);
                Route::delete('/{groupId}/resources/{resourceId}', [\App\Http\Controllers\Api\Chat\GroupResourceController::class, 'destroy']);
                Route::post('/{groupId}/resources/{resourceId}/pin', [\App\Http\Controllers\Api\Chat\GroupResourceController::class, 'togglePin']);
            });

            // ── Community: Khám phá nhóm cộng đồng ─────────────────────────
            Route::get('/communities', [GroupChatController::class, 'getCommunities']);

            // Streaks
            Route::prefix('streaks/{conversationId}')->group(function () {
                Route::get('/', [StreakController::class, 'show']);
                Route::post('/restore', [StreakController::class, 'restore']);
                Route::post('/share', [StreakController::class, 'share']);
            });
        });

        // Posts
        Route::prefix('posts')->group(function () {
            Route::get('/feed', [PostController::class, 'feed']);
            Route::post('/', [PostController::class, 'store']);
            Route::get('/{postId}', [PostController::class, 'show']);
            Route::put('/{postId}', [PostController::class, 'update']);
            Route::delete('/{postId}', [PostController::class, 'destroy']);
            Route::post('/{postId}/like', [PostController::class, 'toggleLike']);
            Route::get('/{postId}/comments', [PostController::class, 'getComments']);
            Route::post('/{postId}/comments', [PostController::class, 'storeComment']);

            // Comment management
            Route::put('/comments/{commentId}', [PostController::class, 'updateComment']);
            Route::delete('/comments/{commentId}', [PostController::class, 'destroyComment']);
        });

        // User posts (public profile)
        Route::get('/users/{userId}/posts', [PostController::class, 'userPosts']);

        // Admin (requires admin role)
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
