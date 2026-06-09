<?php

namespace App\Services\Chat;

use App\Events\Chat\MessageSent;
use App\Events\Chat\StreakUpdated;
use App\Models\Streak;
use App\Repositories\ConversationRepo\ConversationRepositoryInterface;
use App\Repositories\ConversationParticipantRepo\ConversationParticipantRepositoryInterface;
use App\Repositories\MessageRepo\MessageRepositoryInterface;
use App\Repositories\PostRepo\PostRepositoryInterface;
use App\Repositories\StreakRepo\StreakRepositoryInterface;
use App\Repositories\UserRepo\UserRepositoryInterface;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\DB;

/**
 * Service xử lý toàn bộ nghiệp vụ liên quan đến chuỗi nhắn tin liên tiếp (Streak).
 *
 * Streak là tính năng đếm số ngày liên tiếp mà CẢ HAI người dùng trong cuộc trò chuyện 1-1
 * đều gửi ít nhất 1 tin nhắn. Nếu một trong hai người không nhắn trong ngày, chuỗi sẽ bị đe dọa
 * hoặc mất hoàn toàn.
 *
 * Các trạng thái của Streak:
 *   - 'active'          : Chuỗi đang hoạt động bình thường.
 *   - 'pending_restore' : Chuỗi bị lỡ nhưng còn lượt khôi phục, chờ người dùng xác nhận.
 *   - 'lost'            : Chuỗi đã mất, reset về 0.
 */
class StreakService implements StreakServiceInterface
{
    public function __construct(
        protected StreakRepositoryInterface $streakRepository,
        protected ConversationRepositoryInterface $conversationRepository,
        protected ConversationParticipantRepositoryInterface $participantRepository,
        protected MessageRepositoryInterface $messageRepository,
        protected PostRepositoryInterface $postRepository,
        protected UserRepositoryInterface $userRepository,
    ) {}

    // =====================================================================
    //  XỬ LÝ KHI CÓ TIN NHẮN MỚI
    // =====================================================================

