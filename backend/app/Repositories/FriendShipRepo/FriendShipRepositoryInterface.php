<?php

namespace App\Repositories\FriendshipRepo;

use App\Repositories\BaseRepo\BaseRepositoryInterface;
use Illuminate\Support\Collection;

/**
 * Interface Repository Quan hệ bạn bè (Friendship Repository Interface).
 *
 * Định nghĩa các phương thức truy vấn liên quan đến quan hệ bạn bè,
 * bao gồm kiểm tra bạn bè, lấy danh sách bạn bè, và gợi ý kết bạn.
 */
interface FriendshipRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Kiểm tra hai người dùng có phải bạn bè hay không (cả hai chiều).
     *
     * @param int $userId   ID người dùng thứ nhất.
     * @param int $friendId ID người dùng thứ hai.
     * @return \App\Models\Friendship|null Bản ghi bạn bè, hoặc null nếu chưa kết bạn.
     */
    public function checkIsFriend(int $userId, int $friendId);

    /**
     * Lấy danh sách tất cả bạn bè của một người dùng.
     *
     * @param int $userId ID người dùng.
     * @return Collection
     */
    public function getFriendsByUserId(int $userId): Collection;

    /**
     * Xóa quan hệ bạn bè giữa hai người dùng (hủy kết bạn).
     *
     * @param int $userId   ID người dùng thứ nhất.
     * @param int $friendId ID người dùng thứ hai.
     * @return bool True nếu xóa thành công.
     */
    public function deleteFriendship(int $userId, int $friendId): bool;

    /**
     * Lấy tất cả ID bạn bè của người dùng (1 truy vấn nhẹ, indexed).
     *
     * @param int $userId ID người dùng.
     * @return int[] Mảng chứa các ID bạn bè.
     */
    public function getFriendIds(int $userId): array;

    /**
     * Gợi ý kết bạn dựa trên bạn chung (mutual friends).
     * Tối ưu: Phương pháp 2 bước, không dùng correlated subquery.
     *
     * @param int   $userId     ID người dùng hiện tại.
     * @param array $friendIds  Mảng ID bạn bè hiện tại.
     * @param array $excludeIds Mảng ID cần loại trừ (đang pending request).
     * @param int   $limit      Số lượng gợi ý tối đa.
     * @return Collection
     */
    public function getSuggestedFriends(int $userId, array $friendIds, array $excludeIds = [], int $limit = 10): Collection;

    /**
     * Kiểm tra trạng thái quan hệ bạn bè (tồn tại hay không).
     *
     * @param int $userId   ID người dùng thứ nhất.
     * @param int $friendId ID người dùng thứ hai.
     * @return bool True nếu đã là bạn bè.
     */
    public function getFriendshipStatus(int $userId, int $friendId);
}
