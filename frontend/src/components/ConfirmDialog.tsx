import { useEffect, useRef } from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * ConfirmDialog — Hộp thoại xác nhận đơn giản, gọn gàng.
 *
 * Thay thế window.confirm() bằng modal có giao diện nhất quán.
 */
export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Hủy',
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onCancel]);

  useEffect(() => {
    if (isOpen && dialogRef.current) dialogRef.current.focus();
  }, [isOpen]);

  if (!isOpen) return null;

  const btnColor = {
    danger: 'bg-red-600 hover:bg-red-700',
    warning: 'bg-amber-600 hover:bg-amber-700',
    info: 'bg-indigo-600 hover:bg-indigo-700',
  }[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 animate-[fadeIn_150ms_ease-out]"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="relative bg-white rounded-xl shadow-xl w-full max-w-xs p-5 animate-[scaleIn_200ms_ease-out] outline-none"
      >
        <h3 className="text-[15px] font-bold text-gray-900 mb-1.5">{title}</h3>
        <p className="text-[13px] text-gray-500 leading-relaxed mb-5">{message}</p>

        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg text-[13px] hover:bg-gray-50 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-3 py-2 text-white font-medium rounded-lg text-[13px] transition-colors ${btnColor}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