    /**
     * Xử lý cập nhật streak khi một tin nhắn được gửi trong cuộc trò chuyện 1-1.
     *
     * Luồng xử lý chính:
     *   1. Bỏ qua nếu là group chat hoặc không đủ 2 người.
     *   2. Nếu đang ở trạng thái 'pending_restore' => bỏ qua (bắt buộc dùng nút khôi phục).
     *   3. Nếu cron chưa kịp chạy mà đã lỡ >= 2 ngày => tự xử lý thay cron.
     *   4. Ghi nhận ngày nhắn tin của người gửi.
     *   5. Nếu cả 2 đều đã nhắn hôm nay => tính streak và kiểm tra phần thưởng.
     *
     * Sử dụng SELECT FOR UPDATE để tránh race condition khi 2 người nhắn cùng lúc.
     *
     * @param int $conversationId ID cuộc trò chuyện
     * @param int $senderId       ID người gửi tin nhắn
     * @return void
     */
    public function handleMessageSent(int $conversationId, int $senderId): void
    {
        $conversation = $this->conversationRepository->findOrFail($conversationId);

        // Streak chỉ áp dụng cho chat 1-1
        if ($conversation->is_group) {
            return;
        }

        $participants = $this->participantRepository->getParticipantIds($conversationId);

        // Phải có đúng 2 người tham gia
        if (count($participants) !== 2) {
            return;
        }

        // Tạo bản ghi streak nếu chưa tồn tại (trước khi vào transaction có lock)
        $this->streakRepository->getOrCreate($conversationId, $participants[0], $participants[1]);

        DB::transaction(function () use ($conversationId, $senderId, $participants) {
            // Lock bản ghi streak để tránh 2 request cập nhật đồng thời
            $streak = Streak::where('conversation_id', $conversationId)
                ->lockForUpdate()
                ->firstOrFail();

            // BƯỚC 1: Kiểm tra trạng thái pending_restore
            // Khi đang chờ khôi phục, mọi tin nhắn đều bị bỏ qua.
            // Mục đích: buộc người dùng phải chủ động bấm nút khôi phục, không cho "lách" bằng cách nhắn tin.
            if ($streak->status === 'pending_restore') {
                return;
            }

            $today = Carbon::today();
            $side = $streak->getUserSide($senderId); // 'a' hoặc 'b'

            if (!$side) {
                return;
            }

            // BƯỚC 2: Xử lý thay cron nếu cron chưa kịp chạy
            // Trường hợp: trạng thái vẫn là 'active' nhưng đã lỡ >= 2 ngày (cron bị trễ hoặc lỗi).
            // => Xử lý ngay tại đây để đảm bảo dữ liệu luôn nhất quán.
            $lastCompletedForGapCheck = $streak->last_completed_date
                ? Carbon::parse($streak->last_completed_date)
                : null;

            if (
                $streak->status === 'active'
                && $lastCompletedForGapCheck
                && (int) $lastCompletedForGapCheck->diffInDays($today, false) >= 2
                && $streak->current_streak > 0
            ) {
                $gap = (int) $lastCompletedForGapCheck->diffInDays($today, false);

                // gap == 2: Hôm nay là ngày ngay sau ngày bị miss => cửa sổ khôi phục 1 ngày
                if ($gap === 2 && $streak->restore_days > 0) {
                    $this->streakRepository->update($streak->id, ['status' => 'pending_restore']);
                    $streak->refresh();

                    $this->sendSystemMessage(
                        $conversationId,
                        "Chuỗi {$streak->current_streak} ngày đang gặp nguy hiểm! Hãy dùng quyền khôi phục để giữ chuỗi. (Còn {$streak->restore_days} lần, hạn hôm nay)",
                        'streak_warning',
                        ['restore_days' => $streak->restore_days]
                    );

                    broadcast(new StreakUpdated($streak, $participants));
                } else {
                    // gap >= 3 hoặc hết lượt => cửa sổ khôi phục đã qua, mất chuỗi
                    $this->loseStreak($streak, $participants);
                }
                return;
            }

            // BƯỚC 3: Ghi nhận ngày nhắn tin
            $senderField = "user_{$side}_last_msg_date";
            $otherField = $side === 'a' ? 'user_b_last_msg_date' : 'user_a_last_msg_date';

            $senderAlreadyToday = $streak->$senderField && Carbon::parse($streak->$senderField)->isSameDay($today);
            $alreadyCompletedToday = $streak->last_completed_date
                && Carbon::parse($streak->last_completed_date)->isSameDay($today);

            // Nếu người gửi đã nhắn hôm nay VÀ streak đã được tính hôm nay => không cần làm gì thêm
            if ($senderAlreadyToday && $alreadyCompletedToday) {
                return;
            }

            // Chỉ cập nhật ngày nhắn nếu người gửi chưa nhắn hôm nay
            $updateData = $senderAlreadyToday ? [] : [$senderField => $today];

            // BƯỚC 4: Kiểm tra xem cả 2 đã nhắn hôm nay chưa
            $otherMessagedToday = $streak->$otherField
                && Carbon::parse($streak->$otherField)->isSameDay($today);

            if ($otherMessagedToday) {
                // Cả 2 đều đã nhắn hôm nay => tính streak
                $lastCompleted = $streak->last_completed_date
                    ? Carbon::parse($streak->last_completed_date)
                    : null;

                // Nếu streak đã được tính hôm nay rồi => chỉ cập nhật ngày nhắn
                if ($lastCompleted && $lastCompleted->isSameDay($today)) {
                    $this->streakRepository->update($streak->id, $updateData);
                    return;
                }

                // Tính số ngày streak mới
                $newStreak = $this->calculateNewStreak($streak, $lastCompleted, $today);

                $updateData['current_streak'] = $newStreak;
                $updateData['last_completed_date'] = $today;
                $updateData['status'] = 'active';

                $this->streakRepository->update($streak->id, $updateData);
                $streak->refresh();

                // BƯỚC 5: Kiểm tra phần thưởng và cột mốc
                $this->checkRewardsAndMilestones($streak, $conversationId);

                broadcast(new StreakUpdated($streak, $participants));
            } else {
                // Mới chỉ có 1 người nhắn => lưu lại và chờ người còn lại
                $this->streakRepository->update($streak->id, $updateData);
            }
        });
    }

    // =====================================================================
    //  TÍNH TOÁN STREAK
    // =====================================================================

