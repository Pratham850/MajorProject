import React from 'react';
import { Dialog, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { AlertOctagon, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info' | 'success';
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}) => {
  const iconConfig = {
    danger: <AlertOctagon className="w-6 h-6 text-rose-500" />,
    warning: <AlertTriangle className="w-6 h-6 text-amber-500" />,
    info: <Info className="w-6 h-6 text-sky-500" />,
    success: <CheckCircle2 className="w-6 h-6 text-emerald-500" />,
  };

  const confirmVariantMap: Record<string, any> = {
    danger: 'danger',
    warning: 'accent',
    info: 'primary',
    success: 'success',
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} maxWidth="md">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 shrink-0">
          {iconConfig[variant]}
        </div>
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">{title}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">{description}</p>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
          {cancelText}
        </Button>
        <Button variant={confirmVariantMap[variant]} size="sm" onClick={onConfirm} isLoading={isLoading}>
          {confirmText}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};
