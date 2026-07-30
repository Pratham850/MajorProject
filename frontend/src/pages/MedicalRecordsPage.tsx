import React, { useState, useEffect, useMemo } from 'react';
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
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogFooter } from '../components/ui/dialog';
import { FileUpload } from '../components/common/FileUpload';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { MedicalRecordCard } from '../components/common/MedicalRecordCard';
import { Pagination } from '../components/common/Pagination';
import { useToast } from '../components/ui/toast';
import {
  medicalRecordService,
  uploadService,
  downloadService,
  MedicalRecordData,
} from '../services/medicalRecord.service';
import { cn } from '../lib/utils';

export interface MedicalRecordItem {
  id: string;
  title: string;
  category: string;
  doctorName: string;
  date: string;
  fileSize: string;
  verificationStatus: 'Verified' | 'Pending' | 'Encrypted';
  notes?: string;
  fileType?: string;
  sharingStatus?: string;
  sharedWith?: string[];
}

export const MedicalRecordsPage: React.FC = () => {
  const { addToast } = useToast();

  const [records, setRecords] = useState<MedicalRecordItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Modals state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadCategory, setUploadCategory] = useState<string>('Lab Report');
  const [isUploading, setIsUploading] = useState(false);
  const [previewRecord, setPreviewRecord] = useState<MedicalRecordItem | null>(null);
  const [deletingRecordId, setDeletingRecordId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Allowed Categories list
  const categories = ['ALL', 'Lab Report', 'Prescription', 'Immunization', 'Imaging'];

  // Fetch Records from FastAPI Backend on Mount
  const loadRecords = async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const data = await medicalRecordService.listRecords();
      const mapped: MedicalRecordItem[] = data.map((item) => ({
        id: item.id,
        title: item.title,
        category: item.category || 'Lab Report',
        doctorName: item.patientName || (item.sharedWith && item.sharedWith.length > 0 ? item.sharedWith[0] : 'Self Uploaded'),
        date: item.dateUploaded || new Date().toISOString().split('T')[0],
        fileSize: item.fileSize || '1.0 MB',
        verificationStatus: 'Verified',
        sharingStatus: item.sharingStatus || 'Private',
        sharedWith: item.sharedWith || [],
        notes: `Record ID ${item.id} (${item.category}). Encrypted file stored on secure storage vault.`,
      }));
      setRecords(mapped);
    } catch (err: any) {
      const msg = err.message || 'Failed to load medical records from backend server.';
      setApiError(msg);
      addToast({
        type: 'error',
        title: 'API Error',
        message: msg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  // Filtered Records based on search query and category
  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      const matchesSearch =
        rec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'ALL' || rec.category.toUpperCase() === selectedCategory.toUpperCase();

      return matchesSearch && matchesCategory;
    });
  }, [records, searchQuery, selectedCategory]);

  // Paginated Records
  const paginatedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredRecords.slice(startIndex, startIndex + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredRecords.length / pageSize);

  // UI Handlers
  const handleDownload = async (record: MedicalRecordItem) => {
    try {
      addToast({
        type: 'info',
        title: 'Downloading Record',
        message: `Requesting file stream for "${record.title}"...`,
      });
      await downloadService.downloadRecord(record.id, `${record.title}.pdf`);
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

  const handleDeleteConfirm = async () => {
    if (!deletingRecordId) return;
    setIsDeleting(true);
    try {
      await medicalRecordService.deleteRecord(deletingRecordId);
      setRecords((prev) => prev.filter((r) => r.id !== deletingRecordId));
      addToast({
        type: 'warning',
        title: 'Record Removed',
        message: `Medical record ${deletingRecordId} deleted successfully.`,
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

      const newItem: MedicalRecordItem = {
        id: uploadedRecord.id,
        title: uploadedRecord.title,
        category: uploadedRecord.category,
        doctorName: 'Self Uploaded',
        date: uploadedRecord.dateUploaded,
        fileSize: uploadedRecord.fileSize,
        verificationStatus: 'Verified',
        sharingStatus: 'Private',
        sharedWith: [],
        notes: `Self-uploaded file ${fileToUpload.name} encrypted and stored safely.`,
      };

      setRecords((prev) => [newItem, ...prev]);
      setIsUploadModalOpen(false);
      addToast({
        type: 'success',
        title: 'Record Uploaded',
        message: `Successfully uploaded and encrypted "${title}".`,
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Upload Failed',
        message: err.message || 'Failed to upload medical record to backend.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            My Medical Records
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Access, preview, download, and manage your encrypted clinical records.
          </p>
        </div>

        <Button
          onClick={() => setIsUploadModalOpen(true)}
          className="bg-gradient-to-r from-primary-600 to-indigo-600 text-white font-bold text-xs shadow-md hover:shadow-lg gap-2 shrink-0"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload Record</span>
        </Button>
      </div>

      {/* 2. Drag & Drop Quick Upload Area UI */}
      <Card className="border-slate-200/80 dark:border-slate-800 bg-gradient-to-r from-slate-50/50 to-primary-50/20 dark:from-slate-900/50 dark:to-slate-900/80">
        <CardContent className="p-6">
          <FileUpload onFilesSelected={handleFilesUploaded} />
        </CardContent>
      </Card>

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
            placeholder="Search by record title, ID, or physician..."
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

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">View:</span>
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
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

      {/* 4. Loading State & Records Content */}
      {isLoading ? (
        <Card className="border-slate-200/80 dark:border-slate-800 p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Fetching Medical Records...</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Connecting to FastAPI backend API service.</p>
        </Card>
      ) : filteredRecords.length === 0 ? (
        /* Empty State UI */
        <Card className="border-slate-200/80 dark:border-slate-800 p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No Medical Records Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
            No health records match your current search query or category filter. Try uploading a new record.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('ALL');
              }}
            >
              Clear Filters
            </Button>
            <Button size="sm" onClick={() => setIsUploadModalOpen(true)}>
              Upload New Record
            </Button>
          </div>
        </Card>
      ) : viewMode === 'grid' ? (
        /* Grid Layout */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedRecords.map((rec) => (
            <MedicalRecordCard
              key={rec.id}
              id={rec.id}
              title={rec.title}
              category={rec.category}
              doctorName={rec.doctorName}
              date={rec.date}
              fileSize={rec.fileSize}
              verificationStatus={rec.verificationStatus}
              onView={() => setPreviewRecord(rec)}
              onDownload={() => handleDownload(rec)}
              onDelete={() => setDeletingRecordId(rec.id)}
            />
          ))}
        </div>
      ) : (
        /* Table Layout */
        <Card className="border-slate-200/80 dark:border-slate-800 overflow-hidden">
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-3.5">Record ID & Title</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Doctor / Shared With</th>
                  <th className="px-6 py-3.5">Upload Date</th>
                  <th className="px-6 py-3.5">File Size</th>
                  <th className="px-6 py-3.5">Sharing Status</th>
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
                          <span className="text-2xs text-slate-400 font-mono block">{rec.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary" size="sm">{rec.category}</Badge>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-medium">{rec.doctorName}</td>
                    <td className="px-6 py-4 text-slate-400 font-mono">{rec.date}</td>
                    <td className="px-6 py-4 text-slate-400">{rec.fileSize}</td>
                    <td className="px-6 py-4">
                      <Badge variant={rec.sharingStatus === 'Shared' ? 'primary' : 'outline'} size="sm">
                        {rec.sharingStatus}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="xs" onClick={() => setPreviewRecord(rec)} title="Preview Details">
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="xs" onClick={() => handleDownload(rec)} title="Download File">
                          <Download className="w-3.5 h-3.5" />
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

      {/* Pagination */}
      {filteredRecords.length > pageSize && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
          totalItems={filteredRecords.length}
          pageSize={pageSize}
        />
      )}

      {/* 5. PREVIEW MODAL */}
      {previewRecord && (
        <Dialog
          isOpen={!!previewRecord}
          onClose={() => setPreviewRecord(null)}
          title={`Medical Record Telemetry: ${previewRecord.title}`}
          maxWidth="lg"
        >
          <div className="space-y-6 py-2">
            {/* Record Summary Banner */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Record ID</span>
                <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block font-mono">{previewRecord.id}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Category</span>
                <span className="font-semibold text-primary-600 dark:text-primary-400 mt-0.5 block">{previewRecord.category}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Upload Date</span>
                <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block font-mono">{previewRecord.date}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">File Size</span>
                <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block">{previewRecord.fileSize}</span>
              </div>
            </div>

            {/* Document Viewer Preview Box */}
            <div className="h-56 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
              <div className="p-4 bg-primary-50 dark:bg-primary-950/60 text-primary-600 rounded-2xl mb-3">
                <FileCode className="w-8 h-8" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Encrypted File Payload</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
                AES-256 encrypted payload preview for "{previewRecord.title}".
              </p>
              <div className="mt-3 flex items-center gap-2">
                <Badge variant="success" size="sm">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Verified File
                </Badge>
                <Badge variant="primary" size="sm">
                  <Lock className="w-3 h-3 mr-1" /> 256-Bit Encrypted
                </Badge>
              </div>
            </div>

            {/* Doctor / Sharing Details */}
            {previewRecord.sharedWith && previewRecord.sharedWith.length > 0 && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Consented Physicians
                </h4>
                <div className="flex flex-wrap gap-2">
                  {previewRecord.sharedWith.map((doc) => (
                    <Badge key={doc} variant="secondary" size="sm">
                      {doc}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setPreviewRecord(null)}>
                Close Details
              </Button>
              <Button size="sm" onClick={() => handleDownload(previewRecord)} leftIcon={<Download className="w-4 h-4" />}>
                Download Record File
              </Button>
            </DialogFooter>
          </div>
        </Dialog>
      )}

      {/* 6. UPLOAD MODAL */}
      <Dialog isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} title="Upload Medical Record" maxWidth="lg">
        <div className="space-y-4 py-2">
          <div>
            <label className="block text-2xs font-bold text-slate-500 uppercase mb-1">Select Record Category</label>
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
              <span>Encrypting and uploading file to backend server...</span>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => setIsUploadModalOpen(false)} disabled={isUploading}>
            Cancel
          </Button>
        </DialogFooter>
      </Dialog>

      {/* 7. DELETE CONFIRMATION DIALOG */}
      <ConfirmDialog
        isOpen={!!deletingRecordId}
        onClose={() => setDeletingRecordId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Medical Record?"
        description="Are you sure you want to remove this medical record? This action will delete the physical file and metadata entry from the server."
        confirmText={isDeleting ? 'Deleting...' : 'Yes, Delete Record'}
        variant="danger"
      />
    </div>
  );
};

export default MedicalRecordsPage;
