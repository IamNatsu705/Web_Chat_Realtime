<?php

namespace Database\Seeders;

use App\Models\Conversation;
use App\Models\ConversationParticipant;
use App\Models\Message;
use App\Models\Streak;
use Carbon\Carbon;
use Database\Seeders\Traits\SeederHelper;
use Illuminate\Database\Seeder;

/**
 * Tạo streak data cho các cặp DM.
 * Tập trung tất cả test cases vào 2 acc chính (huong, khoa) để test tiện.
 *
 * ── NGHIỆP VỤ STREAK ──
 * - Ngày hợp lệ: cả 2 nhắn ≥ 1 tin (00:00 → 23:59)
 * - Hiện streak: sau 3 ngày liên tiếp hợp lệ
 * - Chia sẻ mốc: chỉ đúng ngày đạt mốc (5, 10, 15, …), trước 23:59
 * - Ngày miss + còn restore → 00:00 hôm sau: pending_restore (hạn 1 ngày, nhắn tin KHÔNG tính)
 * - Ngày miss + hết restore → 00:00 hôm sau: lost ngay
 * - Khôi phục: streak +1, nhắn thêm hôm đó cũng không +1
 *
 * ── ĐẢM BẢO ──
 * 1. Tất cả ngày tính tương đối từ now() (luôn đúng khi chạy fresh --seed)
 * 2. Messages khớp với streak fields (user_X_last_msg_date khớp message cuối cùng)
 * 3. Streak status phù hợp với gap giữa last_completed_date và today
 * 4. lost streak: tất cả counters/dates reset về 0/null (đúng loseStreak())
 *
 * ── TEST CASES (tập trung vào huong + khoa) ──
 * CASE 1: Hương ↔ Khoa  → active 15 ngày, cả 2 nhắn hôm nay (milestone, share được)
 * CASE 2: Hương ↔ Lan   → active 7 ngày, chỉ Hương nhắn hôm nay (chờ Lan nhắn)
 * CASE 3: Hương ↔ Minh  → pending_restore 20 ngày, còn 2 restore (test nút khôi phục)
 * CASE 4: Hương ↔ Mai   → lost (test chuỗi mất, bắt đầu lại)
 * CASE 5: Khoa ↔ Dũng   → pending_restore 12 ngày, HẾT restore (zombie, sẽ bị lost)
 * CASE 6: Khoa ↔ Ngọc   → active 10 ngày, cả 2 nhắn hôm nay (milestone, share được)
 * CASE 7: Khoa ↔ Linh   → active 2 ngày (chưa đủ 3 để hiện streak)
 */
class StreakSeeder extends Seeder
{
    use SeederHelper;

    /** Tin nhắn ngắn dùng cho lịch sử streak hàng ngày. */
    private array $dailyGreetings = [
        'Chào buổi sáng! ☀️',
        'Good morning! 🌅',
        'Hi! Hôm nay thế nào?',
        'Hello nha! 👋',
        'Duy trì streak nha! 🔥',
        'Streak check! 💪',
        'Ngày mới tốt lành!',
        'Hey! 😊',
        'Hôm nay có gì vui không?',
        'Nhắn tin duy trì streak nè! 🎯',
        'Check in nha! ✅',
        'Morning! ☕',
    ];

    /** Tin nhắn trả lời ngắn cho lịch sử streak. */
    private array $dailyReplies = [
        'Chào! Mình vẫn ổn nha! 😄',
        'Hello! Bận lắm nhưng nhớ streak!',
        'Hi! Mọi thứ tốt nha!',
        'Streak vẫn giữ! 🔥',
        'Hey! 👋 Cảm ơn nhé!',
        'Morning! Không quên đâu!',
        'Tiếp tục nhé! 💪',
        'Hi hi! 😊',
        'Check! Streak mãi mãi! 🎉',
        'Hello! Ngày mới vui vẻ!',
        'Oke nhé! ✅',
        'Yup! 🌙',
    ];

