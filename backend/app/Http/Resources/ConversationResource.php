<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ConversationResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'avatar' => $this->avatar,
            'is_group' => $this->is_group,
            'admin_id' => $this->admin_id,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            
            'participants' => UserResource::collection($this->whenLoaded('participants', function() {
                // Filter out null users (deleted accounts) to prevent FE crash
                return $this->participants->map->user->filter();
            })),
            'my_status' => $this->whenLoaded('participants', function() use ($request) {
                $participant = $this->participants->firstWhere('user_id', $request->user()->id);
                return $participant ? $participant->status : 'active';
            }),
            'last_message' => $this->whenLoaded('lastMessage', function () use ($request) {
                if (!$this->lastMessage) return null;
                $participant = $this->participants->firstWhere('user_id', $request->user()->id);
                $clearedAt = $participant ? $participant->cleared_at : null;
                // If the message is older than when the user cleared the chat, hide it
                if ($clearedAt && $this->lastMessage->created_at < $clearedAt) {
                    return null;
                }
                return new MessageResource($this->lastMessage);
            }),
            // Use pre-computed value from Repository (no N+1 query)
            // Falls back to 0 if attribute not available (e.g. single conversation fetch)
            'unread_count' => $this->preloaded_unread_count ?? 0,

            // Streak data for 1-1 chats (only included when streak >= 3)
            'streak' => $this->whenLoaded('streak', function () {
                if (!$this->streak || $this->streak->current_streak < 3) {
                    return null;
                }
                return [
                    'current_streak' => $this->streak->current_streak,
                    'status' => $this->streak->status,
                    'restore_days' => $this->streak->restore_days,
                    'tier' => $this->streak->getMilestoneTier(),
                    'is_milestone' => $this->streak->isMilestone(),
                    // Whether both users have completed the streak today (last_completed_date = today)
                    'today_completed' => $this->streak->last_completed_date
                        && $this->streak->last_completed_date->isToday(),
                ];
            }),
        ];
    }
}
