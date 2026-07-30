import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/toast';
import { StatCard } from '../components/common/StatCard';
import { HealthChart } from '../components/common/HealthChart';
import { ActivityTimeline, ActivityItem } from '../components/common/ActivityTimeline';
import { SearchBox } from '../components/common/SearchBox';
import { FilterPanel } from '../components/common/FilterPanel';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogFooter } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { datasetService } from '../services/dataset.service';
import { researchRequestService } from '../services/researchRequest.service';
import {
  Database,
  Search,
  Download,
  Plus,
  ShieldCheck,
  FileSpreadsheet,
  Activity,
  DownloadCloud,
  Microscope,
  Users,
  BarChart2,
  FileCode2,
  Settings,
  BookOpen,
  TrendingUp,
} from 'lucide-react';

export interface DatasetItem {
  id: string;
  title: string;
  category: 'Cardiology' | 'Oncology' | 'Genomics' | 'Neurology' | 'Endocrinology';
  patientCount: number;
  format: 'CSV' | 'Parquet' | 'FHIR JSON';
  anonymization: 'Safe Harbor' | 'Limited Data Set';
  fileSize: string;
  updatedAt: string;
  status: 'AVAILABLE' | 'REQUESTED' | 'APPROVED';
}

export interface ResearchRequest {
  id: string;
  studyTitle: string;
  diseaseFocus: string;
  requestedCohortSize: number;
  status: 'APPROVED' | 'PENDING' | 'DENIED';
  dateSubmitted: string;
  downloadToken?: string;
  fileSize?: string;
}

export interface ResearchProjectProgress {
  id: string;
  title: string;
  leadInvestigator: string;
  progressPercent: number;
  status: 'In Progress' | 'Under IRB Review' | 'Completed';
  targetCompletion: string;
  anonymizedCohortCount: number;
}