    /**
     * Xác định giá trị streak mới khi cả 2 người đã nhắn tin trong ngày.
     *
     * Quy tắc:
     *   - Nếu ngày hoàn thành gần nhất là hôm qua -> cộng thêm 1 (tiếp nối chuỗi).
     *   - Mọi trường hợp khác -> bắt đầu lại từ 1 (chuỗi mới).
     *
     * Hàm này không cần xử lý trạng thái 'pending_restore' vì handleMessageSent()
     * đã return sớm trước khi gọi tới đây.
     *
     * @param Streak      $streak       Bản ghi streak hiện tại
     * @param Carbon|null $lastCompleted Ngày hoàn thành gần nhất (null nếu chưa có)
     * @param Carbon      $today         Ngày hôm nay
     * @return int Giá trị streak mới
     */
    private function calculateNewStreak(Streak $streak, ?Carbon $lastCompleted, Carbon $today): int
    {
        $yesterday = Carbon::yesterday();

        if ($lastCompleted && $lastCompleted->isSameDay($yesterday)) {
            return $streak->current_streak + 1;
        }

        return 1;
    }

    /**
     * Kiểm tra và trao phần thưởng / thông báo cột mốc sau khi streak được cập nhật.
     *
     * - Mỗi 30 ngày: thưởng 3 lượt khôi phục.
     * - Các mốc 5, 10, 15, 30, 50, 100: gửi tin nhắn chúc mừng.
     *
     * @param Streak $streak         Bản ghi streak (đã refresh)
     * @param int    $conversationId ID cuộc trò chuyện
     * @return void
     */
    private function checkRewardsAndMilestones(Streak $streak, int $conversationId): void
    {
        // Thưởng 3 lượt khôi phục mỗi 30 ngày
        if ($streak->current_streak > 0 && $streak->current_streak % 30 === 0) {
            $this->streakRepository->update($streak->id, ['restore_days' => 3]);
            $streak->refresh();

            $this->sendSystemMessage(
                $conversationId,
                "Thưởng 3 lượt khôi phục (Mốc {$streak->current_streak} ngày).",
                'streak_reward'
            );
        }

        // Thông báo cột mốc quan trọng
        if ($streak->isMilestone()) {
            $this->sendSystemMessage(
                $conversationId,
                "Đạt chuỗi {$streak->current_streak} ngày liên tiếp!",
                'streak_milestone',
                ['milestone' => $streak->current_streak, 'tier' => $streak->getMilestoneTier()]
            );
        }
    }

    // =====================================================================
    //  KHÔI PHỤC CHUỖI
    // =====================================================================

    /**
     * Khôi phục chuỗi khi người dùng bấm nút "Khôi phục".
     *
     * Chỉ áp dụng khi streak đang ở trạng thái 'pending_restore' và còn lượt khôi phục.
     *
     * Cách hoạt động:
     *   - Streak +1 (bỏ qua ngày bị lỡ, coi như vẫn liên tiếp).
     *   - Trừ 1 lượt khôi phục.
     *   - Đặt last_completed_date = hôm nay => nhắn tin thêm trong ngày cũng KHÔNG tăng streak.
     *   - Reset ngày nhắn tin của cả 2 => ngày mai bắt đầu chu kỳ mới.
     *
     * @param int $conversationId ID cuộc trò chuyện
     * @param int $userId         ID người dùng thực hiện khôi phục
     * @return array Thông tin streak sau khi khôi phục
     *
     * @throws Exception Nếu streak không tồn tại, không ở trạng thái pending_restore,
     *                   hết lượt khôi phục, hoặc người dùng không thuộc cuộc trò chuyện.
     */
    public function restoreStreak(int $conversationId, int $userId): array
    {
        $streak = $this->streakRepository->getByConversationId($conversationId);

        if (!$streak) {
            throw new Exception('Không tìm thấy dữ liệu chuỗi.');
        }

        if ($streak->status !== 'pending_restore') {
            throw new Exception('Chuỗi không đang ở trạng thái cần khôi phục.');
        }

        if ($streak->restore_days <= 0) {
            throw new Exception('Bạn đã hết quyền khôi phục chuỗi.');
        }

        // Kiểm tra còn trong cửa sổ khôi phục không (chỉ được dùng trong ngày ngay sau ngày miss)
        // daysSince >= 3 nghĩa là đã qua ngày khôi phục => từ chối
        if ($streak->last_completed_date) {
            $daysSince = (int) Carbon::parse($streak->last_completed_date)->diffInDays(Carbon::today(), false);
            if ($daysSince >= 3) {
                // Quá hạn => mất chuỗi luôn (cron chưa kịp dọn)
                $participants = $this->participantRepository->getParticipantIds($conversationId);
                $this->loseStreak($streak, $participants);
                throw new Exception('Đã quá hạn khôi phục chuỗi.');
            }
        }

        $side = $streak->getUserSide($userId);
        if (!$side) {
            throw new Exception('Bạn không thuộc cuộc trò chuyện này.');
        }

        $newStreak = $streak->current_streak + 1;

        // Cập nhật streak: +1, trừ lượt, reset ngày nhắn, đánh dấu hoàn thành hôm nay
        $this->streakRepository->update($streak->id, [
            'current_streak'       => $newStreak,
            'restore_days'         => $streak->restore_days - 1,
            'last_completed_date'  => Carbon::today(),
            'status'               => 'active',
            'user_a_last_msg_date' => null, // Reset để ngày mai bắt đầu chu kỳ đếm mới
            'user_b_last_msg_date' => null,
        ]);

        $streak->refresh();

        $user = $this->userRepository->findOrFail($userId);
        $participants = $this->participantRepository->getParticipantIds($conversationId);

        $this->sendSystemMessage(
            $conversationId,
            "{$user->name} đã khôi phục chuỗi (Còn {$streak->restore_days} lần)."
        );

        // Kiểm tra phần thưởng và cột mốc (trường hợp khôi phục đưa streak lên đúng mốc)
        $this->checkRewardsAndMilestones($streak, $conversationId);

        broadcast(new StreakUpdated($streak, $participants));

        return [
            'current_streak' => $streak->current_streak,
            'restore_days'   => $streak->restore_days,
            'status'         => $streak->status,
        ];
    }