    public function run(): void
    {
        $this->loadUsers();

        // Dùng now() thay vì today() để tránh lỗi timezone.
        // Các sub/add sẽ tính đúng theo timezone local.
        $now = now();

        $huong  = $this->user('huong@webchat.vn');
        $khoa   = $this->user('khoa@webchat.vn');
        $lan    = $this->user('lan@webchat.vn');
        $dung   = $this->user('dung.nguyen@gmail.com');
        $ngoc   = $this->user('ngoc.vo@gmail.com');
        $mai    = $this->user('mai.hoang@gmail.com');
        $minh   = $this->user('minh.bui@gmail.com');
        $linh   = $this->user('linh.trinh@gmail.com');
        $dat    = $this->user('dat.dinh@gmail.com');
        $ha     = $this->user('ha.ngo@gmail.com');
        $huy    = $this->user('huy.tran@gmail.com');
        $chau   = $this->user('chau.cao@gmail.com');
        $long   = $this->user('long.vu@gmail.com');
        $ngan   = $this->user('ngan.ly@gmail.com');

        $streaks = [
            // ═══════════════════════════════════════════════════════════════
            // CASE 1: Hương ↔ Khoa — active 15 ngày (milestone)
            //
            // Trạng thái: Cả 2 đã nhắn hôm nay → today_completed = true
            // Test: Milestone hiển thị, nút Share hoạt động (đúng ngày đạt mốc)
            //
            // Timeline:  ... → hôm qua (cả 2 nhắn) → hôm nay (cả 2 nhắn) = ngày 15
            // last_completed = today, msg dates = today
            // restore_days = 0 (chưa đạt mốc 30)
            // ═══════════════════════════════════════════════════════════════
            // ═══════════════════════════════════════════════════════════════
            // CASE 1: Hương ↔ Khoa — active 15 ngày (milestone)
            // ═══════════════════════════════════════════════════════════════
            [
                $huong, $khoa,
                [
                    [$huong, 'Chào buổi sáng Khoa! Cố lên nha!', $now->copy()->subHours(4)],
                    [$khoa,  'Chào Hương! Bắt đầu ngày mới thôi!', $now->copy()->subHours(3)],
                    // <-- System message milestone 15 sẽ được chèn vào ngay sau tin nhắn này (khoảng -3h)
                    [$huong, 'Wow, 15 ngày liên tiếp rồi đó, kỷ lục nè!', $now->copy()->subHours(2)],
                    [$khoa,  'Tụi mình chăm chỉ thật, hướng tới mốc 30!', $now->copy()->subHours(1)],
                ],
                [
                    'current_streak'       => 15,
                    'status'               => 'active',
                    'restore_days'         => 0,
                    'last_completed_date'  => $now->copy()->startOfDay(),
                    'user_a_last_msg_date' => $now->copy()->startOfDay(),
                    'user_b_last_msg_date' => $now->copy()->startOfDay(),
                ],
            ],

            // ═══════════════════════════════════════════════════════════════
            // CASE 2: Hương ↔ Lan — active 7 ngày, chỉ Hương nhắn hôm nay
            // ═══════════════════════════════════════════════════════════════
            [
                $huong, $lan,
                [
                    [$huong, 'Lan ơi nhắn tin đi, giữ streak nha!', $now->copy()->subHours(2)],
                    [$huong, 'Đừng quên nhé, 7 ngày rồi đó!', $now->copy()->subHour()],
                ],
                [
                    'current_streak'       => 7,
                    'status'               => 'active',
                    'restore_days'         => 0,
                    'last_completed_date'  => $now->copy()->subDay()->startOfDay(),
                    'user_a_last_msg_date' => $now->copy()->startOfDay(),
                    'user_b_last_msg_date' => $now->copy()->subDay()->startOfDay(),
                ],
            ],

            // ═══════════════════════════════════════════════════════════════
            // CASE 3: Hương ↔ Minh — pending_restore 20 ngày, còn 2 restore
            // ═══════════════════════════════════════════════════════════════
            [
                $huong, $minh,
                [
                    [$huong, 'Anh Minh ơi chuỗi 20 ngày sắp mất rồi kìa!',
                        $now->copy()->subDays(2)->setHour(10)->setMinute(30)],
                    [$minh,  'Anh đi công tác mạng kém, dùng restore đi em',
                        $now->copy()->subDays(2)->setHour(14)->setMinute(15)],
                ],
                [
                    'current_streak'       => 20,
                    'status'               => 'pending_restore',
                    'restore_days'         => 2,
                    'last_completed_date'  => $now->copy()->subDays(2)->startOfDay(),
                    'user_a_last_msg_date' => $now->copy()->subDays(2)->startOfDay(),
                    'user_b_last_msg_date' => $now->copy()->subDays(2)->startOfDay(),
                ],
            ],

            // ═══════════════════════════════════════════════════════════════
            // CASE 4: Hương ↔ Mai — lost (chuỗi đã mất)
            // ═══════════════════════════════════════════════════════════════
            [
                $huong, $mai,
                [
                    [$huong, 'Mai ơi chuỗi của tụi mình mất rồi', $now->copy()->subHours(6)],
                    [$mai,   'Hôm qua mình bận quá, xin lỗi Hương nha', $now->copy()->subHours(5)],
                    [$huong, 'Thôi bắt đầu lại nhé!', $now->copy()->subHours(3)],
                    [$mai,   'Oke! Hôm nay bắt đầu lại nào', $now->copy()->subHours(2)],
                ],
                [
                    'current_streak'       => 0,
                    'status'               => 'lost',
                    'restore_days'         => 0,
                    'last_completed_date'  => null,
                    'user_a_last_msg_date' => null,
                    'user_b_last_msg_date' => null,
                ],
            ],

            // ═══════════════════════════════════════════════════════════════
            // CASE 5: Khoa ↔ Dũng — pending_restore 12 ngày, HẾT restore (zombie)
            // ═══════════════════════════════════════════════════════════════
            [
                $khoa, $dung,
                [
                    [$khoa, 'Dũng ơi sao mất mạng 2 ngày liên tiếp vậy',
                        $now->copy()->subDays(2)->setHour(9)->setMinute(0)],
                    [$dung, 'Tao đi công tác, hết restore rồi chắc mất thôi',
                        $now->copy()->subDays(2)->setHour(11)->setMinute(30)],
                ],
                [
                    'current_streak'       => 12,
                    'status'               => 'pending_restore',
                    'restore_days'         => 0,
                    'last_completed_date'  => $now->copy()->subDays(2)->startOfDay(),
                    'user_a_last_msg_date' => $now->copy()->subDays(2)->startOfDay(),
                    'user_b_last_msg_date' => $now->copy()->subDays(2)->startOfDay(),
                ],
            ],

            // ═══════════════════════════════════════════════════════════════
            // CASE 6: Khoa ↔ Ngọc — active 10 ngày (milestone)
            // ═══════════════════════════════════════════════════════════════
            [
                $khoa, $ngoc,
                [
                    [$khoa, 'Helo Ngọc, ngày mới tốt lành!', $now->copy()->subHours(4)],
                    [$ngoc, 'Chào Khoa nha!', $now->copy()->subHours(3)],
                    // <-- System message milestone 10 sẽ chèn vào đây
                    [$khoa, 'Yeah 10 ngày liên tiếp rồi kìa!', $now->copy()->subHours(2)],
                    [$ngoc, 'Chúng mình chăm chỉ thật, cứ duy trì nhé!', $now->copy()->subHours(1)],
                ],
                [
                    'current_streak'       => 10,
                    'status'               => 'active',
                    'restore_days'         => 0,
                    'last_completed_date'  => $now->copy()->startOfDay(),
                    'user_a_last_msg_date' => $now->copy()->startOfDay(),
                    'user_b_last_msg_date' => $now->copy()->startOfDay(),
                ],
            ],

            // ═══════════════════════════════════════════════════════════════
            // CASE 7: Khoa ↔ Linh — active 2 ngày (chưa đủ 3 để hiện streak)
            // ═══════════════════════════════════════════════════════════════
            [
                $khoa, $linh,
                [
                    [$khoa, 'Linh ơi mình nhắn tin thường xuyên hơn nha!', $now->copy()->subHours(5)],
                    [$linh, 'Oke anh Khoa! Cố gắng duy trì nhé!', $now->copy()->subHours(3)],
                ],
                [
                    'current_streak'       => 2,
                    'status'               => 'active',
                    'restore_days'         => 0,
                    'last_completed_date'  => $now->copy()->startOfDay(),
                    'user_a_last_msg_date' => $now->copy()->startOfDay(),
                    'user_b_last_msg_date' => $now->copy()->startOfDay(),
                ],
            ],
            // ═══════════════════════════════════════════════════════════════
            // CASE 8: Huy ↔ Châu — active 30 ngày (Nhận thưởng khôi phục)
            // ═══════════════════════════════════════════════════════════════
            [
                $huy, $chau,
                [
                    [$huy,  'Châu ơi đi cà phê không?', $now->copy()->subHours(4)],
                    [$chau, 'Oke đi luôn, quán cũ nhé!', $now->copy()->subHours(3)],
                    // <-- System message milestone 30 + reward sẽ chèn vào đây
                    [$huy,  'Wow, 30 ngày rồi đó! Nhận được khôi phục nè!', $now->copy()->subHours(2)],
                    [$chau, 'Ngon! Giờ có lỡ quên 1 ngày cũng không sao haha', $now->copy()->subHours(1)],
                ],
                [
                    'current_streak'       => 30,
                    'status'               => 'active',
                    'restore_days'         => 3,
                    'last_completed_date'  => $now->copy()->startOfDay(),
                    'user_a_last_msg_date' => $now->copy()->startOfDay(),
                    'user_b_last_msg_date' => $now->copy()->startOfDay(),
                ],
            ],

            // ═══════════════════════════════════════════════════════════════
            // CASE 9: Lan ↔ Ngọc — pending_restore 5 ngày, còn 1 restore
            // ═══════════════════════════════════════════════════════════════
            [
                $lan, $ngoc,
                [
                    [$lan,  'Ngọc ơi hôm qua bận quá quên nhắn', $now->copy()->subDays(2)->setHour(20)->setMinute(0)],
                    [$ngoc, 'Trời ơi, bấm khôi phục lẹ đi!', $now->copy()->subDays(2)->setHour(21)->setMinute(15)],
                ],
                [
                    'current_streak'       => 5,
                    'status'               => 'pending_restore',
                    'restore_days'         => 1,
                    'last_completed_date'  => $now->copy()->subDays(2)->startOfDay(),
                    'user_a_last_msg_date' => $now->copy()->subDays(2)->startOfDay(),
                    'user_b_last_msg_date' => $now->copy()->subDays(2)->startOfDay(),
                ],
            ],

            // ═══════════════════════════════════════════════════════════════
            // CASE 10: Đạt ↔ Hà — lost (Chuỗi đã mất)
            // ═══════════════════════════════════════════════════════════════
            [
                $dat, $ha,
                [
                    [$dat, 'Hà ơi mình quên mất rồi, mất streak uổng ghê', $now->copy()->subHours(6)],
                    [$ha,  'Thôi không sao, từ từ build lại nha', $now->copy()->subHours(2)],
                ],
                [
                    'current_streak'       => 0,
                    'status'               => 'lost',
                    'restore_days'         => 0,
                    'last_completed_date'  => null,
                    'user_a_last_msg_date' => null,
                    'user_b_last_msg_date' => null,
                ],
            ],

            // ═══════════════════════════════════════════════════════════════
            // CASE 11: Long ↔ Ngân — active 3 ngày
            // ═══════════════════════════════════════════════════════════════
            [
                $long, $ngan,
                [
                    [$long, 'Ngày thứ 3 rồi nè, cố lên!', $now->copy()->subHours(4)],
                    [$ngan, 'Tuyệt vời, duyệt luôn!', $now->copy()->subHours(3)],
                    [$long, 'Đủ 3 ngày rồi, thấy icon lửa chưa em?', $now->copy()->subHours(2)],
                    [$ngan, 'Dạ thấy rồi anh, nhìn cưng ghê', $now->copy()->subHours(1)],
                ],
                [
                    'current_streak'       => 3,
                    'status'               => 'active',
                    'restore_days'         => 0,
                    'last_completed_date'  => $now->copy()->startOfDay(),
                    'user_a_last_msg_date' => $now->copy()->startOfDay(),
                    'user_b_last_msg_date' => $now->copy()->startOfDay(),
                ],
            ],
        ];

        foreach ($streaks as [$userA, $userB, $msgs, $streakData]) {
            $this->createStreakDM($userA, $userB, $msgs, $streakData);
        }
    }

