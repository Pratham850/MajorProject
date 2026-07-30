import React, { useState, useMemo, useEffect } from 'react';
import {
  Database,
  Search,
  Filter,
  Download,
  Eye,
  ShieldCheck,
  Grid,
  List as ListIcon,
  X,
  Plus,
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogFooter } from '../components/ui/dialog';
import { DatasetPreviewTable } from '../components/common/DatasetPreviewTable';
import { RequestAccessModal } from '../components/common/RequestAccessModal';
import { Pagination } from '../components/common/Pagination';
import { useToast } from '../components/ui/toast';
import { datasetService } from '../services/dataset.service';
import { cn } from '../lib/utils';

export interface DatasetBrowserItem {
  id: string;
  name: string;
  category: 'Cardiology' | 'Oncology' | 'Endocrinology' | 'Genomics' | 'Neurology';
  recordCount: number;
  lastUpdated: string;
  dataQualityScore: number;
  accessLevel: 'Public' | 'Restricted IRB' | 'Controlled';
  status: 'Available' | 'Request Required' | 'Approved';
  format: 'Parquet' | 'CSV' | 'FHIR JSON';
  fileSize: string;
  description: string;
  schemaFields: string[];
}

const DATASETS_BROWSER_DATA: DatasetBrowserItem[] = [
  {
    id: 'ds-301',
    name: 'De-identified Cardiology Telemetry Cohort (2026)',
    category: 'Cardiology',
    recordCount: 18450,
    lastUpdated: '2026-07-20',
    dataQualityScore: 98.5,
    accessLevel: 'Restricted IRB',
    status: 'Approved',
    format: 'Parquet',
    fileSize: '420 MB',
    description: 'Longitudinal electrocardiogram wave metrics, blood pressure telemetry, and metabolic lab parameters from 18,450 de-identified cardiac patients.',
    schemaFields: ['subject_hash', 'age_band', 'gender', 'systolic_bp', 'cholesterol_mgdl', 'ecg_rhythm_code'],
  },
  {
    id: 'ds-302',
    name: 'Pediatric Oncology Biomarkers & Genomic Variants',
    category: 'Oncology',
    recordCount: 4200,
    lastUpdated: '2026-07-15',
    dataQualityScore: 99.1,
    accessLevel: 'Controlled',
    status: 'Request Required',
    format: 'FHIR JSON',
    fileSize: '1.2 GB',
    description: 'De-identified genomic variant call files (VCF) and somatic mutation markers for pediatric oncology research.',
    schemaFields: ['sample_id', 'cancer_type', 'gene_symbol', 'variant_classification', 'tmb_score'],
  },
  {
    id: 'ds-303',
    name: 'Type-2 Diabetes Glucose & HbA1c Longitudinal Set',
    category: 'Endocrinology',
    recordCount: 12100,
    lastUpdated: '2026-07-18',
    dataQualityScore: 96.4,
    accessLevel: 'Public',
    status: 'Available',
    format: 'CSV',
    fileSize: '180 MB',
    description: 'Continuous glucose monitor (CGM) time-series data and quarterly HbA1c lab trends for diabetic cohort research.',
    schemaFields: ['cgm_device_id', 'timestamp_offset', 'glucose_mgdl', 'hba1c_percent', 'bmi_category'],
  },
];

