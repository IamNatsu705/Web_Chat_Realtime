<?php

namespace App\Repositories\UserRepo;

use App\Repositories\BaseRepo\BaseRepositoryInterface;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * Interface Repository Người dùng (User Repository Interface).
 *
 * Định nghĩa các phương thức truy vấn liên quan đến người dùng,
 * bao gồm tìm kiếm, thống kê cho trang quản trị, và theo dõi hoạt động.
 */
interface UserRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Tìm người dùng theo địa chỉ email.
     *
     * @param string $email Địa chỉ email cần tìm.
     * @return \App\Models\User|null
     */
    public function findByEmail(string $email);

    /**
     * Tìm kiếm người dùng theo từ khóa (tên hoặc email).
     * Kết quả bao gồm thông tin trạng thái quan hệ (bạn bè, đang chờ, chưa kết bạn).
     *
     * @param string $keyword       Từ khóa tìm kiếm.
     * @param int    $currentUserId ID người dùng đang tìm kiếm (để xác định quan hệ).
     */
    public function searchByKeyword(string $keyword, int $currentUserId);

    /**
     * Đếm tổng số người dùng trong hệ thống.
     */
    public function countAll(): int;

    /**
     * Đếm số người dùng mới đăng ký kể từ một thời điểm.
     *
     * @param Carbon $date Thời điểm bắt đầu đếm.
     */
    public function countSince(Carbon $date): int;

    /**
     * Đếm số người dùng đang bị khóa tài khoản (banned).
     */
    public function countBanned(): int;

    /**
     * Lấy danh sách người dùng cho trang Quản trị (phân trang, tìm kiếm, lọc trạng thái).
     *
     * @param int         $perPage Số bản ghi mỗi trang.
     * @param string|null $search  Từ khóa tìm kiếm (tên hoặc email).
     * @param string|null $status  Trạng thái lọc: 'active', 'banned', hoặc null (tất cả).
     */
    public function getForAdmin(int $perPage = 15, ?string $search = null, ?string $status = null): LengthAwarePaginator;

    /**
     * Đếm số người dùng đăng ký trong khoảng thời gian.
     *
     * @param Carbon $from Ngày bắt đầu.
     * @param Carbon $to   Ngày kết thúc.
     */
    public function countBetween(Carbon $from, Carbon $to): int;

    /**
     * Lấy danh sách người dùng hoạt động nhiều nhất (theo số bài đăng + tin nhắn) trong 7 ngày.
     *
     * @param int $limit Số lượng tối đa.
     */
    public function getMostActive(int $limit = 5): \Illuminate\Support\Collection;

    /**
     * Đếm số người dùng hoạt động trong ngày hôm nay (dựa trên last_seen_at).
     */
    public function countActiveToday(): int;

    /**
     * Thống kê số người dùng mới đăng ký theo ngày trong N ngày gần nhất.
     *
     * @param int $days Số ngày cần thống kê.
     * @return array Mảng [ngày => số lượng].
     */
    public function getDailyCount(int $days = 7): array;
}
