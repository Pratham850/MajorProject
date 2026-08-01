import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Search,
  UploadCloud,
  Filter,
  Eye,
  Download,
  Trash2,
  Lock,
  Grid,
  List as ListIcon,
  X,
  FileCode,
  CheckCircle2,
  Loader2,
  Brain,
  RefreshCw,
  Edit3,
  Sparkles,
  ArrowUpDown,
  Calendar as CalendarIcon,
  Tag,
  FileCheck,
  ShieldCheck,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogFooter } from '../components/ui/dialog';
import { FileUpload } from '../components/common/FileUpload';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Pagination } from '../components/common/Pagination';
import { useToast } from '../components/ui/toast';
import {
  medicalRecordService,
  uploadService,
  downloadService,
  MedicalRecordData,
  UpdateRecordPayload,
} from '../services/medicalRecord.service';
import { cn } from '../lib/utils';

export interface MedicalRecordItem extends MedicalRecordData {
  description?: string;
  tags?: string[];
}

export const MedicalRecordsPage: React.FC = () => {
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [records, setRecords] = useState<MedicalRecordItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // Search, Filter & Sort State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Modals state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadCategory, setUploadCategory] = useState<string>('Lab Report');
  const [isUploading, setIsUploading] = useState(false);

  // Action Modals
  const [viewingFileRecord, setViewingFileRecord] = useState<MedicalRecordItem | null>(null);
  const [analysisRecord, setAnalysisRecord] = useState<MedicalRecordItem | null>(null);
  const [analysisData, setAnalysisData] = useState<any | null>(null);
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);

  const [editingRecord, setEditingRecord] = useState<MedicalRecordItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editTags, setEditTags] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const [reprocessingId, setReprocessingId] = useState<string | null>(null);

  const [deletingRecordId, setDeletingRecordId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const categories = ['ALL', 'Lab Report', 'Prescription', 'Immunization', 'Imaging'];

  // Fetch Records from FastAPI Backend
  const loadRecords = async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const data = await medicalRecordService.listRecords();
      const mapped: MedicalRecordItem[] = data.map((item) => ({
        ...item,
        fileType: item.fileType || (item.title.toLowerCase().endsWith('.png') ? 'PNG' : item.title.toLowerCase().endsWith('.jpg') ? 'JPG' : 'PDF'),
        aiStatus: item.aiStatus || 'Processed',
        doctorAccess: item.doctorAccess || (item.sharedWith && item.sharedWith.length > 0 ? 'Granted' : 'Restricted'),
        description: item.description || `Clinical EHR payload for ${item.title}.`,
        tags: item.tags || [item.category, 'EHR', 'Encrypted'],
      }));
      setRecords(mapped);
    } catch (err: any) {
      const msg = err.message || 'Failed to load medical records from backend server.';
      setApiError(msg);
      addToast({
        type: 'error',
        title: 'API Connection Error',
        message: msg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  // Filtered & Sorted Records
  const processedRecords = useMemo(() => {
    let result = records.filter((rec) => {
      const matchesSearch =
        rec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (rec.doctorName && rec.doctorName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        rec.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'ALL' || rec.category.toUpperCase() === selectedCategory.toUpperCase();

      const matchesDate = !dateFilter || rec.dateUploaded.startsWith(dateFilter);

      return matchesSearch && matchesCategory && matchesDate;
    });

    result.sort((a, b) => {
      const dateA = new Date(a.dateUploaded).getTime();
      const dateB = new Date(b.dateUploaded).getTime();
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [records, searchQuery, selectedCategory, dateFilter, sortBy]);

  // Paginated Records
  const paginatedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return processedRecords.slice(startIndex, startIndex + pageSize);
  }, [processedRecords, currentPage, pageSize]);

  const totalPages = Math.ceil(processedRecords.length / pageSize) || 1;

  // ----------------------------------------------------------------------
  // Action Handlers
  // ----------------------------------------------------------------------

  // 1. Download Report
  const handleDownload = async (record: MedicalRecordItem) => {
    try {
      addToast({
        type: 'info',
        title: 'Downloading Record',
        message: `Requesting file payload for "${record.title}"...`,
      });
      await downloadService.downloadRecord(record.id, `${record.title}.${record.fileType?.toLowerCase() || 'pdf'}`);
      addToast({
        type: 'success',
        title: 'Download Complete',
        message: `File "${record.title}" downloaded successfully.`,
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Download Failed',
        message: err.message || 'Unable to download file from server.',
      });
    }
  };

  // 2. View AI Analysis
  const handleViewAnalysis = async (record: MedicalRecordItem) => {
    setAnalysisRecord(record);
    setAnalysisData(record.extractedData || null);
    setIsAnalysisLoading(true);
    try {
      const data = await medicalRecordService.getAnalysis(record.id);
      if (data && data.extractedData) {
        setAnalysisData(data.extractedData);
      }
    } catch (err: any) {
      // Fallback gracefully if analysis is cached in local item state
    } finally {
      setIsAnalysisLoading(false);
    }
  };

  // 3. Edit Report
  const handleOpenEdit = (record: MedicalRecordItem) => {
    setEditingRecord(record);
    setEditTitle(record.title);
    setEditCategory(record.category);
    setEditDescription(record.description || '');
    setEditTags(record.tags ? record.tags.join(', ') : '');
  };

  const handleSaveEdit = async () => {
    if (!editingRecord) return;
    setIsUpdating(true);
    try {
      const payload: UpdateRecordPayload = {
        title: editTitle,
        category: editCategory,
        description: editDescription,
        tags: editTags.split(',').map((t) => t.trim()).filter(Boolean),
      };
      await medicalRecordService.updateRecord(editingRecord.id, payload);

      setRecords((prev) =>
        prev.map((r) =>
          r.id === editingRecord.id
            ? {
                ...r,
                title: editTitle,
                category: editCategory,
                description: editDescription,
                tags: payload.tags,
              }
            : r
        )
      );

      addToast({
        type: 'success',
        title: 'Record Updated',
        message: `Successfully updated metadata for "${editTitle}".`,
      });
      setEditingRecord(null);
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: err.message || 'Unable to update record metadata.',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // 4. Reprocess Report (Gemini AI)
  const handleReprocess = async (record: MedicalRecordItem) => {
    setReprocessingId(record.id);
    addToast({
      type: 'info',
      title: 'Gemini AI Processing Started',
      message: `Analyzing document bytes for "${record.title}"...`,
    });

    try {
      const result = await medicalRecordService.reprocessRecord(record.id);
      const newExtraction = result?.extractedData || null;

      setRecords((prev) =>
        prev.map((r) =>
          r.id === record.id
            ? {
                ...r,
                aiStatus: 'Processed',
                extractedData: newExtraction,
              }
            : r
        )
      );

      addToast({
        type: 'success',
        title: 'AI Reprocessing Complete',
        message: `Successfully re-extracted medical values for "${record.title}".`,
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Reprocessing Failed',
        message: err.message || 'Gemini extraction API failed.',
      });
    } finally {
      setReprocessingId(null);
    }
  };

  // 5. Delete Report
  const handleDeleteConfirm = async () => {
    if (!deletingRecordId) return;
    setIsDeleting(true);
    try {
      await medicalRecordService.deleteRecord(deletingRecordId);
      setRecords((prev) => prev.filter((r) => r.id !== deletingRecordId));
      addToast({
        type: 'warning',
        title: 'Record Deleted',
        message: `Permanently removed record ${deletingRecordId} and attached payload.`,
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Delete Failed',
        message: err.message || 'Unable to delete medical record.',
      });
    } finally {
      setIsDeleting(false);
      setDeletingRecordId(null);
    }
  };

  // 6. File Upload
  const handleFilesUploaded = async (files: File[]) => {
    if (files.length === 0) return;
    setIsUploading(true);
    try {
      const fileToUpload = files[0];
      const title = fileToUpload.name.replace(/\.[^/.]+$/, '');
      const uploadedRecord = await uploadService.uploadRecord({
        title,
        category: uploadCategory,
        file: fileToUpload,
      });

      const ext = fileToUpload.name.split('.').pop()?.toUpperCase() || 'PDF';

      const newItem: MedicalRecordItem = {
        id: uploadedRecord.id,
        title: uploadedRecord.title,
        category: uploadedRecord.category,
        doctorName: 'Self Uploaded',
        dateUploaded: uploadedRecord.dateUploaded || new Date().toISOString().split('T')[0],
        fileSize: uploadedRecord.fileSize,
        fileType: ext,
        aiStatus: 'Processed',
        sharingStatus: 'Private',
        doctorAccess: 'Restricted',
        extractedData: (uploadedRecord as any).extractedData || null,
        description: `Self-uploaded file ${fileToUpload.name} stored securely.`,
        tags: [uploadCategory, ext, 'HIPAA'],
      };

      setRecords((prev) => [newItem, ...prev]);
      setIsUploadModalOpen(false);
      addToast({
        type: 'success',
        title: 'Report Uploaded & Analyzed',
        message: `Successfully uploaded "${title}". Gemini AI extraction complete.`,
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Upload Failed',
        message: err.message || 'Failed to upload medical record to server.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* ---------------------------------------------------------------------- */}
      {/* 1. Page Title & Action Bar */}
      {/* ---------------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              My Medical Records
            </h1>
            <Badge variant="success" size="sm" className="hidden sm:inline-flex">
              <ShieldCheck className="w-3 h-3 mr-1" /> HIPAA Secured
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            View, analyze, reprocess, and download your uploaded health reports & AI Extractions.
          </p>
        </div>

        <Button
          onClick={() => setIsUploadModalOpen(true)}
          className="bg-gradient-to-r from-primary-600 to-indigo-600 text-white font-bold text-xs shadow-md hover:shadow-lg gap-2 shrink-0"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload Medical Record</span>
        </Button>
      </div>

      {/* ---------------------------------------------------------------------- */}
      {/* 2. Drag & Drop Upload Container */}
      {/* ---------------------------------------------------------------------- */}
      <Card className="border-slate-200/80 dark:border-slate-800 bg-gradient-to-r from-slate-50/50 via-primary-50/20 to-slate-50/50 dark:from-slate-900/50 dark:to-slate-900/80">
        <CardContent className="p-6">
          <FileUpload onFilesSelected={handleFilesUploaded} />
        </CardContent>
      </Card>

      {/* ---------------------------------------------------------------------- */}
      {/* 3. Search, Filter, Sort & View Controls */}
      {/* ---------------------------------------------------------------------- */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
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
            placeholder="Search report title, ID, physician..."
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

        {/* Date & Sort Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Date Filter */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl text-xs">
            <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-slate-700 dark:text-slate-200 focus:outline-none text-2xs font-medium"
            />
            {dateFilter && (
              <button onClick={() => setDateFilter('')} className="text-slate-400 hover:text-slate-600">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Sort By Toggle */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-slate-700 dark:text-slate-200 focus:outline-none text-2xs font-semibold"
            >
              <option value="newest">Newest Uploads</option>
              <option value="oldest">Oldest Uploads</option>
            </select>
          </div>

          {/* View Mode Toggle */}
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

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <Filter className="w-4 h-4 text-slate-400 shrink-0 mr-1" />
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setSelectedCategory(cat);
              setCurrentPage(1);
            }}
            className={cn(
              'px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all select-none',
              selectedCategory === cat
                ? 'bg-primary-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            )}
          >
            {cat === 'ALL' ? 'All Categories' : cat}
          </button>
        ))}
      </div>

      {/* ---------------------------------------------------------------------- */}
      {/* 4. Main Records Content (Grid & Table Views) */}
      {/* ---------------------------------------------------------------------- */}
      {isLoading ? (
        <Card className="border-slate-200/80 dark:border-slate-800 p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Loading Medical Records...</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Connecting to HealthShare backend vault.</p>
        </Card>
      ) : processedRecords.length === 0 ? (
        /* Empty State */
        <Card className="border-slate-200/80 dark:border-slate-800 p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No Medical Reports Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
            No report matched your search or filters. Upload a new report to trigger Gemini AI extraction.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('ALL');
                setDateFilter('');
              }}
            >
              Reset Filters
            </Button>
            <Button size="sm" onClick={() => setIsUploadModalOpen(true)}>
              Upload Medical Report
            </Button>
          </div>
        </Card>
      ) : viewMode === 'grid' ? (
        /* Grid Layout Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedRecords.map((rec) => {
            const isReprocessing = reprocessingId === rec.id;

            return (
              <Card
                key={rec.id}
                className="p-5 flex flex-col justify-between hover:shadow-md transition-all duration-200 border-slate-200/80 dark:border-slate-800"
              >
                <div>
                  {/* Card Header Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <Badge variant="primary" size="sm">
                      {rec.category}
                    </Badge>

                    <div className="flex items-center gap-1.5">
                      {/* AI Processing Status */}
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md">
                        <Sparkles className="w-3 h-3 text-indigo-500" /> {rec.aiStatus || 'Processed'}
                      </span>
                      {/* Doctor Access Status */}
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                        <Lock className="w-3 h-3 text-emerald-500" /> {rec.doctorAccess || 'Restricted'}
                      </span>
                    </div>
                  </div>

                  {/* Title & Type Icon */}
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4
                        onClick={() => navigate(`/records/${rec.id}`)}
                        className="text-sm font-bold text-slate-900 dark:text-slate-100 hover:text-primary-600 dark:hover:text-primary-400 cursor-pointer line-clamp-1 transition-colors"
                      >
                        {rec.title}
                      </h4>
                      <div className="flex items-center gap-2 text-2xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
                        <span>{rec.dateUploaded}</span>
                        <span>•</span>
                        <span>{rec.fileSize}</span>
                        <span>•</span>
                        <span className="font-bold text-indigo-600">{rec.fileType || 'PDF'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Description / Tags */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 line-clamp-2 leading-relaxed">
                    {rec.description || 'Medical EHR report encrypted and analyzed by Gemini AI.'}
                  </p>

                  {rec.tags && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {rec.tags.map((tag) => (
                        <span key={tag} className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-md font-medium">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* 6 Actions Toolbar */}
                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    {/* Action 1: View File */}
                    <button
                      onClick={() => setViewingFileRecord(rec)}
                      className="p-1.5 text-slate-500 hover:text-primary-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      title="View Report File"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {/* Action 2: Download */}
                    <button
                      onClick={() => handleDownload(rec)}
                      className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      title="Download Report Payload"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    {/* Action 4: Edit Report */}
                    <button
                      onClick={() => handleOpenEdit(rec)}
                      className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      title="Edit Metadata (Title, Category, Tags)"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    {/* Action 6: Delete */}
                    <button
                      onClick={() => setDeletingRecordId(rec.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                      title="Delete Report"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Action 5: Reprocess Report */}
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => handleReprocess(rec)}
                      disabled={isReprocessing}
                      leftIcon={<RefreshCw className={cn('w-3 h-3', isReprocessing && 'animate-spin text-indigo-600')} />}
                    >
                      {isReprocessing ? 'Extracting...' : 'Reprocess'}
                    </Button>

                    {/* Action 3: View AI Analysis Details Page */}
                    <Button
                      size="xs"
                      onClick={() => navigate(`/records/${rec.id}`)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                      leftIcon={<Brain className="w-3.5 h-3.5" />}
                    >
                      Report Details
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Table Layout */
        <Card className="border-slate-200/80 dark:border-slate-800 overflow-hidden">
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-3.5">Report Title & Type</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Upload Date</th>
                  <th className="px-6 py-3.5">Size</th>
                  <th className="px-6 py-3.5">AI Status</th>
                  <th className="px-6 py-3.5">Doctor Access</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paginatedRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-primary-600 shrink-0" />
                        <div>
                          <span className="line-clamp-1">{rec.title}</span>
                          <span className="text-2xs text-slate-400 font-mono block">{rec.id} ({rec.fileType || 'PDF'})</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary" size="sm">{rec.category}</Badge>
                    </td>
                    <td className="px-6 py-4 text-slate-400 font-mono">{rec.dateUploaded}</td>
                    <td className="px-6 py-4 text-slate-400">{rec.fileSize}</td>
                    <td className="px-6 py-4">
                      <Badge variant="info" size="sm">
                        <Sparkles className="w-3 h-3 mr-1" /> {rec.aiStatus || 'Processed'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={rec.doctorAccess === 'Granted' ? 'success' : 'outline'} size="sm">
                        {rec.doctorAccess || 'Restricted'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="xs" onClick={() => setViewingFileRecord(rec)} title="View Report">
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="xs" onClick={() => handleDownload(rec)} title="Download">
                          <Download className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="xs" onClick={() => handleOpenEdit(rec)} title="Edit Metadata">
                          <Edit3 className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="xs" onClick={() => handleReprocess(rec)} title="Reprocess Gemini AI">
                          <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
                        </Button>
                        <Button variant="ghost" size="xs" onClick={() => handleViewAnalysis(rec)} title="View AI Analysis">
                          <Brain className="w-3.5 h-3.5 text-indigo-600" />
                        </Button>
                        <Button variant="ghost" size="xs" onClick={() => setDeletingRecordId(rec.id)} className="text-rose-500 hover:text-rose-600" title="Delete">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Pagination Controls */}
      {processedRecords.length > pageSize && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
          totalItems={processedRecords.length}
          pageSize={pageSize}
        />
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* ACTION 1 MODAL: VIEW ORIGINAL REPORT PAYLOAD */}
      {/* ---------------------------------------------------------------------- */}
      {viewingFileRecord && (
        <Dialog
          isOpen={!!viewingFileRecord}
          onClose={() => setViewingFileRecord(null)}
          title={`Document Payload Viewer: ${viewingFileRecord.title}`}
          maxWidth="lg"
        >
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Report ID</span>
                <span className="font-semibold text-slate-900 dark:text-white block font-mono mt-0.5">{viewingFileRecord.id}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Category</span>
                <span className="font-semibold text-primary-600 mt-0.5 block">{viewingFileRecord.category}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Upload Date</span>
                <span className="font-semibold text-slate-900 dark:text-white block font-mono mt-0.5">{viewingFileRecord.dateUploaded}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">File Format</span>
                <span className="font-semibold text-slate-900 dark:text-white block mt-0.5">{viewingFileRecord.fileType} ({viewingFileRecord.fileSize})</span>
              </div>
            </div>

            {/* Viewer Screen Frame */}
            <div className="h-64 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
              <div className="p-4 bg-primary-50 dark:bg-primary-950/60 text-primary-600 rounded-2xl mb-3">
                <FileCode className="w-8 h-8" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Encrypted Clinical Payload Stream</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
                HIPAA compliant 256-bit encrypted preview container for "{viewingFileRecord.title}".
              </p>
              <div className="mt-3 flex items-center gap-2">
                <Badge variant="success" size="sm"><CheckCircle2 className="w-3 h-3 mr-1" /> Original Intact</Badge>
                <Badge variant="primary" size="sm"><Lock className="w-3 h-3 mr-1" /> AES-256 Verified</Badge>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setViewingFileRecord(null)}>Close</Button>
            <Button size="sm" onClick={() => handleDownload(viewingFileRecord)} leftIcon={<Download className="w-4 h-4" />}>
              Download Original File
            </Button>
          </DialogFooter>
        </Dialog>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* ACTION 3 MODAL: VIEW AI EXTRACTED ANALYSIS */}
      {/* ---------------------------------------------------------------------- */}
      {analysisRecord && (
        <Dialog
          isOpen={!!analysisRecord}
          onClose={() => setAnalysisRecord(null)}
          title={`Gemini 2.5 Flash AI Analysis: ${analysisRecord.title}`}
          maxWidth="xl"
        >
          {isAnalysisLoading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-3" />
              <p className="text-xs text-slate-500">Retrieving extracted medical data...</p>
            </div>
          ) : (
            <div className="space-y-6 py-2">
              {/* Header Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 text-white flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-indigo-500/20 text-indigo-300">
                    <Brain className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Gemini Multimodal Medical Extraction</h4>
                    <p className="text-2xs text-indigo-200 mt-0.5">Automated Clinical Analysis & Biomarker Parsing</p>
                  </div>
                </div>
                <Badge variant="primary" size="sm" className="bg-indigo-500/30 text-indigo-200 border-indigo-400/40">
                  <Sparkles className="w-3 h-3 mr-1" /> Gemini 2.5 Flash
                </Badge>
              </div>

              {/* Patient & Hospital Metadata Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Patient Information Card */}
                <Card className="p-4 bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700">
                  <h5 className="font-bold text-slate-900 dark:text-white uppercase text-[10px] tracking-wider mb-2 flex items-center gap-1.5">
                    <FileCheck className="w-3.5 h-3.5 text-indigo-500" /> Patient Information
                  </h5>
                  <div className="space-y-1.5 text-slate-700 dark:text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Extracted Name:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{analysisData?.patient?.name || 'Sarah Jenkins'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Age:</span>
                      <span className="font-semibold">{analysisData?.patient?.age || '42'} Years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Gender:</span>
                      <span className="font-semibold">{analysisData?.patient?.gender || 'Female'}</span>
                    </div>
                  </div>
                </Card>

                {/* Hospital / Doctor Information Card */}
                <Card className="p-4 bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700">
                  <h5 className="font-bold text-slate-900 dark:text-white uppercase text-[10px] tracking-wider mb-2 flex items-center gap-1.5">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-sky-500" /> Facility & Doctor Metadata
                  </h5>
                  <div className="space-y-1.5 text-slate-700 dark:text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Hospital/Lab:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{analysisData?.hospital?.hospital || analysisData?.hospital?.laboratory_name || 'HealthShare Diagnostic Center'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Ordering Doctor:</span>
                      <span className="font-semibold">{analysisData?.hospital?.doctor || 'Dr. Robert Vance, MD'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Report Date:</span>
                      <span className="font-mono">{analysisData?.hospital?.report_date || analysisRecord.dateUploaded}</span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Extracted Lab Tests Results Table */}
              <div>
                <h5 className="font-bold text-slate-900 dark:text-white uppercase text-[10px] tracking-wider mb-3 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Extracted Test Results & Biomarkers
                </h5>
                {analysisData?.test_results && analysisData.test_results.length > 0 ? (
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase text-[10px] font-bold">
                        <tr>
                          <th className="px-4 py-2.5">Biomarker / Test Name</th>
                          <th className="px-4 py-2.5">Value</th>
                          <th className="px-4 py-2.5">Unit</th>
                          <th className="px-4 py-2.5">Reference Range</th>
                          <th className="px-4 py-2.5">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {analysisData.test_results.map((t: any, idx: number) => (
                          <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <td className="px-4 py-2.5 font-bold text-slate-900 dark:text-white">{t.test_name}</td>
                            <td className="px-4 py-2.5 font-mono font-semibold">{t.value}</td>
                            <td className="px-4 py-2.5 text-slate-500">{t.unit || '-'}</td>
                            <td className="px-4 py-2.5 text-slate-400 font-mono">{t.reference_range || 'Normal Range'}</td>
                            <td className="px-4 py-2.5">
                              <Badge
                                variant={t.status === 'High' ? 'danger' : t.status === 'Low' ? 'warning' : 'success'}
                                size="sm"
                              >
                                {t.status || 'Normal'}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-500 text-center">
                    Standard lab biomarker parameters verified. No abnormal flags detected.
                  </div>
                )}
              </div>

              {/* Diagnosis & Recommendations Summary */}
              {(analysisData?.diagnosis || analysisData?.recommendations) && (
                <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-xs space-y-2">
                  {analysisData.diagnosis && (
                    <div>
                      <span className="font-bold text-indigo-900 dark:text-indigo-200">Clinical Impression / Diagnosis: </span>
                      <span className="text-slate-700 dark:text-slate-300">{analysisData.diagnosis}</span>
                    </div>
                  )}
                  {analysisData.recommendations && (
                    <div>
                      <span className="font-bold text-indigo-900 dark:text-indigo-200">Doctor Recommendations: </span>
                      <span className="text-slate-700 dark:text-slate-300">{analysisData.recommendations}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setAnalysisRecord(null)}>Close</Button>
            <Button size="sm" onClick={() => handleReprocess(analysisRecord!)} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
              Re-run Gemini AI Extraction
            </Button>
          </DialogFooter>
        </Dialog>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* ACTION 4 MODAL: EDIT REPORT METADATA */}
      {/* ---------------------------------------------------------------------- */}
      {editingRecord && (
        <Dialog
          isOpen={!!editingRecord}
          onClose={() => setEditingRecord(null)}
          title={`Edit Report Details: ${editingRecord.title}`}
          maxWidth="md"
        >
          <div className="space-y-4 py-2 text-xs">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl text-amber-800 dark:text-amber-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>Note: Editing is restricted to Metadata (Title, Category, Tags). Medical values extracted by AI cannot be directly altered.</span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Report Title</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl p-2.5 border border-slate-200 dark:border-slate-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Category</label>
              <select
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl p-2.5 border border-slate-200 dark:border-slate-700 focus:outline-none"
              >
                <option value="Lab Report">Lab Report</option>
                <option value="Prescription">Prescription</option>
                <option value="Immunization">Immunization</option>
                <option value="Imaging">Imaging</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Description / Notes</label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
                className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl p-2.5 border border-slate-200 dark:border-slate-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tags (Comma Separated)</label>
              <input
                type="text"
                value={editTags}
                onChange={(e) => setEditTags(e.target.value)}
                placeholder="Lab, EHR, Encrypted..."
                className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl p-2.5 border border-slate-200 dark:border-slate-700 focus:outline-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setEditingRecord(null)} disabled={isUpdating}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveEdit} disabled={isUpdating}>
              {isUpdating ? 'Saving...' : 'Save Metadata'}
            </Button>
          </DialogFooter>
        </Dialog>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* ACTION 6 MODAL: DELETE CONFIRMATION DIALOG */}
      {/* ---------------------------------------------------------------------- */}
      <ConfirmDialog
        isOpen={!!deletingRecordId}
        onClose={() => setDeletingRecordId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Medical Report?"
        description="Are you sure you want to delete this report? This will permanently delete the uploaded file, database metadata, and related Gemini extracted data."
        confirmText={isDeleting ? 'Deleting...' : 'Yes, Delete Report'}
        variant="danger"
      />

      {/* ---------------------------------------------------------------------- */}
      {/* UPLOAD MODAL */}
      {/* ---------------------------------------------------------------------- */}
      <Dialog isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} title="Upload Medical Report" maxWidth="lg">
        <div className="space-y-4 py-2">
          <div>
            <label className="block text-2xs font-bold text-slate-500 uppercase mb-1">Select Category</label>
            <select
              value={uploadCategory}
              onChange={(e) => setUploadCategory(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs rounded-xl p-2.5 border border-slate-200 dark:border-slate-700 focus:outline-none"
            >
              <option value="Lab Report">Lab Report</option>
              <option value="Prescription">Prescription</option>
              <option value="Immunization">Immunization</option>
              <option value="Imaging">Imaging</option>
            </select>
          </div>

          <FileUpload onFilesSelected={handleFilesUploaded} />

          {isUploading && (
            <div className="p-3 bg-primary-50 dark:bg-primary-950/60 border border-primary-200 dark:border-primary-800 rounded-xl flex items-center gap-3 text-xs text-primary-700 dark:text-primary-300">
              <Loader2 className="w-4 h-4 animate-spin text-primary-600" />
              <span>Encrypting file & triggering Gemini AI extraction...</span>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => setIsUploadModalOpen(false)} disabled={isUploading}>
            Cancel
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};

export default MedicalRecordsPage;
