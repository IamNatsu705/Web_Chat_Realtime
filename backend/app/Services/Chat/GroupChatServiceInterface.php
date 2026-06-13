<?php

namespace App\Services\Chat;

/**
 * Interface Service Chat nhóm (Group Chat Service Interface).
 *
 * Định nghĩa các phương thức nghiệp vụ liên quan đến quản lý nhóm chat:
 * tạo nhóm, cập nhật thông tin, quản lý thành viên (thêm/xóa/thăng cấp/hạ cấp),
 * và các tính năng cộng đồng (tham gia, yêu cầu, duyệt yêu cầu).
 */
interface GroupChatServiceInterface
{
    /**
     * Tạo nhóm chat mới.
     *
     * @param int   $userId ID người tạo (sẽ trở thành owner).
     * @param array $data   Dữ liệu nhóm (name, description, member_ids, join_type, category...).
     */
    public function createGroup(int $userId, array $data);

    /**
     * Cập nhật thông tin nhóm (tên, mô tả, avatar, danh mục...).
     *
     * @param int   $groupId ID nhóm.
     * @param int   $userId  ID người thực hiện (phải là owner/mod).
     * @param array $data    Dữ liệu cần cập nhật.
     */
    public function updateGroup(int $groupId, int $userId, array $data);

    /**
     * Thêm thành viên mới vào nhóm.
     *
     * @param int $groupId     ID nhóm.
     * @param int $userId      ID người thực hiện (phải là owner/mod).
     * @param int $userIdToAdd ID người dùng cần thêm.
     */
    public function addGroupMember(int $groupId, int $userId, int $userIdToAdd);

    /**
     * Xóa thành viên khỏi nhóm (kick).
     *
     * @param int $groupId        ID nhóm.
     * @param int $adminId        ID người thực hiện (phải là owner/mod).
     * @param int $userIdToRemove ID người dùng cần xóa.
     */
    public function removeGroupMember(int $groupId, int $adminId, int $userIdToRemove);

    /**
     * Rời nhóm (owner không được rời, phải giải tán).
     *
     * @param int $groupId ID nhóm.
     * @param int $userId  ID người rời.
     */
    public function leaveGroup(int $groupId, int $userId);

    /**
     * Giải tán nhóm (chỉ owner).
     *
     * @param int $groupId ID nhóm.
     * @param int $adminId ID owner.
     */
    public function dissolveGroup(int $groupId, int $adminId);

    // ── Tính năng Cộng đồng (Community) ──────────────────────────────────

    /**
     * Lấy danh sách nhóm cộng đồng (trang Khám phá).
     *
     * @param string|null $search   Từ khóa tìm kiếm.
     * @param string|null $category Danh mục lọc.
     * @param int         $perPage  Số bản ghi mỗi trang.
     * @param int|null    $userId   ID người dùng (để kiểm tra trạng thái tham gia).
     */
    public function getCommunities(?string $search, ?string $category, int $perPage = 12, ?int $userId = null);

    /**
     * Tham gia nhóm — tự động phân biệt open/request dựa trên join_type.
     *
     * @param int $groupId ID nhóm.
     * @param int $userId  ID người tham gia.
     * @return array Mảng chứa ['type' => string, 'data' => mixed].
     */
    public function joinGroup(int $groupId, int $userId): array;

    /**
     * Tham gia nhóm open trực tiếp (không cần phê duyệt).
     *
     * @param int $groupId ID nhóm.
     * @param int $userId  ID người tham gia.
     */
    public function joinOpenGroup(int $groupId, int $userId);

    /**
     * Gửi yêu cầu tham gia nhóm request (cần phê duyệt).
     *
     * @param int $groupId ID nhóm.
     * @param int $userId  ID người gửi yêu cầu.
     */
    public function requestToJoin(int $groupId, int $userId);

    /**
     * Hủy yêu cầu tham gia nhóm đang chờ duyệt.
     *
     * @param int $groupId ID nhóm.
     * @param int $userId  ID người hủy yêu cầu.
     */
    public function cancelJoinRequest(int $groupId, int $userId);

    /**
     * Trưởng/Phó nhóm duyệt hoặc từ chối yêu cầu tham gia.
     *
     * @param int    $requestId  ID yêu cầu.
     * @param int    $reviewerId ID người duyệt (phải là owner/mod).
     * @param string $action     Hành động: 'approve' hoặc 'reject'.
     */
    public function respondToJoinRequest(int $requestId, int $reviewerId, string $action);

    /**
     * Lấy danh sách yêu cầu tham gia đang chờ duyệt.
     *
     * @param int $groupId ID nhóm.
     * @param int $userId  ID người yêu cầu (phải là owner/mod).
     */
    public function getPendingJoinRequests(int $groupId, int $userId);

    /**
     * Trưởng nhóm thăng cấp thành viên lên phó nhóm.
     *
     * @param int $groupId ID nhóm.
     * @param int $ownerId ID trưởng nhóm.
     * @param int $userId  ID thành viên cần thăng cấp.
     */
    public function promoteModerator(int $groupId, int $ownerId, int $userId);

    /**
     * Trưởng nhóm hạ cấp phó nhóm thành thành viên.
     *
     * @param int $groupId ID nhóm.
     * @param int $ownerId ID trưởng nhóm.
     * @param int $userId  ID phó nhóm cần hạ cấp.
     */
    public function demoteModerator(int $groupId, int $ownerId, int $userId);
}
