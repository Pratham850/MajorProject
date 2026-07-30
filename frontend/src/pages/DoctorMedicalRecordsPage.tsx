import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Search,
  Filter,
  Eye,
  Download,
  Grid,
  List as ListIcon,
  X,
  ShieldCheck,
  User,
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { MedicalRecordCard } from '../components/common/MedicalRecordCard';
import { RecordPreviewModal, RecordPreviewItem } from '../components/common/RecordPreviewModal';
import { Pagination } from '../components/common/Pagination';
import { useToast } from '../components/ui/toast';
import { medicalRecordService, downloadService } from '../services/medicalRecord.service';
import { cn } from '../lib/utils';

const DOCTOR_RECORDS_DATA: RecordPreviewItem[] = [
  {
    id: 'rec-201',
    title: 'Comprehensive Metabolic Panel & Lipid Profile',
    category: 'Lab Result',
    patientName: 'Eleanor Vance',
    doctorName: 'Dr. Sarah Jenkins',
    date: '2026-07-28',
    fileSize: '3.8 MB',
    fileType: 'PDF Document',
    verificationStatus: 'Verified',
    notes: 'Lipid panel indicates total cholesterol 220 mg/dL. Fasting glucose normal at 105 mg/dL.',
  },
  {
    id: 'rec-202',
    title: '12-Lead Electrocardiogram (ECG) Tracing Report',
    category: 'EHR',
    patientName: 'Marcus Brody',
    doctorName: 'Dr. Sarah Jenkins',
    date: '2026-07-27',
    fileSize: '5.2 MB',
    fileType: 'EHR Data Standard (.FHIR)',
    verificationStatus: 'Verified',
    notes: 'Normal sinus rhythm at 68 bpm. Minimal ST elevation in leads V2-V4 requiring routine follow-up.',
  },
  {
    id: 'rec-203',
    title: 'High-Resolution Chest CT Digital Imaging',
    category: 'Radiology',
    patientName: 'Arthur Pendelton',
    doctorName: 'Dr. Emily Watson',
    date: '2026-07-20',
    fileSize: '24.1 MB',
    fileType: 'Medical Image (.DICOM)',
    verificationStatus: 'Verified',
    notes: 'Bilateral lung fields clear of focal infiltrates. Cardiac silhouette normal size.',
  },
  {
    id: 'rec-204',
    title: 'Cardiovascular Risk Factor Biomarker Assessment',
    category: 'Lab Result',
    patientName: 'Clara Oswald',
    doctorName: 'Dr. Sarah Jenkins',
    date: '2026-07-15',
    fileSize: '2.9 MB',
    fileType: 'PDF Document',
    verificationStatus: 'Verified',
    notes: 'Hs-CRP elevated at 3.2 mg/L. Recommending lifestyle modification and follow-up panel in 60 days.',
  },
  {
    id: 'rec-205',
    title: 'Renal Function & Albumin-to-Creatinine Ratio (UACR)',
    category: 'Lab Result',
    patientName: 'Robert Langdon',
    doctorName: 'Dr. Marcus Brody',
    date: '2026-06-30',
    fileSize: '4.1 MB',
    fileType: 'PDF Document',
    verificationStatus: 'Verified',
    notes: 'Serum creatinine 1.8 mg/dL with UACR 180 mg/g indicating Stage 2 CKD progression risk.',
  },
];

