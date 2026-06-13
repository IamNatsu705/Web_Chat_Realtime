import { useAdminUsers } from '@/features/admin/hooks/useAdminUsers';
import { UsersFilter } from '@/features/admin/components/users/UsersFilter';
import { UsersTable } from '@/features/admin/components/users/UsersTable';
import { BanUserModal } from '@/features/admin/components/users/BanUserModal';
import { AdminPagination } from '@/features/admin/components/shared/AdminPagination';

/**
 * AdminUsers — Trang quản lý người dùng dành cho Admin.
 *
 * Cung cấp các tính năng xem danh sách, lọc, tìm kiếm người dùng,
 * đồng thời cho phép cấm (ban) hoặc gỡ cấm (unban) người dùng vi phạm.
 */
export default function AdminUsers() {
  const {
    search,
    setSearch,
    setPage,
    status,
    setStatus,
    banModal,
    setBanModal,
    data,
    isLoading,
    banMutation,
    unbanMutation,
  } = useAdminUsers();

  return (
    <div>
      {/* Tiêu đề */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý Người Dùng</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Quản lý tài khoản, phân quyền và xử lý vi phạm của người dùng
        </p>
      </div>

      {/* Bộ lọc */}
      <UsersFilter
        search={search}
        onSearchChange={(val) => { setSearch(val); setPage(1); }}
        status={status}
        onStatusChange={(val) => { setStatus(val); setPage(1); }}
        total={data?.total}
      />

      {/* Bảng dữ liệu */}
      <UsersTable
        users={data?.users}
        isLoading={isLoading}
        onBanClick={(user) => setBanModal({ userId: user.id, name: user.name })}
        onUnbanClick={(userId) => unbanMutation.mutate(userId)}
        isUnbanPending={unbanMutation.isPending}
      />

      {/* Phân trang */}
      {data && (
        <AdminPagination
          currentPage={data.current_page}
          lastPage={data.last_page}
          onPageChange={setPage}
        />
      )}

      {/* Các hộp thoại (Modals) */}
      {banModal && (
        <BanUserModal
          user={banModal}
          onClose={() => setBanModal(null)}
          onConfirm={(reason) => banMutation.mutate({ userId: banModal.userId, reason })}
          isPending={banMutation.isPending}
        />
      )}
    </div>
  );
}
