import React, { useState, useMemo, useEffect } from 'react';
import {
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  Grid,
  List as ListIcon,
  X,
  Plus,
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogFooter } from '../components/ui/dialog';
import { ExportHistoryTable, ExportHistoryItem } from '../components/common/ExportHistoryTable';
import { ScheduleExportModal } from '../components/common/ScheduleExportModal';
import { Pagination } from '../components/common/Pagination';
import { useToast } from '../components/ui/toast';
import { exportService, ExportReportItem } from '../services/export.service';
import { cn } from '../lib/utils';

export interface ReportItem {
  id: string;
  name: string;
  reportType: 'Cohort Summary' | 'Risk Evaluation' | 'Demographic Analysis' | 'Audit Log';
  datasetName: string;
  createdDate: string;
  status: 'Ready' | 'Processing' | 'Expired';
  format: 'PDF' | 'CSV' | 'Parquet' | 'JSON';
  fileSize: string;
  expirationDate: string;
  description: string;
}

const REPORT_LIBRARY_DATA: ReportItem[] = [
  {
    id: 'rep-101',
    name: 'Cardiology Cohort Telemetry Annual Summary 2026',
    reportType: 'Cohort Summary',
    datasetName: 'De-identified Cardiology Telemetry Cohort (2026)',
    createdDate: '2026-07-28',
    status: 'Ready',
    format: 'PDF',
    fileSize: '4.2 MB',
    expirationDate: '2026-10-28',
    description: 'Executive summary report detailing blood pressure telemetry, lipid panel metrics, and ECG waveform parameters from 18,450 anonymized cardiac patients.',
  },
  {
    id: 'rep-102',
    name: 'Pediatric Oncology Biomarkers Anonymized Payload',
    reportType: 'Demographic Analysis',
    datasetName: 'Pediatric Oncology Biomarkers & Genomic Variants',
    createdDate: '2026-07-25',
    status: 'Ready',
    format: 'Parquet',
    fileSize: '1.2 GB',
    expirationDate: '2026-10-25',
    description: 'Raw de-identified genomic variant call payload in Parquet binary format sanitized under Safe Harbor standards.',
  },
  {
    id: 'rep-103',
    name: 'Chronic Kidney Disease Risk Trajectory Audit',
    reportType: 'Risk Evaluation',
    datasetName: 'Population Chronic Kidney Disease Biomarker Set',
    createdDate: '2026-07-20',
    status: 'Ready',
    format: 'CSV',
    fileSize: '18 MB',
    expirationDate: '2026-10-20',
    description: 'Longitudinal renal biomarker evaluation tracking serum creatinine, blood urea, and urinary albumin progress.',
  },
];

const EXPORT_HISTORY_LOG_DATA: ExportHistoryItem[] = [
  {
    id: 'log-501',
    exportDate: '2026-07-28 08:30',
    reportName: 'Cardiology Cohort Telemetry Annual Summary 2026',
    format: 'PDF',
    fileSize: '4.2 MB',
    status: 'Completed',
    checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  },
  {
    id: 'log-502',
    exportDate: '2026-07-25 14:15',
    reportName: 'Pediatric Oncology Biomarkers Payload',
    format: 'Parquet',
    fileSize: '1.2 GB',
    status: 'Completed',
    checksum: 'f4a1c55398fd2d250bfbf5d9997fc93538bf52f5750c045db506002c8963c966',
  },
];

