import React from 'react';
import { Button } from '../ui/button';
import { Download, FileText, Share2 } from 'lucide-react';
import { useToast } from '../ui/toast';
import { cn } from '../../lib/utils';

export interface ExportToolbarProps {
  reportTitle?: string;
  className?: string;
}

export const ExportToolbar: React.FC<ExportToolbarProps> = ({
  reportTitle = 'Research Analytics & Insights Report',
  className,
}) => {
  const { addToast } = useToast();

  const handleExportPdf = () => {
    addToast({
      type: 'info',
      title: 'Exporting PDF Report',
      message: `Generating vector PDF document for "${reportTitle}".`,
    });
  };

  const handleExportCsv = () => {
    addToast({
      type: 'info',
      title: 'Exporting CSV Payload',
      message: `Exporting anonymized raw metrics payload to CSV.`,
    });
  };

  const handleShareReport = () => {
    addToast({
      type: 'success',
      title: 'Share Link Generated',
      message: `Copied secure IRB analytics share link to clipboard.`,
    });
  };

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <Button
        variant="outline"
        size="xs"
        onClick={handleExportPdf}
        leftIcon={<FileText className="w-3.5 h-3.5 text-rose-500" />}
      >
        Export PDF
      </Button>

      <Button
        variant="outline"
        size="xs"
        onClick={handleExportCsv}
        leftIcon={<Download className="w-3.5 h-3.5 text-emerald-500" />}
      >
        Export CSV
      </Button>

      <Button
        variant="soft"
        size="xs"
        onClick={handleShareReport}
        leftIcon={<Share2 className="w-3.5 h-3.5 text-primary-600" />}
      >
        Share Report
      </Button>
    </div>
  );
};
