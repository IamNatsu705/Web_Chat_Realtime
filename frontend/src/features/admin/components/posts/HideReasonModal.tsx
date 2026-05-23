import { useState, useRef, useEffect } from 'react';
import { HiOutlineExclamationTriangle } from 'react-icons/hi2';

interface HideReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isPending: boolean;
  postContent?: string;
}

export function HideReasonModal({ isOpen, onClose, onConfirm, isPending, postContent }: HideReasonModalProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setReason('');
      setError('');
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    const trimmed = reason.trim();
    if (!trimmed) {
      setError('Vui lòng nhập lý do ẩn bài viết.');
      return;
    }
    if (trimmed.length < 10) {
      setError('Lý do phải có ít nhất 10 ký tự.');
      return;
    }
    setError('');
    onConfirm(trimmed);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 pt-6 pb-2">
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
            <HiOutlineExclamationTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Ẩn bài viết</h3>
            <p className="text-sm text-gray-500">Bài viết sẽ bị ẩn khỏi feed của mọi người</p>
          </div>
        </div>

        {/* Post preview */}
        {postContent && (
          <div className="mx-6 mt-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
            <p className="text-sm text-gray-600 line-clamp-2">{postContent}</p>
          </div>
        )}

        {/* Reason input */}
        <div className="px-6 mt-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Lý do ẩn bài viết <span className="text-red-500">*</span>
          </label>
          <textarea
            ref={textareaRef}
            value={reason}
            onChange={(e) => { setReason(e.target.value); setError(''); }}
            placeholder="Ví dụ: Vi phạm quy tắc cộng đồng, nội dung không phù hợp..."
            rows={3}
            className={`w-full px-3.5 py-2.5 border rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all resize-none ${
              error
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-200 focus:ring-indigo-500 focus:border-transparent'
            }`}
          />
          <div className="flex items-center justify-between mt-1">
            {error ? (
              <p className="text-xs text-red-500 font-medium">{error}</p>
            ) : (
              <span className="text-xs text-gray-400">{reason.length}/500 ký tự</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 mt-2">
          <button
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
          >
            Huỷ
          </button>
          <button
            onClick={handleConfirm}
            disabled={isPending || !reason.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isPending ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Đang xử lý...
              </>
            ) : (
              'Xác nhận ẩn'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
