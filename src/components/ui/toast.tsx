import React, { createContext, useContext, useState, useEffect } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Toast {
    id: string;
    title?: string;
    description: string;
    type: 'success' | 'error' | 'warning' | 'info';
    duration?: number; // In milliseconds, default: 4000
}

interface ToastContextType {
    toasts: Toast[];
    toast: {
        success: (description: string, title?: string, duration?: number) => void;
        error: (description: string, title?: string, duration?: number) => void;
        warning: (description: string, title?: string, duration?: number) => void;
        info: (description: string, title?: string, duration?: number) => void;
    };
    dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = (
        type: 'success' | 'error' | 'warning' | 'info',
        description: string,
        title?: string,
        duration = 4000
    ) => {
        const id = Math.random().toString(36).substring(2, 9);
        const newToast: Toast = { id, type, description, title, duration };
        setToasts((prev) => [...prev, newToast]);
    };

    const dismiss = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    const toast = {
        success: (description: string, title?: string, duration?: number) =>
            addToast('success', description, title, duration),
        error: (description: string, title?: string, duration?: number) =>
            addToast('error', description, title, duration),
        warning: (description: string, title?: string, duration?: number) =>
            addToast('warning', description, title, duration),
        info: (description: string, title?: string, duration?: number) =>
            addToast('info', description, title, duration)
    };

    return (
        <ToastContext.Provider value={{ toasts, toast, dismiss }}>
            {children}
            <Toaster />
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

// Internal single Toast Item Component with auto-dismiss timers
const ToastItem: React.FC<{ toastItem: Toast; onDismiss: (id: string) => void }> = ({
    toastItem,
    onDismiss
}) => {
    const { id, type, title, description, duration } = toastItem;

    useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss(id);
        }, duration || 4000);

        return () => clearTimeout(timer);
    }, [id, duration, onDismiss]);

    // Choose icons & color styles dynamically
    const iconMap = {
        success: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />,
        error: <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-450 flex-shrink-0" />,
        warning: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />,
        info: <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
    };

    const borderMap = {
        success: 'border-l-4 border-l-emerald-500 border-slate-100 dark:border-slate-800/60',
        error: 'border-l-4 border-l-rose-500 border-slate-100 dark:border-slate-800/60',
        warning: 'border-l-4 border-l-amber-500 border-slate-100 dark:border-slate-800/60',
        info: 'border-l-4 border-l-indigo-500 border-slate-100 dark:border-slate-800/60'
    };

    return (
        <div
            className={cn(
                'w-full max-w-sm bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border select-none',
                'flex gap-3 items-start relative overflow-hidden group',
                'animate-in slide-in-from-right-12 duration-300 ease-out',
                borderMap[type]
            )}
            role="alert"
            aria-live="assertive"
        >
            {/* Styled Icon Wrapper */}
            <div className="mt-0.5">{iconMap[type]}</div>

            {/* Content Container */}
            <div className="flex-1 min-w-0 pr-6">
                {title && (
                    <h4 className="text-[11px] font-black text-slate-900 dark:text-slate-100 tracking-wider uppercase mb-1">
                        {title}
                    </h4>
                )}
                <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold leading-relaxed break-words">
                    {description}
                </p>
            </div>

            {/* Action Dismiss Button */}
            <button
                onClick={() => onDismiss(id)}
                className={cn(
                    'absolute right-3.5 top-3.5 p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-slate-100',
                    'bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/80 active:scale-95',
                    'transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100'
                )}
                aria-label="Dismiss Notification"
            >
                <X className="w-3.5 h-3.5" />
            </button>
        </div>
    );
};

// Toast Container Portal rendering absolute top/bottom stacked elements
export const Toaster: React.FC = () => {
    const { toasts, dismiss } = useToast();

    if (toasts.length === 0) return null;

    return (
        <div
            className={cn(
                'fixed bottom-6 right-6 z-[9999] w-full max-w-sm',
                'flex flex-col gap-3 pointer-events-none'
            )}
        >
            <div className="flex flex-col gap-3 pointer-events-auto items-end w-full">
                {toasts.map((toastItem) => (
                    <ToastItem key={toastItem.id} toastItem={toastItem} onDismiss={dismiss} />
                ))}
            </div>
        </div>
    );
};