    // =====================================================================
    //  CHIA SẺ THÀNH TÍCH
    // =====================================================================

    /**
     * Chia sẻ thành tích streak lên tường cá nhân dưới dạng bài đăng.
     *
     * Điều kiện:
     *   - Streak phải đạt ít nhất 5 ngày và đang ở một cột mốc (5, 10, 15, 30, 50, 100).
     *   - Chỉ được chia sẻ trong ngày đạt mốc (trước 23:59).
     *
     * @param int $conversationId ID cuộc trò chuyện
     * @param int $userId         ID người dùng chia sẻ
     * @return array Thông tin bài đăng đã tạo
     *
     * @throws Exception Nếu chưa đạt mốc, hết hạn chia sẻ, hoặc không thuộc cuộc trò chuyện.
     */
    public function shareStreak(int $conversationId, int $userId): array
    {
        $streak = $this->streakRepository->getByConversationId($conversationId);

        if (!$streak || $streak->current_streak < 5) {
            throw new Exception('Chuỗi chưa đạt mốc để chia sẻ.');
        }

        if (!$streak->isMilestone()) {
            throw new Exception('Chuỗi chưa đạt mốc để chia sẻ.');
        }

        // Chỉ cho phép chia sẻ trong ngày đạt mốc, qua ngày hôm sau sẽ hết hạn
        if (!$streak->last_completed_date || !$streak->last_completed_date->isToday()) {
            throw new Exception('Chỉ có thể chia sẻ trong ngày đạt mốc.');
        }

        $side = $streak->getUserSide($userId);
        if (!$side) {
            throw new Exception('Bạn không thuộc cuộc trò chuyện này.');
        }

        $otherUserId = $streak->getOtherUserId($userId);
        $otherUser = $this->userRepository->findOrFail($otherUserId);
        $tier = $streak->getMilestoneTier();

        // Tạo bài đăng kèm hình ảnh badge tương ứng với hạng
        $post = $this->postRepository->create([
            'user_id' => $userId,
            'content' => "🔥 Tôi và {$otherUser->name} đã đạt chuỗi {$streak->current_streak} ngày nhắn tin liên tiếp!",
        ]);

        $post->media()->create([
            'media_url' => "streaks/{$tier}.png",
            'media_type' => 'image',
            'sort_order' => 0,
        ]);

        $post->load(['user', 'media']);

        return [
            'post_id' => $post->id,
            'message' => 'Đã chia sẻ chuỗi lên tường thành công!',
        ];
    }

    // =====================================================================
    //  TRUY VẤN THÔNG TIN STREAK
    // =====================================================================