export const ResearcherDashboard: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const researcherName = user?.name || 'Dr. Alex Rivera';

  // --- Search & Filter State ---
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({
    category: [],
    format: [],
  });

  // --- Modal States ---
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // --- New Request Form State ---
  const [reqTitle, setReqTitle] = useState('');
  const [reqCategory, setReqCategory] = useState<'Cardiology' | 'Oncology' | 'Genomics' | 'Neurology' | 'Endocrinology'>('Cardiology');
  const [reqCohortSize, setReqCohortSize] = useState(1500);
  const [reqJustification, setReqJustification] = useState('');

  // --- Research Projects Progress Data ---
  const [projects] = useState<ResearchProjectProgress[]>([
    {
      id: 'proj-1',
      title: 'Predictive ML Factors in Heart Failure Readmission',
      leadInvestigator: researcherName,
      progressPercent: 82,
      status: 'In Progress',
      targetCompletion: 'Q4 2026',
      anonymizedCohortCount: 18450,
    },
    {
      id: 'proj-2',
      title: 'CKD Biomarker Population Cohort Validation',
      leadInvestigator: 'BioGen Data Science Team',
      progressPercent: 60,
      status: 'In Progress',
      targetCompletion: 'Q1 2027',
      anonymizedCohortCount: 12100,
    },
    {
      id: 'proj-3',
      title: 'Infectious Disease Epidemic Trajectory Modeling',
      leadInvestigator: researcherName,
      progressPercent: 35,
      status: 'Under IRB Review',
      targetCompletion: 'Q2 2027',
      anonymizedCohortCount: 5000,
    },
  ]);

  // --- Available Datasets Catalog Data ---
  const [datasets] = useState<DatasetItem[]>([
    {
      id: 'ds-101',
      title: 'De-identified Cardiology Telemetry Cohort (2026)',
      category: 'Cardiology',
      patientCount: 18450,
      format: 'Parquet',
      anonymization: 'Safe Harbor',
      fileSize: '420 MB',
      updatedAt: '2026-07-20',
      status: 'APPROVED',
    },
    {
      id: 'ds-102',
      title: 'Pediatric Oncology Biomarkers & Genomic Variants',
      category: 'Oncology',
      patientCount: 4200,
      format: 'FHIR JSON',
      anonymization: 'Safe Harbor',
      fileSize: '1.2 GB',
      updatedAt: '2026-07-15',
      status: 'AVAILABLE',
    },
    {
      id: 'ds-103',
      title: 'Type-2 Diabetes Glucose & HbA1c Longitudinal Set',
      category: 'Endocrinology',
      patientCount: 12100,
      format: 'CSV',
      anonymization: 'Limited Data Set',
      fileSize: '180 MB',
      updatedAt: '2026-07-18',
      status: 'REQUESTED',
    },
    {
      id: 'ds-104',
      title: 'Alzheimers Early Neuroimaging & PET Scans',
      category: 'Neurology',
      patientCount: 1850,
      format: 'Parquet',
      anonymization: 'Safe Harbor',
      fileSize: '4.8 GB',
      updatedAt: '2026-06-30',
      status: 'AVAILABLE',
    },
  ]);

  // --- Research Requests Data ---
  const [requests, setRequests] = useState<ResearchRequest[]>([
    {
      id: 'rr-1',
      studyTitle: 'Predictive ML Factors in Heart Failure Readmission',
      diseaseFocus: 'Cardiology',
      requestedCohortSize: 18450,
      status: 'APPROVED',
      dateSubmitted: '2026-07-01',
      downloadToken: 'TOK-9021-CARD',
      fileSize: '420 MB',
    },
    {
      id: 'rr-2',
      studyTitle: 'Infectious Disease Epidemic Trajectory Modeling',
      diseaseFocus: 'Genomics',
      requestedCohortSize: 5000,
      status: 'PENDING',
      dateSubmitted: '2026-07-24',
    },
  ]);

  // --- Download Export History Data ---
  const [downloadHistory] = useState([
    {
      id: 'dl-1',
      datasetName: 'De-identified Cardiology Telemetry Cohort (2026)',
      format: 'Parquet',
      downloadedAt: 'Today, 08:30 AM',
      size: '420 MB',
      checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    },
    {
      id: 'dl-2',
      datasetName: 'Oncology Biomarkers Sub-Set',
      format: 'CSV',
      downloadedAt: '2026-07-22',
      size: '85 MB',
      checksum: 'f4a1c55398fd2d250bfbf5d9997fc93538bf52f5750c045db506002c8963c966',
    },
  ]);

  // --- Research Activity Timeline ---
  const [activities] = useState<ActivityItem[]>([
    {
      id: 'act-1',
      title: 'IRB Ethics Approval Granted',
      description: 'Protocol #IRB-2026-089 approved for Cardiology Cohort query.',
      timestamp: '2 hours ago',
      actorName: 'IRB Ethics Board',
      actorRole: 'ADMIN',
      type: 'consent',
    },
    {
      id: 'act-2',
      title: 'De-identified Dataset Exported',
      description: 'Downloaded 420 MB Parquet cohort (Safe Harbor Sanitized).',
      timestamp: '5 hours ago',
      actorName: researcherName,
      actorRole: 'RESEARCHER',
      type: 'record',
    },
    {
      id: 'act-3',
      title: 'Cohort Query Submitted',
      description: 'Submitted request for Infectious Disease Epidemic Model (5,000 patients).',
      timestamp: '1 day ago',
      actorName: researcherName,
      actorRole: 'RESEARCHER',
      type: 'ml',
    },
  ]);

  // --- Visual Chart Trends Data ---
  const queryTrendData = [
    { name: 'Jan', value: 18, secondaryValue: 12 },
    { name: 'Feb', value: 34, secondaryValue: 24 },
    { name: 'Mar', value: 45, secondaryValue: 38 },
    { name: 'Apr', value: 78, secondaryValue: 52 },
    { name: 'May', value: 92, secondaryValue: 68 },
    { name: 'Jun', value: 128, secondaryValue: 95 },
  ];

  // --- Filtered Available Datasets ---
  const filteredDatasets = useMemo(() => {
    return datasets.filter((d) => {
      const matchesSearch =
        !searchQuery ||
        d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.category.toLowerCase().includes(searchQuery.toLowerCase());

      const selectedCat = selectedFilters.category || [];
      const matchesCategory = selectedCat.length === 0 || selectedCat.includes(d.category);

      const selectedFmt = selectedFilters.format || [];
      const matchesFormat = selectedFmt.length === 0 || selectedFmt.includes(d.format);

      return matchesSearch && matchesCategory && matchesFormat;
    });
  }, [datasets, searchQuery, selectedFilters]);

  // --- Handlers ---
  const handleDownloadDataset = (id: string, title: string) => {
    setDownloadingId(id);
    addToast({ type: 'info', title: 'Compiling Dataset', message: 'Generating de-identified export with Safe Harbor sanitization...' });

    setTimeout(() => {
      setDownloadingId(null);
      addToast({ type: 'success', title: 'Export Complete', message: `Downloaded "${title}" (Parquet Format).` });
    }, 1500);
  };

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqTitle) {
      addToast({ type: 'error', title: 'Missing Title', message: 'Please specify research study title.' });
      return;
    }

    const newReq: ResearchRequest = {
      id: `rr-${Date.now()}`,
      studyTitle: reqTitle,
      diseaseFocus: reqCategory,
      requestedCohortSize: reqCohortSize,
      status: 'PENDING',
      dateSubmitted: new Date().toISOString().split('T')[0],
    };

    setRequests([newReq, ...requests]);
    setIsRequestModalOpen(false);
    setReqTitle('');
    setReqJustification('');
    addToast({ type: 'success', title: 'Request Submitted', message: `Study proposal "${newReq.studyTitle}" sent for IRB review.` });
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* =================================================================== */}
      {/* 1. RESEARCHER WELCOME HERO CARD */}
      {/* =================================================================== */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-primary-900 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-primary-200 text-xs font-semibold mb-3">
              <Microscope className="w-3.5 h-3.5" /> De-Identified Data Discovery & Analytics Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {researcherName} 🧬
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1.5 max-w-xl leading-relaxed">
              BioGen Epidemiological Institute • You have access to <strong className="text-emerald-300">48,920 anonymized cohort records</strong> across <strong className="text-sky-300">14 active IRB protocol approvals</strong>.
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsRequestModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Request New Cohort
          </Button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. QUICK ACTIONS SECTION (NAVIGATES TO PLACEHOLDER ROUTES) */}
      {/* =================================================================== */}
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4">Research Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Action 1: Datasets Catalog */}
          <button
            onClick={() => navigate('/datasets')}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all text-left group"
          >
            <div className="p-3 rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-950/60 dark:text-primary-400 w-fit mb-3 group-hover:scale-110 transition-transform">
              <Database className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Datasets Catalog</h4>
            <p className="text-2xs text-slate-500 dark:text-slate-400 mt-0.5">4 de-identified cohorts</p>
          </button>

          {/* Action 2: Cohort Analytics */}
          <button
            onClick={() => navigate('/analytics')}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all text-left group"
          >
            <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 w-fit mb-3 group-hover:scale-110 transition-transform">
              <BarChart2 className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Population Analytics</h4>
            <p className="text-2xs text-slate-500 dark:text-slate-400 mt-0.5">Cohort telemetry & trends</p>
          </button>

          {/* Action 3: Research Studies */}
          <button
            onClick={() => navigate('/studies')}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all text-left group"
          >
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 w-fit mb-3 group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Active Studies</h4>
            <p className="text-2xs text-slate-500 dark:text-slate-400 mt-0.5">3 population trials</p>
          </button>

          {/* Action 4: IRB Access Requests */}
          <button
            onClick={() => navigate('/consent')}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all text-left group"
          >
            <div className="p-3 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 w-fit mb-3 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">IRB Access Rules</h4>
            <p className="text-2xs text-slate-500 dark:text-slate-400 mt-0.5">Protocol permissions</p>
          </button>

          {/* Action 5: Account Settings */}
          <button
            onClick={() => navigate('/settings')}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all text-left group"
          >
            <div className="p-3 rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 w-fit mb-3 group-hover:scale-110 transition-transform">
              <Settings className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Settings</h4>
            <p className="text-2xs text-slate-500 dark:text-slate-400 mt-0.5">API keys & credentials</p>
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 3. STATISTICS CARDS (RESEARCH METRICS) */}
      {/* =================================================================== */}
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4">Research & Data Telemetry</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Anonymized Cohort Records"
            value="48,920"
            change="Safe Harbor"
            trend="up"
            subtext="De-identified EHR entries"
            icon={<Database className="w-5 h-5" />}
          />
          <StatCard
            title="Available Datasets"
            value="4"
            change="2 Approved"
            trend="neutral"
            subtext="Parquet / CSV / FHIR"
            icon={<FileSpreadsheet className="w-5 h-5" />}
            iconBg="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
          />
          <StatCard
            title="Approved Data Requests"
            value="14"
            change="IRB Ethics Cleared"
            trend="up"
            subtext="Protocol permissions"
            icon={<ShieldCheck className="w-5 h-5" />}
            iconBg="bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300"
          />
          <StatCard
            title="Data Exports Volume"
            value="1.4 TB"
            change="Parquet & CSV"
            trend="neutral"
            subtext="Downloaded datasets"
            icon={<DownloadCloud className="w-5 h-5" />}
            iconBg="bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
          />
        </div>
      </div>

      {/* =================================================================== */}
      {/* 4. RESEARCH PROGRESS SECTION (ACTIVE PROJECTS) */}
      {/* =================================================================== */}
      <Card className="border-slate-200/80 dark:border-slate-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              <CardTitle className="text-base font-bold">Active Research Projects Progress</CardTitle>
            </div>
            <Badge variant="outline" size="sm">
              3 Ongoing Studies
            </Badge>
          </div>
          <CardDescription className="text-xs">
            Milestones and cohort execution progress for active IRB-cleared clinical trials.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {projects.map((proj) => (
            <div key={proj.id} className="p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{proj.title}</h4>
                  <p className="text-2xs text-slate-500">
                    Lead: <strong className="text-slate-700 dark:text-slate-300">{proj.leadInvestigator}</strong> • Cohort Size: {proj.anonymizedCohortCount.toLocaleString()} patients
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={proj.status === 'In Progress' ? 'success' : 'warning'} size="sm">
                    {proj.status}
                  </Badge>
                  <span className="text-2xs font-mono text-slate-400">Target: {proj.targetCompletion}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-2xs font-bold text-slate-500">
                  <span>Milestone Completion</span>
                  <span className="font-mono">{proj.progressPercent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-600 to-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${proj.progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* =================================================================== */}
      {/* 5. RESEARCH TREND CHARTS */}
      {/* =================================================================== */}
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary-600" /> Population Query Trends & Data Growth
        </h3>
        <HealthChart
          title="Monthly Dataset Queries & Patient Cohort Growth (2026)"
          subtitle="Real-time volume of de-identified query executions vs exports."
          data={queryTrendData}
          type="area"
          dataKey="value"
          secondaryDataKey="secondaryValue"
        />
      </div>

      {/* =================================================================== */}
      {/* 6. DATASET AVAILABILITY CATALOG WITH SEARCH & FILTER */}
      {/* =================================================================== */}
      <Card id="datasets-section" className="border-slate-200/80 dark:border-slate-800">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base font-bold">Available De-Identified Dataset Catalog</CardTitle>
            <CardDescription className="text-xs">Browse anonymized clinical cohorts ready for IRB research query download.</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <SearchBox
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search datasets..."
              className="max-w-xs"
            />
            <FilterPanel
              groups={[
                {
                  id: 'category',
                  title: 'Specialty Focus',
                  options: [
                    { id: 'Cardiology', label: 'Cardiology' },
                    { id: 'Oncology', label: 'Oncology' },
                    { id: 'Genomics', label: 'Genomics' },
                    { id: 'Neurology', label: 'Neurology' },
                  ],
                },
                {
                  id: 'format',
                  title: 'Data Format',
                  options: [
                    { id: 'Parquet', label: 'Parquet' },
                    { id: 'CSV', label: 'CSV' },
                    { id: 'FHIR JSON', label: 'FHIR JSON' },
                  ],
                },
              ]}
              selectedFilters={selectedFilters}
              onChange={setSelectedFilters}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDatasets.length === 0 ? (
              <div className="col-span-2 py-8 text-center text-xs text-slate-400">
                No datasets matching "{searchQuery}".
              </div>
            ) : (
              filteredDatasets.map((ds) => (
                <div
                  key={ds.id}
                  className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-card transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <Badge variant="primary" size="sm" dot>
                        {ds.category}
                      </Badge>
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                        {ds.anonymization}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">{ds.title}</h4>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-3">
                      <span className="inline-flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                        <Users className="w-3.5 h-3.5 text-primary-600" /> {ds.patientCount.toLocaleString()} patients
                      </span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1 font-mono text-2xs">
                        <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400" /> {ds.format} ({ds.fileSize})
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-2xs text-slate-400">Updated: {ds.updatedAt}</span>
                    {ds.status === 'APPROVED' ? (
                      <Button
                        variant="success"
                        size="xs"
                        onClick={() => handleDownloadDataset(ds.id, ds.title)}
                        isLoading={downloadingId === ds.id}
                        leftIcon={<Download className="w-3.5 h-3.5" />}
                      >
                        Download Dataset
                      </Button>
                    ) : ds.status === 'REQUESTED' ? (
                      <Badge variant="warning" size="sm">
                        IRB REVIEW PENDING
                      </Badge>
                    ) : (
                      <Button
                        variant="soft"
                        size="xs"
                        onClick={() => {
                          setReqTitle(`Access Request: ${ds.title}`);
                          setIsRequestModalOpen(true);
                        }}
                        leftIcon={<Plus className="w-3.5 h-3.5" />}
                      >
                        Request Access
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* =================================================================== */}
      {/* 7. APPROVED & PENDING RESEARCH REQUESTS */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-slate-200/80 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-base font-bold">Research Proposals & IRB Approvals</CardTitle>
            <CardDescription className="text-xs">Track status of submitted study proposals and active download keys.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{req.studyTitle}</h4>
                      <Badge variant={req.status === 'APPROVED' ? 'success' : 'warning'} size="sm">
                        {req.status}
                      </Badge>
                    </div>
                    <p className="text-2xs text-slate-500">
                      Focus: <strong className="text-slate-700 dark:text-slate-300">{req.diseaseFocus}</strong> • Cohort Size: {req.requestedCohortSize.toLocaleString()} patients
                    </p>
                    <span className="text-[10px] text-slate-400 font-mono block">Submitted: {req.dateSubmitted}</span>
                  </div>

                  {req.status === 'APPROVED' && (
                    <Button
                      variant="soft"
                      size="xs"
                      onClick={() => handleDownloadDataset(req.id, req.studyTitle)}
                      leftIcon={<Download className="w-3.5 h-3.5" />}
                    >
                      Download ({req.fileSize || '350 MB'})
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Download History Log */}
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-base font-bold">Export & Download Log</CardTitle>
            <CardDescription className="text-xs">SHA-256 verified export history.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {downloadHistory.map((dl) => (
              <div key={dl.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs space-y-1">
                <h5 className="font-bold text-slate-900 dark:text-slate-100 truncate">{dl.datasetName}</h5>
                <div className="flex items-center justify-between text-2xs text-slate-400">
                  <span>Format: <strong>{dl.format}</strong> ({dl.size})</span>
                  <span>{dl.downloadedAt}</span>
                </div>
                <span className="text-[9px] font-mono text-slate-400 truncate block">Hash: {dl.checksum.slice(0, 16)}...</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* =================================================================== */}
      {/* 8. DATA ACCESS AUDIT TIMELINE */}
      {/* =================================================================== */}
      <Card className="border-slate-200/80 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="text-base font-bold">Research Access & Audit Timeline</CardTitle>
          <CardDescription className="text-xs">Immutable HIPAA compliance tracking for data queries and cohort downloads.</CardDescription>
        </CardHeader>
        <CardContent>
          <ActivityTimeline items={activities} />
        </CardContent>
      </Card>

      {/* =================================================================== */}
      {/* MODAL: REQUEST NEW DATASET COHORT */}
      {/* =================================================================== */}
      <Dialog isOpen={isRequestModalOpen} onClose={() => setIsRequestModalOpen(false)} title="Submit Scientific Cohort Access Request" maxWidth="md">
        <form onSubmit={handleCreateRequest} className="space-y-4">
          <div>
            <label className="block text-2xs font-bold text-slate-500 uppercase mb-1">Study Title / Research Purpose</label>
            <Input placeholder="e.g. Cardiovascular Risk Factor Analytics..." value={reqTitle} onChange={(e) => setReqTitle(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-2xs font-bold text-slate-500 uppercase mb-1">Therapeutic Focus</label>
              <Select value={reqCategory} onChange={(e: any) => setReqCategory(e.target.value)}>
                <option value="Cardiology">Cardiology</option>
                <option value="Oncology">Oncology</option>
                <option value="Genomics">Genomics</option>
                <option value="Neurology">Neurology</option>
                <option value="Endocrinology">Endocrinology</option>
              </Select>
            </div>

            <div>
              <label className="block text-2xs font-bold text-slate-500 uppercase mb-1">Target Cohort Size (Patients)</label>
              <Input type="number" value={reqCohortSize} onChange={(e) => setReqCohortSize(Number(e.target.value))} />
            </div>
          </div>

          <div>
            <label className="block text-2xs font-bold text-slate-500 uppercase mb-1">Scientific & IRB Justification</label>
            <Input placeholder="State de-identification and research objectives..." value={reqJustification} onChange={(e) => setReqJustification(e.target.value)} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={() => setIsRequestModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" size="sm" leftIcon={<ShieldCheck className="w-4 h-4" />}>
              Submit for IRB Review
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
};

export default ResearcherDashboard;
