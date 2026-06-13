import { useAdminPosts } from '@/features/admin/hooks/useAdminPosts';
import { PostsFilter } from '@/features/admin/components/posts/PostsFilter';
import { PostsTable } from '@/features/admin/components/posts/PostsTable';
import { PostDetailModal } from '@/features/admin/components/posts/PostDetailModal';
import { AdminPagination } from '@/features/admin/components/shared/AdminPagination';

/**
 * AdminPosts — Trang quản lý bài viết dành cho Admin.
 *
 * Cung cấp chức năng xem danh sách bài viết, lọc theo trạng thái/tìm kiếm,
 * xem chi tiết bài viết, ẩn bài viết vi phạm, và khôi phục bài viết.
 */
export default function AdminPosts() {
  const {
    setPage,
    statusFilter,
    setStatusFilter,
    search,
    setSearch,
    selectedPost,
    setSelectedPost,
    data,
    isLoading,
    hideMutation,
    restoreMutation,
  } = useAdminPosts();

  return (
    <div>
      {/* Tiêu đề */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý Bài Viết</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Kiểm duyệt và quản lý tất cả bài viết trong hệ thống
        </p>
      </div>

      {/* Bộ lọc */}
      <PostsFilter
        statusFilter={statusFilter}
        onStatusChange={(val) => { setStatusFilter(val); setPage(1); }}
        search={search}
        onSearchChange={(val) => { setSearch(val); setPage(1); }}
        total={data?.total}
      />

      {/* Trạng thái tải */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <svg className="animate-spin w-8 h-8 text-indigo-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        </div>
      )}

      {/* Bảng dữ liệu */}
      {!isLoading && (
        <PostsTable
          posts={data?.posts ?? []}
          onViewDetail={setSelectedPost}
          onHidePost={(id, reason) => hideMutation.mutate({ postId: id, reason })}
          onRestorePost={(id) => restoreMutation.mutate(id)}
          isHidePending={hideMutation.isPending}
          isRestorePending={restoreMutation.isPending}
        />
      )}

      {/* Phân trang */}
      {data && (
        <AdminPagination
          currentPage={data.current_page}
          lastPage={data.last_page}
          onPageChange={setPage}
        />
      )}

      {/* Modal chi tiết bài viết */}
      <PostDetailModal
        post={selectedPost}
        onClose={() => setSelectedPost(null)}
      />
    </div>
  );
}
