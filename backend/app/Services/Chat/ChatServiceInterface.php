<?php

namespace App\Services\Chat;

/**
 * Interface Service Chat (Chat Service Interface).
 *
 * Định nghĩa các phương thức nghiệp vụ liên quan đến trò chuyện:
 * quản lý cuộc trò chuyện, gửi/nhận tin nhắn, thu hồi, xóa, và xử lý người lạ.
 */
interface ChatServiceInterface
{
    /**
     * Lấy danh sách tất cả cuộc trò chuyện của người dùng (hiển thị trên Sidebar).
     *
     * @param int $userId ID người dùng.
     */
    public function getUserConversations(int $userId);

    /**
     * Lấy hoặc tạo mới cuộc trò chuyện 1-1 giữa hai người dùng.
     * Nếu chưa tồn tại, tạo cuộc trò chuyện mới với trạng thái phù hợp (active/pending).
     *
     * @param int $userId   ID người dùng hiện tại.
     * @param int $friendId ID người dùng đối phương.
     */
    public function getOrCreateDirectConversation(int $userId, int $friendId);

    /**
     * Lấy danh sách tin nhắn của một cuộc trò chuyện (phân trang cursor).
     *
     * @param int         $conversationId ID cuộc trò chuyện.
     * @param int         $userId         ID người dùng.
     * @param int         $limit          Số tin nhắn mỗi trang.
     * @param string|null $cursor         Con trỏ phân trang.
     */
    public function getMessages(int $conversationId, int $userId, int $limit, ?string $cursor);

    /**
     * Gửi tin nhắn mới vào cuộc trò chuyện (text, image, hoặc file).
     *
     * @param int   $conversationId ID cuộc trò chuyện.
     * @param int   $userId         ID người gửi.
     * @param array $data           Dữ liệu tin nhắn (content, type, image, file...).
     */
    public function sendMessage(int $conversationId, int $userId, array $data);

    /**
     * Đánh dấu tất cả tin nhắn chưa đọc là đã đọc (phân biệt 1-1 và nhóm).
     *
     * @param int $conversationId ID cuộc trò chuyện.
     * @param int $userId         ID người dùng.
     */
    public function markAsRead(int $conversationId, int $userId);

    // ── Quản lý tin nhắn ──────────────────────────────────────────────────

    /**
     * Thu hồi tin nhắn (chỉ người gửi mới được thu hồi).
     *
     * @param int $messageId ID tin nhắn.
     * @param int $userId    ID người dùng yêu cầu thu hồi.
     */
    public function recallMessage(int $messageId, int $userId);

    /**
     * Xóa tin nhắn chỉ ở phía mình (người khác vẫn thấy).
     *
     * @param int $messageId ID tin nhắn.
     * @param int $userId    ID người dùng.
     */
    public function deleteMessageForMe(int $messageId, int $userId);

    /**
     * Xóa toàn bộ lịch sử trò chuyện phía mình (cập nhật cleared_at).
     *
     * @param int $conversationId ID cuộc trò chuyện.
     * @param int $userId         ID người dùng.
     */
    public function clearConversation(int $conversationId, int $userId);

    // ── Cuộc trò chuyện từ người lạ ──────────────────────────────────────

    /**
     * Chấp nhận cuộc trò chuyện từ người lạ (chuyển trạng thái pending → active).
     *
     * @param int $conversationId ID cuộc trò chuyện.
     * @param int $userId         ID người nhận.
     */
    public function acceptStrangerConversation(int $conversationId, int $userId);

    /**
     * Từ chối cuộc trò chuyện từ người lạ (chuyển trạng thái pending → rejected).
     *
     * @param int $conversationId ID cuộc trò chuyện.
     * @param int $userId         ID người nhận.
     */
    public function rejectStrangerConversation(int $conversationId, int $userId);
}
