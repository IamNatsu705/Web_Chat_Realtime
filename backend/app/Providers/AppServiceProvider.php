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
        // Repositories
        $this->app->bind(
            \App\Repositories\UserRepo\UserRepositoryInterface::class,
            \App\Repositories\UserRepo\UserRepository::class
        );
        $this->app->bind(
            \App\Repositories\FriendRequestRepo\FriendRequestRepositoryInterface::class,
            \App\Repositories\FriendRequestRepo\FriendRequestRepository::class
        );
        $this->app->bind(
            \App\Repositories\FriendShipRepo\FriendShipRepositoryInterface::class,
            \App\Repositories\FriendShipRepo\FriendShipRepository::class
        );
        $this->app->bind(
            \App\Repositories\PostRepo\PostRepositoryInterface::class,
            \App\Repositories\PostRepo\PostRepository::class
        );

        // Services
        $this->app->bind(
            \App\Services\AuthServiceInterface::class,
            \App\Services\AuthService::class
        );
        $this->app->bind(
            \App\Services\UserServiceInterface::class,
            \App\Services\UserService::class
        );
        $this->app->bind(
            \App\Services\NetworkServiceInterface::class,
            \App\Services\NetworkService::class
        );
        $this->app->bind(
            \App\Services\ProfileServiceInterface::class,
            \App\Services\ProfileService::class
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

