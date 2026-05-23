<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $isAuthUser = $request->user() && $request->user()->id === $this->id;
        $isAdmin = $request->user() && $request->user()->isAdmin();
        $isLoginOrRegister = $request->is('api/*/auth/login') || $request->is('api/*/auth/register');
        $shouldShowPrivate = $isAuthUser || $isAdmin || $isLoginOrRegister;

        return [
            'id' => $this->id,
            'name' => $this->name,
            'avatar' => $this->avatar,
            'last_seen_at' => $this->last_seen_at,

            'relationship_status' => $this->relationship_status ?? 'none',
            'friend_request_id' => $this->friend_request_id,
            'is_sender' => (bool) $this->is_sender,
            // Mutual friends count (only present in suggestions response)
            'mutual_friends_count' => $this->when(isset($this->mutual_friends_count), $this->mutual_friends_count ?? 0),
            // Private
            'email' => $this->when($shouldShowPrivate, $this->email),
            'role' => $this->when($shouldShowPrivate, $this->role),
            'created_at' => $this->when($shouldShowPrivate, $this->created_at),
            'updated_at' => $this->when($shouldShowPrivate, $this->updated_at),
            // Admin-only fields
            'is_banned' => $this->when($isAdmin, $this->is_banned),
            'banned_at' => $this->when($isAdmin, $this->banned_at),
            'ban_reason' => $this->when($isAdmin, $this->ban_reason),
        ];
    }
}