    /**
     * Tìm hoặc tạo DM, xử lý messages conflict, tạo streak history,
     * thêm contextual messages và gắn streak record.
     */
    private function createStreakDM($a, $b, array $contextMsgs, array $streakData): void
    {
        // ── Tìm DM hiện có (từ ConversationSeeder) ──
        // Chỉ tìm DM (is_group = false), KHÔNG match group chat
        $dmConvIds = Conversation::where('is_group', false)->pluck('id');
        $aConvIds = ConversationParticipant::where('user_id', $a->id)
            ->whereIn('conversation_id', $dmConvIds)
            ->pluck('conversation_id');
        $bConvIds = ConversationParticipant::where('user_id', $b->id)
            ->whereIn('conversation_id', $dmConvIds)
            ->pluck('conversation_id');
        $sharedId = $aConvIds->intersect($bConvIds)->first();

        if ($sharedId) {
            $conv = Conversation::find($sharedId);
        } else {
            $streakDays = $streakData['current_streak'] ?? 0;
            $conv = Conversation::create([
                'is_group'   => false,
                'created_at' => now()->subDays($streakDays + rand(5, 15)),
            ]);
            ConversationParticipant::create([
                'conversation_id' => $conv->id,
                'user_id'         => $a->id,
                'status'          => 'active',
            ]);
            ConversationParticipant::create([
                'conversation_id' => $conv->id,
                'user_id'         => $b->id,
                'status'          => 'active',
            ]);
        }

        // ── Xử lý messages conflict từ ConversationSeeder ──
        // Đẩy lùi toàn bộ messages cũ về trước khi streak bắt đầu
        $this->fixConflictingMessages($conv, $streakData);

        // ── Tạo streak history messages (mô phỏng nhắn tin hàng ngày) ──
        $this->generateStreakHistory($conv, $a, $b, $streakData);

        // ── Thêm contextual messages (tin nhắn nội dung chính) ──
        foreach ($contextMsgs as $m) {
            Message::create([
                'conversation_id' => $conv->id,
                'sender_id'       => $m[0]->id,
                'content'         => $m[1],
                'type'            => 'text',
                'created_at'      => $m[2],
                'updated_at'      => $m[2],
            ]);
        }

        // ── Tạo system messages (thông báo streak) ──
        // Giống hệt format của sendSystemMessage() trong StreakService
        $this->generateStreakSystemMessages($conv, $streakData);

        // ── Gắn streak record ──
        if (!Streak::where('conversation_id', $conv->id)->exists()) {
            Streak::create(array_merge([
                'conversation_id' => $conv->id,
                'user_a_id'       => min($a->id, $b->id),
                'user_b_id'       => max($a->id, $b->id),
            ], $streakData));
        }
    }

