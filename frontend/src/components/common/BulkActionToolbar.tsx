import React from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { CheckCircle2, XCircle, Download, Trash2, X } from 'lucide-react';
import { useToast } from '../ui/toast';
import { cn } from '../../lib/utils';

export interface BulkActionToolbarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onActivateSelected?: () => void;
  onDeactivateSelected?: () => void;
  onExportSelected?: () => void;
  onDeleteSelected?: () => void;
  className?: string;
}

export const BulkActionToolbar: React.FC<BulkActionToolbarProps> = ({
  selectedCount,
  onClearSelection,
  onActivateSelected,
  onDeactivateSelected,
  onExportSelected,
  onDeleteSelected,
  className,
}) => {
  const { addToast } = useToast();

  if (selectedCount === 0) return null;

  const handleActivate = () => {
    addToast({
      type: 'success',
      title: 'Bulk Action Complete',
      message: `Activated ${selectedCount} selected user accounts.`,
    });
    if (onActivateSelected) onActivateSelected();
  };

  const handleDeactivate = () => {
    addToast({
      type: 'warning',
      title: 'Bulk Action Complete',
      message: `Deactivated ${selectedCount} selected user accounts.`,
    });
    if (onDeactivateSelected) onDeactivateSelected();
  };

  const handleExport = () => {
    addToast({
      type: 'info',
      title: 'Export Started',
      message: `Exported user data payload for ${selectedCount} accounts.`,
    });
    if (onExportSelected) onExportSelected();
  };

  const handleDelete = () => {
    addToast({
      type: 'error',
      title: 'Bulk Action Complete',
      message: `Marked ${selectedCount} user accounts for deletion.`,
    });
    if (onDeleteSelected) onDeleteSelected();
  };

  return (
    <div className={cn('p-3.5 rounded-2xl bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 shadow-lg animate-fade-in', className)}>
      <div className="flex items-center gap-2">
        <Badge variant="primary" size="sm">
          {selectedCount} Selected
        </Badge>
        <span className="text-xs text-slate-300 font-medium">Bulk user operations</span>
        <button
          onClick={onClearSelection}
          className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors ml-1"
          title="Clear Selection"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="ghost" size="xs" onClick={handleActivate} className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40" leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}>
          Activate Selected
        </Button>
        <Button variant="ghost" size="xs" onClick={handleDeactivate} className="text-amber-400 hover:text-amber-300 hover:bg-amber-950/40" leftIcon={<XCircle className="w-3.5 h-3.5" />}>
          Deactivate Selected
        </Button>
        <Button variant="ghost" size="xs" onClick={handleExport} className="text-sky-400 hover:text-sky-300 hover:bg-sky-950/40" leftIcon={<Download className="w-3.5 h-3.5" />}>
          Export Selected
        </Button>
        <Button variant="ghost" size="xs" onClick={handleDelete} className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/40" leftIcon={<Trash2 className="w-3.5 h-3.5" />}>
          Delete Selected
        </Button>
      </div>
    </div>
  );
};