    /**
     * Lấy thông tin streak của một cuộc trò chuyện để hiển thị trên giao diện.
     *
     * Trả về: số ngày hiện tại, trạng thái, lượt khôi phục còn lại,
     * cột mốc tiếp theo, và trạng thái nhắn tin hôm nay của cả 2 người.
     *
     * @param int      $conversationId ID cuộc trò chuyện
     * @param int|null $userId         ID người dùng (để xác định ai là user, ai là partner)
     * @return array|null Null nếu chưa có streak
     */
    public function getStreakForConversation(int $conversationId, ?int $userId = null): ?array
    {
        $streak = $this->streakRepository->getByConversationId($conversationId);

        if (!$streak) {
            return null;
        }

        $today = Carbon::today();
        $milestones = [5, 10, 15, 30, 50, 100];
        $current = $streak->current_streak;

        // Tìm cột mốc tiếp theo
        $nextMilestone = null;
        foreach ($milestones as $m) {
            if ($current < $m) {
                $nextMilestone = $m;
                break;
            }
        }

        // Xác định trạng thái nhắn tin hôm nay của user và đối tác
        $userMessagedToday = false;
        $partnerMessagedToday = false;

        if ($userId) {
            $side = $streak->getUserSide($userId);
            if ($side === 'a') {
                $userMessagedToday = $streak->user_a_last_msg_date && Carbon::parse($streak->user_a_last_msg_date)->isSameDay($today);
                $partnerMessagedToday = $streak->user_b_last_msg_date && Carbon::parse($streak->user_b_last_msg_date)->isSameDay($today);
            } elseif ($side === 'b') {
                $userMessagedToday = $streak->user_b_last_msg_date && Carbon::parse($streak->user_b_last_msg_date)->isSameDay($today);
                $partnerMessagedToday = $streak->user_a_last_msg_date && Carbon::parse($streak->user_a_last_msg_date)->isSameDay($today);
            }
        }

        return [
            'current_streak' => $streak->current_streak,
            'status' => $streak->status,
            'restore_days' => $streak->restore_days,
            'tier' => $streak->getMilestoneTier(),
            'last_completed_date' => $streak->last_completed_date?->toDateString(),
            'user_messaged_today' => $userMessagedToday,
            'partner_messaged_today' => $partnerMessagedToday,
            'next_milestone' => $nextMilestone,
            'days_to_next_milestone' => $nextMilestone ? $nextMilestone - $current : 0,
            'is_milestone' => $streak->isMilestone(),
            'today_completed' => $streak->last_completed_date
                && $streak->last_completed_date->isToday(),
        ];
    }

    // =====================================================================
    //  CRON JOB - KIỂM TRA HẰNG NGÀY
    // =====================================================================

