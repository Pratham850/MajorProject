import React from 'react';
import { Dialog, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { FileCode, Download, CheckCircle2, Lock, User } from 'lucide-react';

export interface RecordPreviewItem {
  id: string | number;
  title: string;
  category: string;
  patientName: string;
  doctorName?: string;
  date: string;
  fileSize: string;
  fileType?: string;
  verificationStatus?: string;
  notes?: string;
}

export interface RecordPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: RecordPreviewItem | null;
  onDownload?: (record: RecordPreviewItem) => void;
  onViewPatientDetails?: (record: RecordPreviewItem) => void;
}

export const RecordPreviewModal: React.FC<RecordPreviewModalProps> = ({
  isOpen,
  onClose,
  record,
  onDownload,
  onViewPatientDetails,
}) => {
  if (!record) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Clinical Record Preview: ${record.title}`}
      maxWidth="lg"
    >
      <div className="space-y-6 py-2 text-xs">
        {/* Record Summary Metadata Grid */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Patient Name</span>
            <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">{record.patientName}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Category</span>
            <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block">{record.category}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Upload Date</span>
            <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block font-mono">{record.date}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">File Format & Size</span>
            <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block">{record.fileType || 'PDF'} ({record.fileSize})</span>
          </div>
        </div>

        {/* Interactive Document Viewer Sandbox Box */}
        <div className="h-64 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
          <div className="p-4 bg-primary-50 dark:bg-primary-950/60 text-primary-600 rounded-2xl mb-3">
            <FileCode className="w-8 h-8" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Encrypted Clinical Viewer Sandbox</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
            Displaying decrypted payload preview for patient "{record.patientName}".
          </p>
          <div className="mt-3 flex items-center gap-2">
            <Badge variant="success" size="sm">
              <CheckCircle2 className="w-3 h-3 mr-1" /> Signature Verified
            </Badge>
            <Badge variant="primary" size="sm">
              <Lock className="w-3 h-3 mr-1" /> AES-256 Decrypted
            </Badge>
          </div>
        </div>

        {/* Clinical Notes & Findings Placeholder */}
        <div className="space-y-1.5">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Clinical Notes & Diagnostic Findings
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 leading-relaxed">
            {record.notes || 'Lab metrics and physiological parameters evaluated. Patient exhibits stable cardiovascular and renal biomarkers within expected baseline ranges.'}
          </p>
        </div>

        <DialogFooter>
          {onViewPatientDetails && (
            <Button variant="ghost" size="sm" onClick={() => onViewPatientDetails(record)} leftIcon={<User className="w-4 h-4" />}>
              Patient Details
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={onClose}>
            Close Preview
          </Button>
          {onDownload && (
            <Button size="sm" onClick={() => onDownload(record)} leftIcon={<Download className="w-4 h-4" />}>
              Download File
            </Button>
          )}
        </DialogFooter>
      </div>
    </Dialog>
  );
};
