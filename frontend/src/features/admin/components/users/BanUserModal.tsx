import { useState } from 'react';
import { WarningIcon, XMarkIcon, BanIcon } from '../shared/AdminIcons';

interface BanUserModalProps {
  user: { userId: number; name: string };
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isPending: boolean;
}

export function BanUserModal({ user, onClose, onConfirm, isPending }: BanUserModalProps) {
  const [reason, setReason] = useState('');

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
              <WarningIcon className="w-4 h-4 text-red-600" />
            </div>
            <h3 className="font-bold text-gray-900">Khoá tài khoản</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <XMarkIcon />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">
            Bạn đang khoá tài khoản của <span className="font-semibold text-gray-900">{user.name}</span>. Hành động này sẽ đăng xuất người dùng và thu hồi mọi token hiện tại.
          </p>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Lý do khoá <span className="text-red-500">*</span>
          </label>
          <textarea
            placeholder="Nhập lý do cụ thể để khoá tài khoản này..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none bg-gray-50"
            rows={4}
          />
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end space-x-3 px-6 pb-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Huỷ bỏ
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={!reason.trim() || isPending}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            ) : (
              <BanIcon />
            )}
            <span>Xác nhận khoá</span>
          </button>
        </div>
      </div>
    </div>
  );
}
