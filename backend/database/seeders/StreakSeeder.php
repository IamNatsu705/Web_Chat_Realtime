<?php

namespace Database\Seeders;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\Streak;
use App\Models\User;
use Illuminate\Database\Seeder;

class StreakSeeder extends Seeder
{
    public function run(): void
    {
        $an    = User::where('email', 'an@ptit.edu.vn')->first();
        $binh  = User::where('email', 'binh@ptit.edu.vn')->first();
        $cuong = User::where('email', 'cuong@ptit.edu.vn')->first();
        $duy   = User::where('email', 'duy@ptit.edu.vn')->first();

        // ═══════════════════════════════════════════════════════════════════
        //  Streak 1: An & Bình — 15 ngày (milestone!) — active
        //  Demo: widget streak đẹp, milestone badge, nút chia sẻ
        // ═══════════════════════════════════════════════════════════════════
        $dm1 = $this->getDM($an, $binh);
        if ($dm1) {
            $userAId = min($an->id, $binh->id);
            $userBId = max($an->id, $binh->id);

            Streak::create([
                'conversation_id'      => $dm1->id,
                'user_a_id'            => $userAId,
                'user_b_id'            => $userBId,
                'current_streak'       => 15,
                'last_completed_date'  => today(),
                'user_a_last_msg_date' => today(),
                'user_b_last_msg_date' => today(),
                'restore_days'         => 2,
                'status'               => 'active',
                'created_at'           => now()->subDays(15),
                'updated_at'           => now(),
            ]);

            // System messages cho các mốc đã đạt
            $this->streakSystemMsg($dm1->id, '🔥 Đạt chuỗi 5 ngày liên tiếp!', now()->subDays(10));
            $this->streakSystemMsg($dm1->id, '🔥 Đạt chuỗi 10 ngày liên tiếp!', now()->subDays(5));
            $this->streakSystemMsg($dm1->id, '🔥 Đạt chuỗi 15 ngày liên tiếp!', now()->subHours(2));
        }

        // ═══════════════════════════════════════════════════════════════════
        //  Streak 2: An & Cường — 8 ngày — active
        //  Demo: streak đang tiến tới mốc 10, user_a đã nhắn hôm nay
        // ═══════════════════════════════════════════════════════════════════
        $dm2 = $this->getDM($an, $cuong);
        if ($dm2) {
            $userAId = min($an->id, $cuong->id);
            $userBId = max($an->id, $cuong->id);

            Streak::create([
                'conversation_id'      => $dm2->id,
                'user_a_id'            => $userAId,
                'user_b_id'            => $userBId,
                'current_streak'       => 8,
                'last_completed_date'  => today()->subDay(),
                'user_a_last_msg_date' => today(),     // An đã nhắn hôm nay
                'user_b_last_msg_date' => null,         // Cường chưa nhắn → UI hiện chờ
                'restore_days'         => 0,
                'status'               => 'active',
                'created_at'           => now()->subDays(8),
                'updated_at'           => now(),
            ]);

            $this->streakSystemMsg($dm2->id, '🔥 Đạt chuỗi 5 ngày liên tiếp!', now()->subDays(3));
        }

        // ═══════════════════════════════════════════════════════════════════
        //  Streak 3: Bình & Duy — pending_restore
        //  Demo: trạng thái cảnh báo, nút khôi phục, cửa sổ 1 ngày
        // ═══════════════════════════════════════════════════════════════════
        $dm3 = $this->getDM($binh, $duy);
        if ($dm3) {
            $userAId = min($binh->id, $duy->id);
            $userBId = max($binh->id, $duy->id);

            Streak::create([
                'conversation_id'      => $dm3->id,
                'user_a_id'            => $userAId,
                'user_b_id'            => $userBId,
                'current_streak'       => 12,
                'last_completed_date'  => today()->subDays(2), // Lỡ hôm qua
                'user_a_last_msg_date' => null,
                'user_b_last_msg_date' => null,
                'restore_days'         => 1,  // Còn 1 lượt khôi phục
                'status'               => 'pending_restore',
                'created_at'           => now()->subDays(14),
                'updated_at'           => now(),
            ]);

            // Cảnh báo streak
            $this->streakSystemMsg(
                $dm3->id,
                'Chuỗi 12 ngày đang gặp nguy hiểm! Hãy dùng quyền khôi phục để giữ chuỗi. (Còn 1 lần, hạn hôm nay)|||{"restore_days":1}',
                now()->subHours(1),
                'streak_warning'
            );
        }
    }

    /**
     * Lấy DM conversation giữa 2 user.
     */
    private function getDM(User $a, User $b): ?Conversation
    {
        return Conversation::where('is_group', false)
            ->whereHas('participants', fn ($q) => $q->where('user_id', $a->id))
            ->whereHas('participants', fn ($q) => $q->where('user_id', $b->id))
            ->first();
    }

    /**
     * Tạo system message cho streak milestone / warning.
     */
    private function streakSystemMsg(int $conversationId, string $content, $time, string $type = 'system'): void
    {
        Message::create([
            'conversation_id' => $conversationId,
            'sender_id'       => null,
            'content'         => $content,
            'type'            => $type,
            'created_at'      => $time,
            'updated_at'      => $time,
        ]);
    }
}