    /**
     * Tạo system messages phù hợp với trạng thái streak hiện tại.
     *
     * Đảm bảo:
     * - Format giống hệt sendSystemMessage() (text|||json cho metadata)
     * - Timestamp logic: milestone vào ngày last_completed, warning vào 00:00 hôm nay, lost vào 00:00 hôm nay
     * - Chỉ tạo messages phù hợp với trạng thái (không tạo warning cho active, không tạo milestone cho lost, ...)
     */
    private function generateStreakSystemMessages(Conversation $conv, array $streakData): void
    {
        $streak = $streakData['current_streak'];
        $status = $streakData['status'];
        $lastCompleted = $streakData['last_completed_date'];

        // ── Milestone notifications cho active streak ──
        if ($status === 'active' && $streak >= 5) {
            $milestones = [5, 10, 15, 30, 50, 100];

            foreach ($milestones as $m) {
                if ($m > $streak) break;

                $milestoneDaysAgo = $streak - $m;
                $milestoneDate = $lastCompleted->copy()->subDays($milestoneDaysAgo);
                
                // Tránh lỗi timezone: Nếu UTC setHour(18-21) -> VN sẽ là 01:00-04:00 hôm sau
                if ($milestoneDaysAgo === 0) {
                    $milestoneTime = now()->subHours(3)->addSeconds(rand(5, 15)); // Đặt ngay sau tin nhắn thứ 2 của ngày
                } else {
                    $milestoneTime = $milestoneDate->copy()->setHour(rand(10, 14))->setMinute(rand(0, 59)); // 10-14 UTC = 17-21 VN
                }

                $tier = 'streak_5';
                if ($m >= 100) $tier = 'streak_100';
                elseif ($m >= 50) $tier = 'streak_50';
                elseif ($m >= 30) $tier = 'streak_30';
                elseif ($m >= 15) $tier = 'streak_15';
                elseif ($m >= 10) $tier = 'streak_10';

                $metadata = json_encode(['milestone' => $m, 'tier' => $tier]);
                $content = "Đạt chuỗi {$m} ngày liên tiếp!|||{$metadata}";

                Message::create([
                    'conversation_id' => $conv->id,
                    'sender_id'       => null,
                    'content'         => $content,
                    'type'            => 'system',
                    'created_at'      => $milestoneTime,
                    'updated_at'      => $milestoneTime,
                ]);

                if ($m % 30 === 0) {
                    $rewardTime = $milestoneTime->copy()->subMinutes(1);
                    Message::create([
                        'conversation_id' => $conv->id,
                        'sender_id'       => null,
                        'content'         => "Thưởng 3 lượt khôi phục (Mốc {$m} ngày).",
                        'type'            => 'system',
                        'created_at'      => $rewardTime,
                        'updated_at'      => $rewardTime,
                    ]);
                }
            }
        }

        // ── Warning notification cho pending_restore ──
        if ($status === 'pending_restore') {
            $restoreDays = $streakData['restore_days'];

            if ($streak >= 5) {
                $milestones = [5, 10, 15, 30, 50, 100];
                foreach ($milestones as $m) {
                    if ($m > $streak) break;

                    $milestoneDaysAgo = $streak - $m;
                    $milestoneDate = $lastCompleted->copy()->subDays($milestoneDaysAgo);
                    $milestoneTime = $milestoneDate->copy()->setHour(rand(10, 14))->setMinute(rand(0, 59));

                    $tier = 'streak_5';
                    if ($m >= 100) $tier = 'streak_100';
                    elseif ($m >= 50) $tier = 'streak_50';
                    elseif ($m >= 30) $tier = 'streak_30';
                    elseif ($m >= 15) $tier = 'streak_15';
                    elseif ($m >= 10) $tier = 'streak_10';

                    $metadata = json_encode(['milestone' => $m, 'tier' => $tier]);

                    Message::create([
                        'conversation_id' => $conv->id,
                        'sender_id'       => null,
                        'content'         => "Đạt chuỗi {$m} ngày liên tiếp!|||{$metadata}",
                        'type'            => 'system',
                        'created_at'      => $milestoneTime,
                        'updated_at'      => $milestoneTime,
                    ]);

                    if ($m % 30 === 0) {
                        $rewardTime = $milestoneTime->copy()->subMinutes(1);
                        Message::create([
                            'conversation_id' => $conv->id,
                            'sender_id'       => null,
                            'content'         => "Thưởng 3 lượt khôi phục (Mốc {$m} ngày).",
                            'type'            => 'system',
                            'created_at'      => $rewardTime,
                            'updated_at'      => $rewardTime,
                        ]);
                    }
                }
            }

            // Warning cron chạy vào 00:00 VN -> 17:00 UTC hôm trước
            $warningTime = now()->startOfDay()->subHours(7)->addMinutes(rand(1, 10));
            $warningMeta = json_encode(['restore_days' => $restoreDays]);
            $warningContent = $restoreDays > 0
                ? "Chuỗi {$streak} ngày đang gặp nguy hiểm! Cần khôi phục.|||{$warningMeta}"
                : "Chuỗi {$streak} ngày đang gặp nguy hiểm! (Hết lượt khôi phục).|||{$warningMeta}";

            Message::create([
                'conversation_id' => $conv->id,
                'sender_id'       => null,
                'content'         => $warningContent,
                'type'            => 'system',
                'created_at'      => $warningTime,
                'updated_at'      => $warningTime,
            ]);
        }

        // ── Lost notification ──
        if ($status === 'lost') {
            $lostTime = now()->startOfDay()->subHours(7)->addMinutes(rand(1, 10));
            Message::create([
                'conversation_id' => $conv->id,
                'sender_id'       => null,
                'content'         => 'Đã mất chuỗi. Nhắn tin để bắt đầu lại.',
                'type'            => 'system',
                'created_at'      => $lostTime,
                'updated_at'      => $lostTime,
            ]);
        }
    }

