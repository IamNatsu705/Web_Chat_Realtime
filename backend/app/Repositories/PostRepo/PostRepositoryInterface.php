<?php

namespace App\Repositories\PostRepo;

use App\Repositories\BaseRepo\BaseRepositoryInterface;
use Illuminate\Contracts\Pagination\CursorPaginator;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

/**
 * Interface Repository Bài đăng (Post Repository Interface).
 *
 * Định nghĩa các phương thức truy vấn liên quan đến bài đăng,
 * bao gồm bảng tin (feed), bài viết cá nhân, trang quản trị, và thống kê.
 */
interface PostRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Lấy tất cả bài đăng của một người dùng (không phân trang).
     *
     * @param int $userId ID người dùng.
     */
    public function getByUserId(int $userId): Collection;

    /**
     * Lấy bảng tin (feed) với phân trang dạng cursor.
     * Bài ghim hiển thị trước, sau đó sắp xếp theo ngày tạo giảm dần.
     *
     * @param int         $perPage Số bài mỗi trang.
     * @param string|null $cursor  Con trỏ phân trang.
     */
    public function getFeed(int $perPage = 15, ?string $cursor = null): CursorPaginator;

    /**
     * Lấy bài viết của một người dùng (trang cá nhân).
     * Chủ sở hữu thấy tất cả (gồm bài bị ẩn), người khác chỉ thấy bài active.
     *
     * @param int $userId   ID chủ trang cá nhân.
     * @param int $viewerId ID người đang xem.
     * @param int $perPage  Số bài mỗi trang.
     */
    public function getUserPosts(int $userId, int $viewerId, int $perPage = 15): LengthAwarePaginator;

    /**
     * Lấy bài viết cho trang Quản trị (phân trang, lọc trạng thái, tìm kiếm).
     *
     * @param int         $perPage Số bài mỗi trang.
     * @param string|null $status  Trạng thái lọc ('active', 'hidden').
     * @param string|null $search  Từ khóa tìm kiếm (nội dung hoặc tên tác giả).
     */
    public function getForAdmin(int $perPage = 15, ?string $status = null, ?string $search = null): LengthAwarePaginator;

    /**
     * Đếm tổng số bài đăng trong hệ thống.
     */
    public function countAll(): int;

    /**
     * Đếm số bài đăng kể từ một thời điểm.
     *
     * @param \Carbon\Carbon $date Thời điểm bắt đầu đếm.
     */
    public function countSince(\Carbon\Carbon $date): int;

    /**
     * Đếm số bài đăng trong khoảng thời gian.
     *
     * @param \Carbon\Carbon $from Ngày bắt đầu.
     * @param \Carbon\Carbon $to   Ngày kết thúc.
     */
    public function countBetween(\Carbon\Carbon $from, \Carbon\Carbon $to): int;

    /**
     * Đếm số bài đăng đang bị ẩn (status = 'hidden').
     */
    public function countHidden(): int;

    /**
     * Lấy các bài viết có tương tác cao nhất (lượt thích + bình luận) trong 7 ngày.
     *
     * @param int $limit Số lượng tối đa.
     */
    public function getTopEngagement(int $limit = 5): \Illuminate\Support\Collection;

    /**
     * Thống kê số bài viết theo ngày trong N ngày gần nhất.
     *
     * @param int $days Số ngày cần thống kê.
     * @return array Mảng [ngày => số lượng].
     */
    public function getDailyCount(int $days = 7): array;
}
