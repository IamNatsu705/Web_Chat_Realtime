<?php

namespace App\Http\Controllers\Api\Chat;

use App\Http\Controllers\Controller;
use App\Http\Resources\GroupResourceResource;
use App\Services\Chat\GroupResourceServiceInterface;
use App\Traits\ApiResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Controller quản lý tài liệu trong cuộc trò chuyện.
 * Hoạt động với mọi loại chat: 1-1, nhóm riêng tư, nhóm cộng đồng.
 * Sử dụng streaming response cho download để tránh crash/đơ với file lớn.
 *
 * Route parameter: conversationId (dùng chung, thay thế groupId cũ)
 * Các route cũ /groups/{groupId}/resources vẫn hoạt động nhờ parameter alias.
 */
class GroupResourceController extends Controller
{
    use ApiResponses;

    public function __construct(
        protected GroupResourceServiceInterface $resourceService
    ) {}

    /**
     * Lấy danh sách tài liệu của cuộc trò chuyện.
     * Hỗ trợ phân trang, tìm kiếm, lọc theo danh mục.
     */
    public function index(Request $request, int $conversationId = 0, int $groupId = 0): JsonResponse
    {
        // Tương thích cả route cũ (/groups/{groupId}/resources) và mới (/conversations/{conversationId}/resources)
        $convId = $conversationId ?: $groupId;

        $resources = $this->resourceService->getResources(
            $convId,
            (int) auth()->id(),
            $request->query('search'),
            $request->query('category'),
            (int) $request->query('per_page', 15)
        );

        return $this->success([
            'resources'  => GroupResourceResource::collection($resources),
            'pagination' => [
                'current_page' => $resources->currentPage(),
                'last_page'    => $resources->lastPage(),
                'per_page'     => $resources->perPage(),
                'total'        => $resources->total(),
            ],
        ]);
    }

    /**
     * Upload tài liệu mới.
     * Hỗ trợ tất cả loại file phổ biến, tối đa 50MB.
     * Sử dụng chunked upload — file được lưu trực tiếp lên disk, không buffer RAM.
     */
    public function store(Request $request, int $conversationId = 0, int $groupId = 0): JsonResponse
    {
        $convId = $conversationId ?: $groupId;

        $request->validate([
            'title'       => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'category'    => ['nullable', 'string', 'in:exam,lecture,exercise,note,other'],
            // Giới hạn loại file theo nghiệp vụ (Mục 3.1.2 báo cáo: PDF, Word, Excel, PPT, ảnh, nén)
            'file'        => ['required', 'file', 'max:51200', 'mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,jpg,jpeg,png,gif,webp,zip,rar,7z,txt,csv'],
        ]);

        $resource = $this->resourceService->uploadResource(
            $convId,
            (int) auth()->id(),
            $request->only('title', 'description', 'category') + ['file' => $request->file('file')]
        );

        return $this->success(
            ['resource' => new GroupResourceResource($resource)],
            'Upload tài liệu thành công.',
            201
        );
    }

    /**
     * Tải xuống tài liệu.
     * Dùng StreamedResponse — gửi file theo từng chunk, không load toàn bộ vào RAM.
     * Phù hợp với file lớn tối đa 50MB mà không gây đơ server.
     */
    public function download(Request $request, int $conversationId = 0, int $resourceId = 0, int $groupId = 0): StreamedResponse
    {
        // Route cũ: /groups/{groupId}/resources/{resourceId}/download
        // Route mới: /conversations/{conversationId}/resources/{resourceId}/download
        $resource = $this->resourceService->downloadResource($resourceId, (int) auth()->id());

        $filePath = $resource->file_url;
        // Tên file đẹp: dùng title của resource thay vì tên file hash
        $ext      = pathinfo($filePath, PATHINFO_EXTENSION);
        $fileName = $resource->title . ($ext ? ".{$ext}" : '');

        /** @var \Illuminate\Filesystem\FilesystemAdapter $disk */
        $disk = Storage::disk('public');
        return $disk->download($filePath, $fileName);
    }

    /**
     * Xóa tài liệu.
     * Người upload hoặc owner/mod mới có quyền xóa.
     */
    public function destroy(Request $request, int $conversationId = 0, int $resourceId = 0, int $groupId = 0): JsonResponse
    {
        $this->resourceService->deleteResource($resourceId, (int) auth()->id());

        return $this->success(null, 'Xóa tài liệu thành công.');
    }

    /**
     * Ghim hoặc bỏ ghim tài liệu.
     * Chỉ owner/mod mới có quyền.
     */
    public function togglePin(Request $request, int $conversationId = 0, int $resourceId = 0, int $groupId = 0): JsonResponse
    {
        $resource = $this->resourceService->togglePin($resourceId, (int) auth()->id());

        return $this->success(
            ['resource' => new GroupResourceResource($resource)],
            $resource->is_pinned ? 'Đã ghim tài liệu.' : 'Đã bỏ ghim tài liệu.'
        );
    }
}
