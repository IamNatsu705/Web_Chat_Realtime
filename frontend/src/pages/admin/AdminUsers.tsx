import { useAdminUsers } from '@/features/admin/hooks/useAdminUsers';
import { UsersFilter } from '@/features/admin/components/users/UsersFilter';
import { UsersTable } from '@/features/admin/components/users/UsersTable';
import { BanUserModal } from '@/features/admin/components/users/BanUserModal';
import { AdminPagination } from '@/features/admin/components/shared/AdminPagination';

export default function AdminUsers() {
  const {
    search,
    setSearch,
    page,
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
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý Người Dùng</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Quản lý tài khoản, phân quyền và xử lý vi phạm của người dùng
        </p>
      </div>

      {/* Filter */}
      <UsersFilter
        search={search}
        onSearchChange={(val) => { setSearch(val); setPage(1); }}
        status={status}
        onStatusChange={(val) => { setStatus(val); setPage(1); }}
        total={data?.total}
      />

      {/* Table */}
      <UsersTable
        users={data?.users}
        isLoading={isLoading}
        onBanClick={(user) => setBanModal({ userId: user.id, name: user.name })}
        onUnbanClick={(userId) => unbanMutation.mutate(userId)}
        isUnbanPending={unbanMutation.isPending}
      />

      {/* Pagination */}
      {data && (
        <AdminPagination
          currentPage={data.current_page}
          lastPage={data.last_page}
          onPageChange={setPage}
        />
      )}

      {/* Modals */}
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
