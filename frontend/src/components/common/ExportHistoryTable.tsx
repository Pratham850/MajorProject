import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Download, FileText } from 'lucide-react';
import { useToast } from '../ui/toast';
import { cn } from '../../lib/utils';

export interface ExportHistoryItem {
  id: string;
  exportDate: string;
  reportName: string;
  format: 'PDF' | 'CSV' | 'Parquet' | 'JSON';
  fileSize: string;
  status: 'Completed' | 'Processing' | 'Expired';
  checksum: string;
}

export interface ExportHistoryTableProps {
  historyItems: ExportHistoryItem[];
  className?: string;
}

export const ExportHistoryTable: React.FC<ExportHistoryTableProps> = ({
  historyItems,
  className,
}) => {
  const { addToast } = useToast();

  const handleDownload = (item: ExportHistoryItem) => {
    addToast({
      type: 'info',
      title: 'Downloading Export',
      message: `Downloading "${item.reportName}" (${item.format}).`,
    });
  };

  return (
    <Card className={cn('border-slate-200/80 dark:border-slate-800', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary-600" />
            <CardTitle className="text-sm font-bold">Export History & Checksum Verification Log</CardTitle>
          </div>
          <Badge variant="outline" size="sm">
            {historyItems.length} Downloads
          </Badge>
        </div>
        <CardDescription className="text-2xs">
          Immutable audit record of all compiled research dataset exports and report downloads.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-left text-2xs">
          <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 uppercase font-bold border-b border-slate-100 dark:border-slate-800">
            <tr>
              <th className="px-4 py-2.5">Export Date</th>
              <th className="px-4 py-2.5">Report Title</th>
              <th className="px-4 py-2.5">Format</th>
              <th className="px-4 py-2.5">File Size</th>
              <th className="px-4 py-2.5">SHA-256 Checksum</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {historyItems.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                <td className="px-4 py-2.5 font-mono text-slate-400">{item.exportDate}</td>
                <td className="px-4 py-2.5 font-bold text-slate-900 dark:text-white">{item.reportName}</td>
                <td className="px-4 py-2.5 font-mono font-semibold text-primary-600 dark:text-primary-400">{item.format}</td>
                <td className="px-4 py-2.5 font-mono text-slate-500">{item.fileSize}</td>
                <td className="px-4 py-2.5 font-mono text-slate-400 truncate max-w-[120px]">{item.checksum}</td>
                <td className="px-4 py-2.5">
                  <Badge variant={item.status === 'Completed' ? 'success' : item.status === 'Processing' ? 'warning' : 'secondary'} size="sm">
                    {item.status}
                  </Badge>
                </td>
                <td className="px-4 py-2.5 text-right">
                  {item.status === 'Completed' ? (
                    <Button variant="ghost" size="xs" onClick={() => handleDownload(item)} leftIcon={<Download className="w-3.5 h-3.5" />}>
                      Download
                    </Button>
                  ) : (
                    <span className="text-[10px] text-slate-400">Unavailable</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
};