    /**
     * Đồng bộ Chat và Streak: 
     * Đẩy TẤT CẢ tin nhắn được tạo ngẫu nhiên từ ConversationSeeder
     * về thời điểm TRƯỚC KHI chuỗi streak này bắt đầu.
     * Đảm bảo trong suốt thời gian streak, chỉ có tin nhắn của StreakSeeder.
     */
    private function fixConflictingMessages(Conversation $conv, array $streakData): void
    {
        $streak = $streakData['current_streak'] ?? 0;
        
        // Nếu chuỗi đã lost (last_completed = null), lấy mốc là 3 ngày trước để lùi
        $lastCompleted = $streakData['last_completed_date'] ? $streakData['last_completed_date']->copy() : now()->subDays(3);
        
        // Ngày bắt đầu chuỗi streak
        $streakStartDate = $lastCompleted->copy()->subDays($streak);
        
        $oldMessages = Message::where('conversation_id', $conv->id)->get();
        
        foreach ($oldMessages as $msg) {
            // Đẩy lùi về trước khi streak bắt đầu 5-20 ngày
            // Tránh dùng setHour trên UTC dễ qua ngày, dùng setTimezone hoặc giờ an toàn (1-14)
            $newTime = $streakStartDate->copy()
                ->subDays(rand(2, 10))
                ->setHour(rand(1, 14)) // 1-14 UTC = 8:00 - 21:00 VN
                ->setMinute(rand(0, 59));
                
            $msg->update([
                'created_at' => $newTime,
                'updated_at' => $newTime,
            ]);
        }
    }

