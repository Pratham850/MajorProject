import React, { createContext, useContext, useState, useCallback } from 'react';
import { cn } from '../../lib/utils';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastOptions {
  title: string;
  description?: string;
  message?: string;
  variant?: 'default' | 'success' | 'error' | 'destructive' | 'warning' | 'info';
}

interface ToastFunction {
  (options: ToastOptions): void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

interface ToastContextType {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
  toast: ToastFunction;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback(({ type, title, message, duration = 4000 }: Omit<ToastItem, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toastBase = useCallback(({ title, description, message, variant }: ToastOptions) => {
    let type: ToastType = 'info';
    if (variant === 'destructive' || variant === 'error') type = 'error';
    else if (variant === 'success') type = 'success';
    else if (variant === 'warning') type = 'warning';

    addToast({
      type,
      title,
      message: message || description,
    });
  }, [addToast]);

  const toastFn = toastBase as ToastFunction;
  toastFn.success = (title: string, message?: string) => addToast({ type: 'success', title, message });
  toastFn.error = (title: string, message?: string) => addToast({ type: 'error', title, message });
  toastFn.warning = (title: string, message?: string) => addToast({ type: 'warning', title, message });
  toastFn.info = (title: string, message?: string) => addToast({ type: 'info', title, message });

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, toast: toastFn }}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toastItem) => (
          <ToastCard key={toastItem.id} toast={toastItem} onClose={() => removeToast(toastItem.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const ToastCard: React.FC<{ toast: ToastItem; onClose: () => void }> = ({ toast: toastItem, onClose }) => {
  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    error: <XCircle className="w-5 h-5 text-rose-500 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-sky-500 shrink-0" />,
  };

  const borders = {
    success: 'border-l-4 border-l-emerald-500',
    error: 'border-l-4 border-l-rose-500',
    warning: 'border-l-4 border-l-amber-500',
    info: 'border-l-4 border-l-sky-500',
  };

  return (
    <div
      className={cn(
        'pointer-events-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-elevated flex items-start justify-between gap-3 animate-slide-up',
        borders[toastItem.type]
      )}
    >
      <div className="flex items-start gap-3">
        {icons[toastItem.type]}
        <div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{toastItem.title}</h4>
          {toastItem.message && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{toastItem.message}</p>}
        </div>
      </div>
      <button
        onClick={onClose}
        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