export const DatasetBrowserPage: React.FC = () => {
  const { addToast } = useToast();

  const [datasets, setDatasets] = useState<DatasetBrowserItem[]>(DATASETS_BROWSER_DATA);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedAccessLevel, setSelectedAccessLevel] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Selected Dataset Details Panel Modal State
  const [selectedDetailsModal, setSelectedDetailsModal] = useState<DatasetBrowserItem | null>(null);

  // Request Access Modal State
  const [requestTargetDataset, setRequestTargetDataset] = useState<DatasetBrowserItem | null>(null);

  // Filter Categories
  const categories = ['ALL', 'Cardiology', 'Oncology', 'Endocrinology', 'Genomics', 'Neurology'];
  const accessLevels = ['ALL', 'Public', 'Restricted IRB', 'Controlled'];

  useEffect(() => {
    const fetchCatalog = async () => {
      setIsLoading(true);
      try {
        const catalog = await datasetService.listDatasets();
        if (catalog && catalog.length > 0) {
          const mapped: DatasetBrowserItem[] = catalog.map((ds, idx) => ({
            id: ds.id || `ds-${idx + 300}`,
            name: ds.name,
            category: (ds.category || 'Cardiology') as any,
            recordCount: ds.recordCount || 10000,
            lastUpdated: ds.lastUpdated || '2026-07-28',
            dataQualityScore: 98.4,
            accessLevel: (ds.accessLevel || 'Restricted IRB') as any,
            status: ds.accessLevel === 'Open' ? 'Available' : 'Approved',
            format: (ds.formats?.[0] || 'Parquet') as any,
            fileSize: ds.fileSize || '45 MB',
            description: ds.description,
            schemaFields: ['subject_hash', 'age_band', 'gender', 'systolic_bp', 'serum_creatinine', 'uacr_grade'],
          }));
          setDatasets(mapped);
        }
      } catch (err: any) {
        console.warn('Dataset catalog fetch info:', err?.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCatalog();
  }, []);

  // Filtered Datasets calculation
  const filteredDatasets = useMemo(() => {
    return datasets.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat =
        selectedCategory === 'ALL' || item.category.toUpperCase() === selectedCategory.toUpperCase();

      const matchesAccess =
        selectedAccessLevel === 'ALL' || item.accessLevel.toUpperCase() === selectedAccessLevel.toUpperCase();

      return matchesSearch && matchesCat && matchesAccess;
    });
  }, [datasets, searchQuery, selectedCategory, selectedAccessLevel]);

  // Paginated Datasets slice
  const paginatedDatasets = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredDatasets.slice(startIndex, startIndex + pageSize);
  }, [filteredDatasets, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredDatasets.length / pageSize);

  // Handlers
  const handleDownloadDataset = async (dataset: DatasetBrowserItem) => {
    try {
      addToast({
        type: 'info',
        title: 'Compiling Safe Harbor Export',
        message: `Downloading anonymized payload for "${dataset.name}".`,
      });
      await datasetService.downloadDataset(dataset.id, `${dataset.name.replace(/\s+/g, '_')}.csv`);
      addToast({
        type: 'success',
        title: 'Download Complete',
        message: `Dataset payload downloaded.`,
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Download Failed',
        message: err.message || 'Unable to download dataset from backend.',
      });
    }
  };

  const handleRequestAccessSuccess = () => {
    if (requestTargetDataset) {
      setDatasets((prev) =>
        prev.map((d) => (d.id === requestTargetDataset.id ? { ...d, status: 'Approved' } : d))
      );
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" /> De-Identified Safe Harbor Repository
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Anonymized Dataset Browser
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Browse, inspect schemas, and request IRB access permissions for de-identified population health datasets.
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
            placeholder="Search dataset title, specialty, or keywords..."
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

        {/* Filters & View Switcher */}
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
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800/70 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                )}
              >
                {cat === 'ALL' ? 'All Specialties' : cat}
              </button>
            ))}
          </div>

          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-1.5 rounded-lg text-xs font-bold transition-all',
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
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
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              )}
              title="Table View"
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Dataset List (Grid & Table View) */}
      {filteredDatasets.length === 0 ? (
        /* Empty State UI */
        <Card className="p-12 text-center border-slate-200/80 dark:border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-500 flex items-center justify-center mx-auto mb-4">
            <Database className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No Datasets Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
            No anonymized healthcare datasets match your current search query or specialty filter.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('ALL');
              setSelectedAccessLevel('ALL');
            }}
            className="mt-4"
          >
            Reset Filters
          </Button>
        </Card>
      ) : viewMode === 'grid' ? (
        /* Grid Layout */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedDatasets.map((ds) => (
            <Card
              key={ds.id}
              className="p-5 flex flex-col justify-between hover:shadow-md transition-all duration-200 border-slate-200/80 dark:border-slate-800 space-y-4"
            >
              <div>
                {/* Header Badges */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <Badge variant="primary" size="sm" dot>
                    {ds.category}
                  </Badge>
                  <Badge variant={ds.accessLevel === 'Public' ? 'success' : 'warning'} size="sm">
                    {ds.accessLevel}
                  </Badge>
                </div>

                {/* Dataset Title & Description */}
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{ds.name}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {ds.description}
                </p>

                {/* Metadata Chips */}
                <div className="mt-4 grid grid-cols-2 gap-2 text-2xs">
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Anonymized Records</span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono mt-0.5 block">
                      {ds.recordCount.toLocaleString()}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Data Quality Score</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 block">
                      {ds.dataQualityScore}%
                    </span>
                  </div>
                </div>

                {/* Format & Updated Date */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-2xs text-slate-400 font-mono">
                  <span>Format: {ds.format} ({ds.fileSize})</span>
                  <span>Updated: {ds.lastUpdated}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                <Button variant="ghost" size="xs" onClick={() => setSelectedDetailsModal(ds)} leftIcon={<Eye className="w-3.5 h-3.5" />}>
                  Inspect Schema
                </Button>
                {ds.status === 'Available' || ds.status === 'Approved' ? (
                  <Button variant="success" size="xs" onClick={() => handleDownloadDataset(ds)} leftIcon={<Download className="w-3.5 h-3.5" />}>
                    Download
                  </Button>
                ) : (
                  <Button variant="primary" size="xs" onClick={() => setRequestTargetDataset(ds)} leftIcon={<Plus className="w-3.5 h-3.5" />}>
                    Request Access
                  </Button>
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
                  <th className="px-6 py-3.5">Dataset Name</th>
                  <th className="px-6 py-3.5">Specialty</th>
                  <th className="px-6 py-3.5">Records</th>
                  <th className="px-6 py-3.5">Data Quality</th>
                  <th className="px-6 py-3.5">Access Level</th>
                  <th className="px-6 py-3.5">Last Updated</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paginatedDatasets.map((ds) => (
                  <tr key={ds.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                      <Database className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="line-clamp-1">{ds.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="primary" size="sm">{ds.category}</Badge>
                    </td>
                    <td className="px-6 py-4 font-mono font-semibold text-slate-700 dark:text-slate-300">
                      {ds.recordCount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {ds.dataQualityScore}%
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={ds.accessLevel === 'Public' ? 'success' : 'warning'} size="sm">
                        {ds.accessLevel}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-slate-400 font-mono">{ds.lastUpdated}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="xs" onClick={() => setSelectedDetailsModal(ds)} title="Inspect Schema">
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        {ds.status === 'Available' || ds.status === 'Approved' ? (
                          <Button variant="ghost" size="xs" onClick={() => handleDownloadDataset(ds)} title="Download">
                            <Download className="w-3.5 h-3.5" />
                          </Button>
                        ) : (
                          <Button variant="ghost" size="xs" onClick={() => setRequestTargetDataset(ds)} title="Request Access">
                            <Plus className="w-3.5 h-3.5" />
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

      {/* 4. Pagination Controls */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
        totalItems={filteredDatasets.length}
        pageSize={pageSize}
      />

      {/* 5. DATASET DETAILS PANEL MODAL */}
      {selectedDetailsModal && (
        <Dialog
          isOpen={!!selectedDetailsModal}
          onClose={() => setSelectedDetailsModal(null)}
          title={`Dataset Schema & Metadata: ${selectedDetailsModal.name}`}
          maxWidth="lg"
        >
          <div className="space-y-6 py-2 text-xs">
            {/* Summary Metadata Grid */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Records</span>
                <span className="font-bold text-slate-900 dark:text-white mt-0.5 block font-mono">
                  {selectedDetailsModal.recordCount.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Data Quality Index</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block font-mono">
                  {selectedDetailsModal.dataQualityScore}%
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Access Level</span>
                <Badge variant={selectedDetailsModal.accessLevel === 'Public' ? 'success' : 'warning'} size="sm" className="mt-0.5">
                  {selectedDetailsModal.accessLevel}
                </Badge>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Export Format</span>
                <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block font-mono">
                  {selectedDetailsModal.format} ({selectedDetailsModal.fileSize})
                </span>
              </div>
            </div>

            {/* Description & Schema Fields */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Epidemiological Study Abstract
              </h4>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                {selectedDetailsModal.description}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                De-Identified Feature Schema ({selectedDetailsModal.schemaFields.length} Attributes)
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedDetailsModal.schemaFields.map((field, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-mono text-slate-700 dark:text-slate-300 font-bold">
                    {field}
                  </span>
                ))}
              </div>
            </div>

            {/* Anonymized Sample Preview Table Component */}
            <DatasetPreviewTable datasetTitle={selectedDetailsModal.name} />

            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setSelectedDetailsModal(null)}>
                Close
              </Button>
              {selectedDetailsModal.status === 'Available' || selectedDetailsModal.status === 'Approved' ? (
                <Button size="sm" onClick={() => handleDownloadDataset(selectedDetailsModal)} leftIcon={<Download className="w-4 h-4" />}>
                  Download Safe Harbor Payload
                </Button>
              ) : (
                <Button size="sm" onClick={() => {
                  const target = selectedDetailsModal;
                  setSelectedDetailsModal(null);
                  setRequestTargetDataset(target);
                }} leftIcon={<Plus className="w-4 h-4" />}>
                  Request Access Permission
                </Button>
              )}
            </DialogFooter>
          </div>
        </Dialog>
      )}

      {/* 6. REQUEST ACCESS MODAL */}
      {requestTargetDataset && (
        <RequestAccessModal
          isOpen={!!requestTargetDataset}
          onClose={() => setRequestTargetDataset(null)}
          datasetTitle={requestTargetDataset.name}
          onSubmitSuccess={handleRequestAccessSuccess}
        />
      )}
    </div>
  );
};

export default DatasetBrowserPage;