    /**
     * Tạo messages lịch sử nhắn tin hàng ngày để mô phỏng streak.
     *
     * Cho mỗi ngày gần đây trong chuỗi streak, tạo 1 message từ mỗi user.
     * Số ngày tạo = min(streak_count, 5) để không quá nhiều records.
     */
    private function generateStreakHistory(Conversation $conv, $a, $b, array $streakData): void
    {
        $streak = $streakData['current_streak'];
        if ($streak <= 1) {
            return; // streak 0-1 không cần history
        }

        $lastCompleted = $streakData['last_completed_date'];
        if (!$lastCompleted) {
            return; // lost streak với last_completed = null, không tạo history
        }

        $daysToGenerate = min($streak - 1, 5); // Trừ 1 vì contextual msgs đã cover ngày cuối

        for ($i = 1; $i <= $daysToGenerate; $i++) {
            $date = $lastCompleted->copy()->subDays($i);

            // UTC Timezone. 1-5 UTC = 8-12 VN (Sáng)
            $timeA = $date->copy()->setHour(rand(1, 5))->setMinute(rand(0, 59));
            // UTC Timezone. 7-14 UTC = 14-21 VN (Chiều tối)
            $timeB = $date->copy()->setHour(rand(7, 14))->setMinute(rand(0, 59));

            Message::create([
                'conversation_id' => $conv->id,
                'sender_id'       => $a->id,
                'content'         => $this->dailyGreetings[array_rand($this->dailyGreetings)],
                'type'            => 'text',
                'created_at'      => $timeA,
                'updated_at'      => $timeA,
            ]);

            Message::create([
                'conversation_id' => $conv->id,
                'sender_id'       => $b->id,
                'content'         => $this->dailyReplies[array_rand($this->dailyReplies)],
                'type'            => 'text',
                'created_at'      => $timeB,
                'updated_at'      => $timeB,
            ]);
        }
    }
}
