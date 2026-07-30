import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { FileText, Eye, Download, ShieldCheck } from 'lucide-react';
import { useToast } from '../ui/toast';

export interface MedicalRecordItem {
  id: string;
  title: string;
  uploadDate: string;
  category: string;
  fileSize: string;
}

const defaultRecords: MedicalRecordItem[] = [
  {
    id: 'mr-1',
    title: 'Comprehensive Metabolic Panel & Lipid Profile',
    uploadDate: '2026-07-25',
    category: 'Lab Result',
    fileSize: '3.8 MB',
  },
  {
    id: 'mr-2',
    title: 'Annual Electrocardiogram (ECG) Diagnostic Report',
    uploadDate: '2026-07-10',
    category: 'EHR',
    fileSize: '5.2 MB',
  },
  {
    id: 'mr-3',
    title: 'Chest X-Ray Digital Imaging (.DICOM)',
    uploadDate: '2026-06-18',
    category: 'Radiology',
    fileSize: '18.4 MB',
  },
];

export const MedicalRecordPreview: React.FC<{ records?: MedicalRecordItem[] }> = ({
  records = defaultRecords,
}) => {
  const { addToast } = useToast();

  const handleView = (title: string) => {
    addToast({
      type: 'info',
      title: 'Viewing Medical Record',
      message: `Decrypting and displaying "${title}"...`,
    });
  };

  const handleDownload = (title: string) => {
    addToast({
      type: 'success',
      title: 'Downloading Record',
      message: `Downloading encrypted file "${title}".`,
    });
  };

  return (
    <Card className="border-slate-200/80 dark:border-slate-800">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-bold">Medical Records Preview</CardTitle>
            <Badge variant="success" size="sm">Consent Authorized</Badge>
          </div>
          <CardDescription className="text-xs">
            Encrypted diagnostic records shared by patient for this consultation.
          </CardDescription>
        </div>
        <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 rounded-xl">
          <ShieldCheck className="w-5 h-5" />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {records.map((rec) => (
          <div
            key={rec.id}
            className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white dark:hover:bg-slate-800 transition-all"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-950/60 dark:text-primary-400 shrink-0">
                <FileText className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{rec.title}</h4>
                <div className="flex items-center gap-2 text-2xs text-slate-400 font-mono mt-0.5">
                  <span>Date: {rec.uploadDate}</span>
                  <span>•</span>
                  <span>{rec.fileSize}</span>
                  <span>•</span>
                  <Badge variant="secondary" size="sm">{rec.category}</Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="xs"
                onClick={() => handleView(rec.title)}
                leftIcon={<Eye className="w-3.5 h-3.5" />}
              >
                View
              </Button>
              <Button
                variant="secondary"
                size="xs"
                onClick={() => handleDownload(rec.title)}
                leftIcon={<Download className="w-3.5 h-3.5" />}
              >
                Download
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
