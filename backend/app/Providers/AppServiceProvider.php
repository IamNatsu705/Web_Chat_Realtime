<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
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

        // Auth
        $this->app->bind(
            \App\Services\Auth\AuthServiceInterface::class,
            \App\Services\Auth\AuthService::class
        );

        // User
        $this->app->bind(
            \App\Services\User\UserServiceInterface::class,
            \App\Services\User\UserService::class
        );

        // Network
        $this->app->bind(
            \App\Services\Network\NetworkServiceInterface::class,
            \App\Services\Network\NetworkService::class
        );

        // Profile
        $this->app->bind(
            \App\Services\Profile\ProfileServiceInterface::class,
            \App\Services\Profile\ProfileService::class
        );

        // Chat
        $this->app->bind(
            \App\Services\Chat\ChatServiceInterface::class,
            \App\Services\Chat\ChatService::class
        );
        $this->app->bind(
            \App\Services\Chat\GroupChatServiceInterface::class,
            \App\Services\Chat\GroupChatService::class
        );
        $this->app->bind(
            \App\Services\Chat\StreakServiceInterface::class,
            \App\Services\Chat\StreakService::class
        );
        $this->app->bind(
            \App\Services\Chat\GroupResourceServiceInterface::class,
            \App\Services\Chat\GroupResourceService::class
        );

        // Post
        $this->app->bind(
            \App\Services\Post\PostServiceInterface::class,
            \App\Services\Post\PostService::class
        );

        // Admin
        $this->app->bind(
            \App\Services\Admin\AdminServiceInterface::class,
            \App\Services\Admin\AdminService::class
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
