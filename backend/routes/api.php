<?php

use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\Network\NetworkController;
use App\Http\Controllers\Api\Profile\ProfileController;
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

            // Friend Request actions
            Route::prefix('request')->group(function () {
                Route::post('/send',                    [NetworkController::class, 'sendRequest']);
                Route::delete('/cancel/{userId}',       [NetworkController::class, 'cancelFriendRequest']);
                Route::post('/{requestId}/respond',     [NetworkController::class, 'respondToRequest']);
            });

            // Friendship
            Route::delete('/friend/{userId}', [NetworkController::class, 'unfriend']);
        });
    });
});