export const ReportCenterPage: React.FC = () => {
  const { addToast } = useToast();

  const [reports, setReports] = useState<ReportItem[]>(REPORT_LIBRARY_DATA);
  const [historyItems] = useState<ExportHistoryItem[]>(EXPORT_HISTORY_LOG_DATA);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Selected Report Details Panel Modal State
  const [selectedReportDetails, setSelectedReportDetails] = useState<ReportItem | null>(null);

  // Schedule Export Modal State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  // Filter Categories
  const typeFilters = ['ALL', 'Cohort Summary', 'Risk Evaluation', 'Demographic Analysis', 'Audit Log'];

  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true);
      try {
        const fetched = await exportService.listReports();
        if (fetched && fetched.length > 0) {
          const mapped: ReportItem[] = fetched.map((item, idx) => ({
            id: item.id || `rep-${idx + 100}`,
            name: item.name,
            reportType: (item.type || 'Cohort Summary') as any,
            datasetName: item.dataset || 'CKD Biomarkers Cohort',
            createdDate: item.createdDate || '2026-07-28',
            status: item.status === 'Completed' ? 'Ready' : 'Processing',
            format: (item.fileFormat?.includes('CSV') ? 'CSV' : item.fileFormat?.includes('Parquet') ? 'Parquet' : 'PDF') as any,
            fileSize: item.fileSize || '12 MB',
            expirationDate: item.expirationDate || '2026-12-31',
            description: item.description || 'Compiled cohort report.',
          }));
          setReports(mapped);
        }
      } catch (err: any) {
        console.warn('Export reports fetch info:', err?.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReports();
  }, []);

  // Filtered Reports calculation
  const filteredReports = useMemo(() => {
    return reports.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.datasetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.reportType.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType =
        selectedTypeFilter === 'ALL' || item.reportType.toUpperCase() === selectedTypeFilter.toUpperCase();

      return matchesSearch && matchesType;
    });
  }, [reports, searchQuery, selectedTypeFilter]);

  // Paginated Reports slice
  const paginatedReports = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredReports.slice(startIndex, startIndex + pageSize);
  }, [filteredReports, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredReports.length / pageSize);

  // Handlers
  const handleDownload = async (report: ReportItem) => {
    try {
      addToast({
        type: 'info',
        title: 'Downloading Report',
        message: `Downloading "${report.name}" (${report.format}).`,
      });
      await exportService.downloadReport(report.id, `${report.name.replace(/\s+/g, '_')}.csv`);
      addToast({
        type: 'success',
        title: 'Download Complete',
        message: `Report file downloaded.`,
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Download Failed',
        message: err.message || 'Unable to download report file from backend.',
      });
    }
  };

  const handleSaveScheduleSuccess = async (newSched: any) => {
    try {
      await exportService.scheduleExport({
        reportName: newSched.reportName,
        reportType: 'Cohort Summary',
        dataset: newSched.datasetName,
        exportFormat: newSched.format,
        frequency: newSched.frequency,
      });
    } catch (err: any) {
      console.warn('Backend export schedule info:', err?.message);
    }

    const newReport: ReportItem = {
      id: `rep-${Date.now()}`,
      name: newSched.reportName,
      reportType: 'Cohort Summary',
      datasetName: newSched.datasetName,
      createdDate: new Date().toISOString().split('T')[0],
      status: 'Ready',
      format: newSched.format,
      fileSize: '3.5 MB',
      expirationDate: '2026-11-01',
      description: `Automated scheduled export generated under ${newSched.frequency} cycle.`,
    };
    setReports([newReport, ...reports]);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 text-xs font-semibold mb-2">
            <FileText className="w-3.5 h-3.5" /> Compiled Reports & Dataset Export Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Export & Report Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Access compiled population health reports, schedule automated exports, and verify SHA-256 download checksums.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsScheduleModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Schedule New Export
        </Button>
      </div>

      {/* 2. Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Reports Library</span>
          <span className="text-xl font-black text-slate-900 dark:text-white font-mono block">{reports.length}</span>
          <span className="text-2xs text-slate-500">Ready for download</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider block">Active Schedules</span>
          <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono block">3</span>
          <span className="text-2xs text-slate-500">Weekly / Monthly cycles</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider block">Exported Volume</span>
          <span className="text-xl font-black text-indigo-600 dark:text-indigo-400 font-mono block">1.4 TB</span>
          <span className="text-2xs text-slate-500">Safe Harbor datasets</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Quota Remaining</span>
          <span className="text-xl font-black text-slate-700 dark:text-slate-300 font-mono block">8.6 TB</span>
          <span className="text-2xs text-slate-500">Of 10 TB monthly limit</span>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search report name, type, or dataset..."
            className="w-full bg-slate-100 dark:bg-slate-800/70 text-slate-900 dark:text-slate-100 text-xs rounded-xl pl-9 pr-8 py-2.5 border border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* View Switcher & Type Filters */}
        <div className="flex items-center gap-3 overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center gap-1.5 shrink-0">
            <Filter className="w-4 h-4 text-slate-400 shrink-0 mr-1" />
            {typeFilters.map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setSelectedTypeFilter(tab);
                  setCurrentPage(1);
                }}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all select-none',
                  selectedTypeFilter === tab
                    ? 'bg-primary-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800/70 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                )}
              >
                {tab === 'ALL' ? 'All Report Types' : tab}
              </button>
            ))}
          </div>

          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-1.5 rounded-lg text-xs font-bold transition-all',
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              )}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={cn(
                'p-1.5 rounded-lg text-xs font-bold transition-all',
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              )}
              title="Table View"
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Report Library List (Grid & Table View) */}
      {filteredReports.length === 0 ? (
        /* Empty State UI */
        <Card className="p-12 text-center border-slate-200/80 dark:border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No Reports Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
            No research reports match your current search query or report type filter.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery('');
              setSelectedTypeFilter('ALL');
            }}
            className="mt-4"
          >
            Reset Filters
          </Button>
        </Card>
      ) : viewMode === 'grid' ? (
        /* Grid Layout */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedReports.map((rep) => (
            <Card
              key={rep.id}
              className="p-5 flex flex-col justify-between hover:shadow-md transition-all duration-200 border-slate-200/80 dark:border-slate-800 space-y-4"
            >
              <div>
                {/* Header Status & Type Badges */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <Badge variant="primary" size="sm" dot>
                    {rep.reportType}
                  </Badge>
                  <Badge variant={rep.status === 'Ready' ? 'success' : rep.status === 'Processing' ? 'warning' : 'secondary'} size="sm">
                    {rep.status}
                  </Badge>
                </div>

                {/* Report Title & Description */}
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{rep.name}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {rep.description}
                </p>

                {/* Format & Size Metadata */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-2xs text-slate-400 font-mono">
                  <span>Format: <strong>{rep.format}</strong> ({rep.fileSize})</span>
                  <span>Created: {rep.createdDate}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                <Button variant="ghost" size="xs" onClick={() => setSelectedReportDetails(rep)} leftIcon={<Eye className="w-3.5 h-3.5" />}>
                  Details
                </Button>
                {rep.status === 'Ready' ? (
                  <Button variant="success" size="xs" onClick={() => handleDownload(rep)} leftIcon={<Download className="w-3.5 h-3.5" />}>
                    Download
                  </Button>
                ) : (
                  <span className="text-2xs text-slate-400">Unavailable</span>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        /* Table Layout */
        <Card className="border-slate-200/80 dark:border-slate-800 overflow-hidden">
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-3.5">Report Title</th>
                  <th className="px-6 py-3.5">Report Type</th>
                  <th className="px-6 py-3.5">Format</th>
                  <th className="px-6 py-3.5">File Size</th>
                  <th className="px-6 py-3.5">Created Date</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paginatedReports.map((rep) => (
                  <tr key={rep.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-primary-600 shrink-0" />
                      <span className="line-clamp-1">{rep.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="primary" size="sm">{rep.reportType}</Badge>
                    </td>
                    <td className="px-6 py-4 font-mono font-semibold text-slate-700 dark:text-slate-300">{rep.format}</td>
                    <td className="px-6 py-4 text-slate-500 font-mono">{rep.fileSize}</td>
                    <td className="px-6 py-4 text-slate-400 font-mono">{rep.createdDate}</td>
                    <td className="px-6 py-4">
                      <Badge variant={rep.status === 'Ready' ? 'success' : rep.status === 'Processing' ? 'warning' : 'secondary'} size="sm">
                        {rep.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="xs" onClick={() => setSelectedReportDetails(rep)} title="Report Details">
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        {rep.status === 'Ready' && (
                          <Button variant="ghost" size="xs" onClick={() => handleDownload(rep)} title="Download File">
                            <Download className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* 5. Pagination Controls */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
        totalItems={filteredReports.length}
        pageSize={pageSize}
      />

      {/* 6. EXPORT HISTORY LOG TABLE */}
      <ExportHistoryTable historyItems={historyItems} />

      {/* 7. REPORT DETAILS PANEL MODAL */}
      {selectedReportDetails && (
        <Dialog
          isOpen={!!selectedReportDetails}
          onClose={() => setSelectedReportDetails(null)}
          title={`Report Metadata & Details: ${selectedReportDetails.name}`}
          maxWidth="lg"
        >
          <div className="space-y-6 py-2 text-xs">
            {/* Header info grid */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Report Type</span>
                <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">{selectedReportDetails.reportType}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Export Format & Size</span>
                <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block font-mono">{selectedReportDetails.format} ({selectedReportDetails.fileSize})</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Generated Date</span>
                <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block font-mono">{selectedReportDetails.createdDate}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Expiration Date</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5 block font-mono">{selectedReportDetails.expirationDate}</span>
              </div>
            </div>

            {/* Description & Dataset Target */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Target Anonymized Dataset</h4>
              <p className="text-sm font-bold text-primary-600 dark:text-primary-400 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                {selectedReportDetails.datasetName}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Report Abstract & Scope</h4>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                {selectedReportDetails.description}
              </p>
            </div>

            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setSelectedReportDetails(null)}>
                Close
              </Button>
              {selectedReportDetails.status === 'Ready' && (
                <Button size="sm" onClick={() => handleDownload(selectedReportDetails)} leftIcon={<Download className="w-4 h-4" />}>
                  Download {selectedReportDetails.format} File
                </Button>
              )}
            </DialogFooter>
          </div>
        </Dialog>
      )}

      {/* 8. SCHEDULE EXPORT MODAL */}
      <ScheduleExportModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onSaveSuccess={handleSaveScheduleSuccess}
      />
    </div>
  );
};

export default ReportCenterPage;
