<?php

namespace App\Services\Chat;

use App\Repositories\ConversationParticipantRepo\ConversationParticipantRepositoryInterface;
use App\Repositories\ConversationRepo\ConversationRepositoryInterface;
use App\Repositories\GroupResourceRepo\GroupResourceRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;
use Exception;

class GroupResourceService implements GroupResourceServiceInterface
{
    public function __construct(
        protected GroupResourceRepositoryInterface $resourceRepository,
        protected ConversationRepositoryInterface $conversationRepository,
        protected ConversationParticipantRepositoryInterface $participantRepository,
    ) {}

    // =====================================================================
    //  LẤY DANH SÁCH TÀI LIỆU
    // =====================================================================

    /**
     * Lấy danh sách tài liệu của nhóm.
     * Chỉ member mới xem được.
     * Tài liệu không bị ảnh hưởng bởi cleared_at — user mới tham gia vẫn xem được toàn bộ.
     */
    public function getResources(int $groupId, int $userId, ?string $search, ?string $category, int $perPage = 15): LengthAwarePaginator
    {
        $this->assertIsMember($groupId, $userId);

        return $this->resourceRepository->getByConversation($groupId, $search, $category, $perPage);
    }

    // =====================================================================
    //  UPLOAD TÀI LIỆU
    // =====================================================================

    /**
     * Upload tài liệu mới vào nhóm.
     * Bất kỳ member nào cũng upload được.
     * File được lưu vào thư mục 'group_resources/{conversationId}/' để tổ chức gọn gàng.
     * Hỗ trợ file tối đa 50MB — validation ở FormRequest.
     */
    public function uploadResource(int $groupId, int $userId, array $data): Model
    {
        $this->assertIsMember($groupId, $userId);

        $file = $data['file'];
        $filePath = $file->store("group_resources/{$groupId}", 'public');

        $resource = $this->resourceRepository->create([
            'conversation_id' => $groupId,
            'uploader_id'     => $userId,
            'title'           => $data['title'],
            'description'     => $data['description'] ?? null,
            'file_url'        => $filePath,
            'file_type'       => $this->detectFileType($file->getClientOriginalExtension()),
            'file_size'       => $file->getSize(),
            'category'        => $data['category'] ?? 'other',
        ]);

        return $resource->load('uploader');
    }

    // =====================================================================
    //  XÓA TÀI LIỆU
    // =====================================================================

    /**
     * Xóa tài liệu.
     * Quyền xóa: người upload hoặc trưởng/phó nhóm.
     * Tự động xóa file trên storage.
     */
    public function deleteResource(int $resourceId, int $userId): void
    {
        $resource = $this->resourceRepository->findOrFail($resourceId);
        $groupId = $resource->conversation_id;

        // Kiểm tra quyền: người upload hoặc owner/mod
        $participant = $this->participantRepository->getParticipant($groupId, $userId);
        if (!$participant) {
            throw new Exception('Bạn không phải thành viên của nhóm.');
        }

        $isOwnerOrMod = $participant->isOwnerOrMod();
        $isUploader = $resource->uploader_id === $userId;

        if (!$isOwnerOrMod && !$isUploader) {
            throw new Exception('Bạn không có quyền xóa tài liệu này. Chỉ người tải lên hoặc trưởng/phó nhóm mới có thể xóa.');
        }

        // Xóa file trên storage
        Storage::disk('public')->delete($resource->file_url);

        $this->resourceRepository->delete($resourceId);
    }

    // =====================================================================
    //  GHIM/BỎ GHIM TÀI LIỆU
    // =====================================================================

    /**
     * Ghim hoặc bỏ ghim tài liệu.
     * Chỉ trưởng/phó nhóm mới có quyền.
     */
    public function togglePin(int $resourceId, int $userId): Model
    {
        $resource = $this->resourceRepository->findOrFail($resourceId);
        $groupId = $resource->conversation_id;

        $participant = $this->participantRepository->getParticipant($groupId, $userId);
        if (!$participant || !$participant->isOwnerOrMod()) {
            throw new Exception('Chỉ trưởng/phó nhóm mới có thể ghim tài liệu.');
        }

        $resource->update(['is_pinned' => !$resource->is_pinned]);

        return $resource->fresh()->load('uploader');
    }

    // =====================================================================
    //  TẢI XUỐNG TÀI LIỆU
    // =====================================================================

    /**
     * Lấy thông tin tài liệu để download.
     * Tự động tăng download_count.
     * Chỉ member mới download được.
     */
    public function downloadResource(int $resourceId, int $userId): Model
    {
        $resource = $this->resourceRepository->findOrFail($resourceId);

        $this->assertIsMember($resource->conversation_id, $userId);

        // Tăng lượt tải (không cần lock vì không critical)
        $resource->increment('download_count');

        return $resource;
    }

    // =====================================================================
    //  HELPER
    // =====================================================================

    /**
     * Kiểm tra user có phải thành viên nhóm không.
     * Ném exception nếu không phải.
     */
    private function assertIsMember(int $groupId, int $userId): void
    {
        $participant = $this->participantRepository->getParticipant($groupId, $userId);
        if (!$participant) {
            throw new Exception('Bạn không phải thành viên của nhóm này.');
        }
    }

    /**
     * Phát hiện loại file dựa trên extension.
     */
    private function detectFileType(string $extension): string
    {
        $extension = strtolower($extension);

        return match (true) {
            in_array($extension, ['pdf'])                          => 'pdf',
            in_array($extension, ['doc', 'docx', 'odt'])          => 'doc',
            in_array($extension, ['xls', 'xlsx', 'ods'])          => 'excel',
            in_array($extension, ['ppt', 'pptx', 'odp'])          => 'ppt',
            in_array($extension, ['jpg', 'jpeg', 'png', 'gif', 'webp']) => 'image',
            in_array($extension, ['zip', 'rar', '7z', 'tar', 'gz']) => 'archive',
            default                                                 => 'other',
        };
    }
}
