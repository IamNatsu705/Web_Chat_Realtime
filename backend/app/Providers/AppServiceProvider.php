<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

/**
 * Service Provider chính (App Service Provider).
 *
 * Đăng ký tất cả bindings cho Dependency Injection:
 * - Repository Interfaces → Implementations.
 * - Service Interfaces → Implementations.
 *
 * Laravel IoC Container sử dụng các binding này để tự động inject
 * đúng implementation khi Controller/Service yêu cầu Interface.
 */
class AppServiceProvider extends ServiceProvider
{
    /**
     * Đăng ký các service và repository bindings.
     */
    public function register(): void
    {
        // ─── Repositories ────────────────────────────────────────────────────

        $this->app->bind(
            \App\Repositories\UserRepo\UserRepositoryInterface::class,
            \App\Repositories\UserRepo\UserRepository::class
        );
        $this->app->bind(
            \App\Repositories\FriendRequestRepo\FriendRequestRepositoryInterface::class,
            \App\Repositories\FriendRequestRepo\FriendRequestRepository::class
        );
        $this->app->bind(
            \App\Repositories\FriendshipRepo\FriendshipRepositoryInterface::class,
            \App\Repositories\FriendshipRepo\FriendshipRepository::class
        );
        $this->app->bind(
            \App\Repositories\PostRepo\PostRepositoryInterface::class,
            \App\Repositories\PostRepo\PostRepository::class
        );
        $this->app->bind(
            \App\Repositories\ConversationRepo\ConversationRepositoryInterface::class,
            \App\Repositories\ConversationRepo\ConversationRepository::class
        );
        $this->app->bind(
            \App\Repositories\MessageRepo\MessageRepositoryInterface::class,
            \App\Repositories\MessageRepo\MessageRepository::class
        );
        $this->app->bind(
            \App\Repositories\PostLikeRepo\PostLikeRepositoryInterface::class,
            \App\Repositories\PostLikeRepo\PostLikeRepository::class
        );
        $this->app->bind(
            \App\Repositories\PostCommentRepo\PostCommentRepositoryInterface::class,
            \App\Repositories\PostCommentRepo\PostCommentRepository::class
        );
        $this->app->bind(
            \App\Repositories\ConversationParticipantRepo\ConversationParticipantRepositoryInterface::class,
            \App\Repositories\ConversationParticipantRepo\ConversationParticipantRepository::class
        );
        $this->app->bind(
            \App\Repositories\StreakRepo\StreakRepositoryInterface::class,
            \App\Repositories\StreakRepo\StreakRepository::class
        );
        $this->app->bind(
            \App\Repositories\GroupJoinRequestRepo\GroupJoinRequestRepositoryInterface::class,
            \App\Repositories\GroupJoinRequestRepo\GroupJoinRequestRepository::class
        );
        $this->app->bind(
            \App\Repositories\GroupResourceRepo\GroupResourceRepositoryInterface::class,
            \App\Repositories\GroupResourceRepo\GroupResourceRepository::class
        );

        // ─── Services ────────────────────────────────────────────────────────

        // Xác thực
        $this->app->bind(
            \App\Services\Auth\AuthServiceInterface::class,
            \App\Services\Auth\AuthService::class
        );

        // Người dùng
        $this->app->bind(
            \App\Services\User\UserServiceInterface::class,
            \App\Services\User\UserService::class
        );

        // Mạng lưới bạn bè
        $this->app->bind(
            \App\Services\Network\NetworkServiceInterface::class,
            \App\Services\Network\NetworkService::class
        );

        // Hồ sơ cá nhân
        $this->app->bind(
            \App\Services\Profile\ProfileServiceInterface::class,
            \App\Services\Profile\ProfileService::class
        );

        // Chat (trò chuyện 1-1)
        $this->app->bind(
            \App\Services\Chat\ChatServiceInterface::class,
            \App\Services\Chat\ChatService::class
        );

        // Chat nhóm
        $this->app->bind(
            \App\Services\Chat\GroupChatServiceInterface::class,
            \App\Services\Chat\GroupChatService::class
        );

        // Chuỗi nhắn tin (Streak)
        $this->app->bind(
            \App\Services\Chat\StreakServiceInterface::class,
            \App\Services\Chat\StreakService::class
        );

        // Tài liệu nhóm
        $this->app->bind(
            \App\Services\Chat\GroupResourceServiceInterface::class,
            \App\Services\Chat\GroupResourceService::class
        );

        // Bài đăng
        $this->app->bind(
            \App\Services\Post\PostServiceInterface::class,
            \App\Services\Post\PostService::class
        );

        // Quản trị
        $this->app->bind(
            \App\Services\Admin\AdminServiceInterface::class,
            \App\Services\Admin\AdminService::class
        );
    }

    /**
     * Khởi chạy các dịch vụ ứng dụng.
     */
    public function boot(): void
    {
        //
    }
}
