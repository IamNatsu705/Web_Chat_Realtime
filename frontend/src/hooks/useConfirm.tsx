import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import ConfirmDialog from '@/components/ConfirmDialog';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

/**
 * useConfirm — Hook gọi hộp thoại xác nhận từ bất kỳ component nào.
 *
 * Trả về một hàm async: `const ok = await confirm({ title, message })`.
 * Nếu user nhấn "Xác nhận" → trả về true, nhấn "Hủy" → trả về false.
 */
export function useConfirm(): ConfirmFn {
  const fn = useContext(ConfirmContext);
  if (!fn) throw new Error('useConfirm must be used within <ConfirmProvider>');
  return fn;
}

/**
 * ConfirmProvider — Bọc ở gốc app để cung cấp hộp thoại xác nhận toàn cục.
 */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{
    isOpen: boolean;
    options: ConfirmOptions;
    resolve: ((value: boolean) => void) | null;
  }>({
    isOpen: false,
    options: { title: '', message: '' },
    resolve: null,
  });

  const confirm = useCallback<ConfirmFn>((options) => {
    return new Promise<boolean>((resolve) => {
      setState({ isOpen: true, options, resolve });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    state.resolve?.(true);
    setState((s) => ({ ...s, isOpen: false, resolve: null }));
  }, [state.resolve]);

  const handleCancel = useCallback(() => {
    state.resolve?.(false);
    setState((s) => ({ ...s, isOpen: false, resolve: null }));
  }, [state.resolve]);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <ConfirmDialog
        isOpen={state.isOpen}
        title={state.options.title}
        message={state.options.message}
        confirmLabel={state.options.confirmLabel}
        variant={state.options.variant}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </ConfirmContext.Provider>
  );
}