export const DoctorMedicalRecordsPage: React.FC = () => {
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [records, setRecords] = useState<RecordPreviewItem[]>(DOCTOR_RECORDS_DATA);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Selected Record Preview Modal State
  const [previewRecord, setPreviewRecord] = useState<RecordPreviewItem | null>(null);

  // Filter Categories
  const categories = ['ALL', 'EHR', 'Lab Result', 'Radiology', 'Prescription', 'Discharge Summary'];

  useEffect(() => {
    const fetchConsentedRecords = async () => {
      setIsLoading(true);
      try {
        const fetched = await medicalRecordService.listRecords();
        if (fetched && fetched.length > 0) {
          const mapped: RecordPreviewItem[] = fetched.map((item) => ({
            id: item.id,
            title: item.title,
            category: item.category || 'Lab Result',
            patientName: item.patientName || `Patient ID ${item.patientId}`,
            doctorName: item.doctorName || 'Dr. Sarah Jenkins',
            date: item.dateUploaded || new Date().toISOString().split('T')[0],
            fileSize: item.fileSize || '3.5 MB',
            fileType: item.fileType || 'PDF Document',
            verificationStatus: 'Verified',
            notes: `Consented medical record ${item.id} (${item.category}).`,
          }));
          setRecords(mapped);
        }
      } catch (err: any) {
        console.warn('Doctor records fetch info:', err?.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchConsentedRecords();
  }, []);

  // Filtered Records calculation
  const filteredRecords = useMemo(() => {
    return records.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'ALL' || item.category.toUpperCase() === selectedCategory.toUpperCase();

      return matchesSearch && matchesCategory;
    });
  }, [records, searchQuery, selectedCategory]);

  // Paginated Records slice
  const paginatedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredRecords.slice(startIndex, startIndex + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredRecords.length / pageSize);

  // Handlers
  const handleDownload = async (record: RecordPreviewItem) => {
    try {
      addToast({
        type: 'info',
        title: 'Downloading Encrypted Record',
        message: `Downloading payload for "${record.title}".`,
      });
      await downloadService.downloadRecord(String(record.id), `${record.title}.pdf`);
      addToast({
        type: 'success',
        title: 'Download Complete',
        message: `File "${record.title}" downloaded successfully.`,
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Download Failed',
        message: err.message || 'Unable to download file from backend.',
      });
    }
  };

  const handleViewPatientDetails = (record: RecordPreviewItem) => {
    addToast({
      type: 'info',
      title: 'Navigating to Patient Roster',
      message: `Opening profile directory for ${record.patientName}.`,
    });
    navigate('/patients');
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" /> HIPAA-Decrypted Clinical Viewer
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Clinical Medical Records
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Browse and inspect encrypted health records shared by your authorized patients.
          </p>
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
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
            placeholder="Search by record title, patient name, or type..."
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

        {/* View Mode & Category Filters */}
        <div className="flex items-center gap-3 overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center gap-1.5 shrink-0">
            <Filter className="w-4 h-4 text-slate-400 shrink-0 mr-1" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setCurrentPage(1);
                }}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all select-none',
                  selectedCategory === cat
                    ? 'bg-primary-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800/70 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                )}
              >
                {cat === 'ALL' ? 'All Categories' : cat}
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

      {/* 3. Medical Records List (Grid & Table View) */}
      {filteredRecords.length === 0 ? (
        /* Empty State UI */
        <Card className="p-12 text-center border-slate-200/80 dark:border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No Medical Records Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
            No patient records match your current search query or category filter.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('ALL');
            }}
            className="mt-4"
          >
            Reset Filters
          </Button>
        </Card>
      ) : viewMode === 'grid' ? (
        /* Grid Layout */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedRecords.map((item) => (
            <MedicalRecordCard
              key={item.id}
              id={item.id}
              title={item.title}
              category={item.category as any}
              patientName={item.patientName}
              doctorName={item.doctorName}
              date={item.date}
              fileSize={item.fileSize}
              verificationStatus="Verified"
              onView={() => setPreviewRecord(item)}
              onDownload={() => handleDownload(item)}
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
                  <th className="px-6 py-3.5">Record Title</th>
                  <th className="px-6 py-3.5">Patient (Shared By)</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Upload Date</th>
                  <th className="px-6 py-3.5">File Size</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paginatedRecords.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-primary-600 shrink-0" />
                      <span className="line-clamp-1">{item.title}</span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">{item.patientName}</td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary" size="sm">{item.category}</Badge>
                    </td>
                    <td className="px-6 py-4 text-slate-400 font-mono">{item.date}</td>
                    <td className="px-6 py-4 text-slate-400">{item.fileSize}</td>
                    <td className="px-6 py-4">
                      <Badge variant="success" size="sm">Verified</Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="xs" onClick={() => setPreviewRecord(item)} title="Preview">
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="xs" onClick={() => handleDownload(item)} title="Download">
                          <Download className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="xs" onClick={() => handleViewPatientDetails(item)} title="Patient Details">
                          <User className="w-3.5 h-3.5" />
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

      {/* 4. Pagination Controls */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
        totalItems={filteredRecords.length}
        pageSize={pageSize}
      />

      {/* 5. RECORD PREVIEW MODAL */}
      <RecordPreviewModal
        isOpen={!!previewRecord}
        onClose={() => setPreviewRecord(null)}
        record={previewRecord}
        onDownload={handleDownload}
        onViewPatientDetails={handleViewPatientDetails}
      />
    </div>
  );
};

export default DoctorMedicalRecordsPage;
