import React from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { FileText, Eye, Download, Lock, Calendar, User, Trash2, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface MedicalRecordCardProps {
  id: string | number;
  title: string;
  category: 'EHR' | 'Lab Result' | 'Radiology' | 'Prescription' | 'Discharge Summary' | 'Immunization' | string;
  patientName?: string;
  doctorName?: string;
  date: string;
  fileSize?: string;
  isEncrypted?: boolean;
  verificationStatus?: 'Verified' | 'Pending' | 'Encrypted';
  onView?: () => void;
  onDownload?: () => void;
  onDelete?: () => void;
  className?: string;
}

export const MedicalRecordCard: React.FC<MedicalRecordCardProps> = ({
  title,
  category,
  patientName,
  doctorName,
  date,
  fileSize = '2.4 MB',
  isEncrypted = true,
  verificationStatus = 'Verified',
  onView,
  onDownload,
  onDelete,
  className,
}) => {
  const categoryVariants: Record<string, { variant: any; iconColor: string }> = {
    'EHR': { variant: 'primary', iconColor: 'text-primary-600' },
    'Lab Result': { variant: 'info', iconColor: 'text-sky-600' },
    'Radiology': { variant: 'warning', iconColor: 'text-amber-600' },
    'Prescription': { variant: 'success', iconColor: 'text-emerald-600' },
    'Immunization': { variant: 'secondary', iconColor: 'text-indigo-600' },
    'Discharge Summary': { variant: 'secondary', iconColor: 'text-slate-600' },
  };

  const catStyle = categoryVariants[category] || categoryVariants['EHR'];

  return (
    <Card className={cn('p-5 flex flex-col justify-between hover:shadow-md transition-all duration-200 border-slate-200/80 dark:border-slate-800', className)}>
      <div>
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <Badge variant={catStyle.variant} size="sm" dot>
            {category}
          </Badge>
          <div className="flex items-center gap-1.5">
            {verificationStatus === 'Verified' && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Verified
              </span>
            )}
            {verificationStatus === 'Pending' && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md">
                <Clock className="w-3 h-3 text-amber-500" /> Pending
              </span>
            )}
            {isEncrypted && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                <Lock className="w-3 h-3 text-primary-500" /> AES-256
              </span>
            )}
          </div>
        </div>

        {/* Title & Metadata */}
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0">
            <FileText className={cn('w-5 h-5', catStyle.iconColor)} />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-1">{title}</h4>
            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" /> {date}
              </span>
              <span>•</span>
              <span>{fileSize}</span>
            </div>
          </div>
        </div>

        {/* Participants Details */}
        {(patientName || doctorName) && (
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-4 text-2xs text-slate-500 dark:text-slate-400">
            {patientName && (
              <span className="inline-flex items-center gap-1">
                <User className="w-3 h-3 text-primary-600" /> Patient: <strong className="text-slate-700 dark:text-slate-300 font-semibold">{patientName}</strong>
              </span>
            )}
            {doctorName && (
              <span className="inline-flex items-center gap-1">
                Doctor: <strong className="text-slate-700 dark:text-slate-300 font-semibold">{doctorName}</strong>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
        <div>
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
              title="Delete record"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onView && (
            <Button variant="ghost" size="xs" onClick={onView} leftIcon={<Eye className="w-3.5 h-3.5" />}>
              Preview
            </Button>
          )}
          {onDownload && (
            <Button variant="soft" size="xs" onClick={onDownload} leftIcon={<Download className="w-3.5 h-3.5" />}>
              Download
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
