import { SearchIcon } from '../shared/AdminIcons';

interface UsersFilterProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  total?: number;
}

export function UsersFilter({ search, onSearchChange, status, onStatusChange, total }: UsersFilterProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 flex items-center justify-between flex-wrap gap-3">
      <div className="flex items-center gap-3 flex-1">
        <div className="relative flex-1 max-w-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <SearchIcon />
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc email..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
          />
        </div>
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 py-2 px-3"
        >
          <option value="all">Tất cả người dùng</option>
          <option value="active">Hoạt động</option>
          <option value="banned">Bị khoá</option>
        </select>
      </div>
      <span className="text-sm text-gray-500 font-medium">
        Tổng cộng: <span className="text-gray-900 font-bold">{total ?? 0}</span> người dùng
      </span>
    </div>
  );
}