    /**
     * Cron job chạy mỗi ngày: kiểm tra tất cả các streak đang hoạt động
     * và xử lý những chuỗi bị lỡ ngày.
     *
     * Quy tắc khôi phục: chỉ được dùng trong ngày ngay sau ngày bị miss.
     * Qua ngày đó thì mất chuỗi, bất kể còn bao nhiêu lượt.
     *
     * Timeline (last_completed = Ngày N):
     *   Ngày N+1: miss
     *   Ngày N+2 (daysSince=2): cron phát hiện => pending_restore (nếu còn lượt)
     *   Ngày N+3 (daysSince=3): hết hạn => mất chuỗi
     *
     * Bảng chuyển trạng thái:
     * ┌──────────────────────┬───────────────────────────────┬────────────────────────┐
     * │ Trạng thái hiện tại  │ Điều kiện                     │ Kết quả                │
     * ├──────────────────────┼───────────────────────────────┼────────────────────────┤
     * │ active               │ daysSince == 2 + còn lượt     │ => pending_restore     │
     * │ active               │ daysSince == 2 + hết lượt     │ => lost                │
     * │ active               │ daysSince >= 3                │ => lost (quá hạn)      │
     * │ pending_restore      │ daysSince >= 3                │ => lost (hết hạn)      │
     * │ pending_restore      │ Hết lượt khôi phục            │ => lost (zombie)       │
     * └──────────────────────┴───────────────────────────────┴────────────────────────┘
     *
     * @return void
     */
    public function checkAllStreaks(): void
    {
        $streaks = $this->streakRepository->getActiveStreaksNeedingCheck();
        $today = Carbon::today();

        foreach ($streaks as $streak) {
            $lastCompleted = $streak->last_completed_date
                ? Carbon::parse($streak->last_completed_date)
                : null;

            if (!$lastCompleted) {
                continue;
            }

            $daysSinceCompleted = (int) $lastCompleted->diffInDays($today, false);
            $participants = $this->participantRepository->getParticipantIds($streak->conversation_id);

            // Zombie: đang pending nhưng đã hết lượt => mất ngay
            if ($streak->status === 'pending_restore' && $streak->restore_days <= 0) {
                $this->loseStreak($streak, $participants);
                continue;
            }

            // Pending mà đã qua ngày khôi phục (daysSince >= 3) => hết hạn, mất chuỗi
            if ($streak->status === 'pending_restore' && $daysSinceCompleted >= 3) {
                $this->loseStreak($streak, $participants);
                continue;
            }

            // Active nhưng bị miss
            if ($streak->status === 'active' && $daysSinceCompleted >= 2) {
                // daysSince == 2: hôm nay là ngày ngay sau ngày miss => cửa sổ khôi phục mở
                if ($daysSinceCompleted === 2 && $streak->restore_days > 0) {
                    $this->streakRepository->update($streak->id, ['status' => 'pending_restore']);
                    $streak->refresh();

                    $this->sendSystemMessage(
                        $streak->conversation_id,
                        "Chuỗi {$streak->current_streak} ngày đang gặp nguy hiểm! Hãy dùng quyền khôi phục để giữ chuỗi. (Còn {$streak->restore_days} lần, hạn hôm nay)",
                        'streak_warning',
                        ['restore_days' => $streak->restore_days]
                    );

                    broadcast(new StreakUpdated($streak, $participants));
                } else {
                    // daysSince >= 3 hoặc hết lượt => cửa sổ đã qua, mất chuỗi
                    $this->loseStreak($streak, $participants);
                }
            }
        }
    }

    // =====================================================================
    //  HÀM NỘI BỘ (PRIVATE / PROTECTED)
    // =====================================================================

    /**
     * Đánh dấu streak là đã mất: reset toàn bộ về trạng thái ban đầu.
     *
     * Tất cả các trường đều được reset (streak = 0, lượt = 0, ngày = null)
     * để tránh dữ liệu cũ gây ảnh hưởng khi bắt đầu chuỗi mới.
     *
     * @param Streak $streak        Bản ghi streak cần reset
     * @param array  $participantIds Danh sách ID người tham gia (để broadcast)
     * @return void
     */
    protected function loseStreak(Streak $streak, array $participantIds): void
    {
        $this->streakRepository->update($streak->id, [
            'current_streak'       => 0,
            'status'               => 'lost',
            'restore_days'         => 0,
            'last_completed_date'  => null,
            'user_a_last_msg_date' => null,
            'user_b_last_msg_date' => null,
        ]);

        $streak->refresh();

        $this->sendSystemMessage(
            $streak->conversation_id,
            "💔 Các bạn đã mất chuỗi. Hãy nhắn tin để bắt đầu lại nhé!",
            'streak_lost'
        );

        broadcast(new StreakUpdated($streak, $participantIds));
    }

    /**
     * Gửi tin nhắn hệ thống (system message) vào cuộc trò chuyện.
     *
     * Tin nhắn hệ thống có sender_id = null và type = 'system'.
     * Nếu có metadata, sẽ được nối vào nội dung bằng ký tự phân cách '|||'
     * để frontend có thể parse và hiển thị UI tương ứng.
     *
     * @param int         $conversationId ID cuộc trò chuyện
     * @param string      $content        Nội dung tin nhắn
     * @param string      $subType        Loại phụ (streak, streak_warning, streak_milestone, ...)
     * @param array|null  $metadata       Dữ liệu bổ sung (encode JSON, nối sau '|||')
     * @return void
     */
    protected function sendSystemMessage(int $conversationId, string $content, string $subType = 'streak', ?array $metadata = null): void
    {
        $messageContent = $content;
        if ($metadata) {
            $messageContent = $content . '|||' . json_encode($metadata);
        }

        $message = $this->messageRepository->create([
            'conversation_id' => $conversationId,
            'sender_id' => null,
            'content' => $messageContent,
            'type' => 'system',
        ]);

        $participantIds = $this->participantRepository->getParticipantIds($conversationId);

        broadcast(new MessageSent($message, $participantIds));
    }
}
