import { ChevronLeftIcon, ChevronRightIcon } from './AdminIcons';

interface AdminPaginationProps {
  currentPage: number;
  lastPage: number;
  onPageChange: (page: number) => void;
}

export function AdminPagination({ currentPage, lastPage, onPageChange }: AdminPaginationProps) {
  if (lastPage <= 1) return null;

  return (
    <div className="flex items-center justify-center space-x-3 mt-6">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="flex items-center space-x-1 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
      >
        <ChevronLeftIcon />
        <span>Trước</span>
      </button>
      <span className="text-sm text-gray-600 font-medium bg-white border border-gray-200 px-4 py-2 rounded-lg shadow-sm">
        {currentPage} / {lastPage}
      </span>
      <button
        onClick={() => onPageChange(Math.min(lastPage, currentPage + 1))}
        disabled={currentPage === lastPage}
        className="flex items-center space-x-1 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
      >
        <span>Sau</span>
        <ChevronRightIcon />
      </button>
    </div>
  );
}
