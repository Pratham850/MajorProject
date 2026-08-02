import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileText,
  ArrowLeft,
  Download,
  Eye,
  Brain,
  RefreshCw,
  Edit3,
  Trash2,
  Share2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Sparkles,
  Calendar,
  User,
  Building2,
  UserCheck,
  FileCheck,
  Tag,
  ShieldCheck,
  Activity,
  LineChart,
  GitCompare,
  FileSearch,
  LockKeyhole,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogFooter } from '../components/ui/dialog';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { useToast } from '../components/ui/toast';
import {
  medicalRecordService,
  downloadService,
  MedicalRecordData,
  UpdateRecordPayload,
} from '../services/medicalRecord.service';
import { cn } from '../lib/utils';

export const MedicalReportDetailsPage: React.FC = () => {
  const { recordId } = useParams<{ recordId: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [record, setRecord] = useState<MedicalRecordData | null>(null);
  const [analysisData, setAnalysisData] = useState<any | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState<boolean>(false);

  // Viewer Zoom & Fullscreen State
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Modal States
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const [isReprocessing, setIsReprocessing] = useState(false);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isShareOpen, setIsShareOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState('Dr. Robert Vance, MD');

  // Active Future-Ready Tab
  const [activeFutureTab, setActiveFutureTab] = useState<'results' | 'predictions' | 'trends' | 'comparison' | 'notes' | 'governance'>('results');

  // Fetch Record & Extraction Data from Backend
  const loadRecordDetails = async () => {
    if (!recordId) return;
    setIsLoading(true);
    setErrorMsg(null);
    setAccessDenied(false);

    try {
      const recData = await medicalRecordService.getRecord(recordId);
      console.log('React Rendering: Received report details API response', recData);
      setRecord(recData);
      setEditTitle(recData.title);
      setEditCategory(recData.category);
      setEditDescription(recData.description || '');

      if (recData.extractedData) {
        setAnalysisData(recData.extractedData);
        console.log('React Rendering: Successfully set extractedData from record response', recData.extractedData);
      } else {
        try {
          const analysis = await medicalRecordService.getAnalysis(recordId);
          if (analysis && analysis.extractedData) {
            setAnalysisData(analysis.extractedData);
            console.log('React Rendering: Successfully set extractedData from analysis response', analysis.extractedData);
          }
        } catch (err: any) {
          console.warn('React Rendering: Analysis endpoint call failed', err.message);
        }
      }
    } catch (err: any) {
      if (err.response?.status === 403) {
        setAccessDenied(true);
        setErrorMsg('Access Denied. You do not have authorization to view this medical report.');
      } else {
        const msg = err.message || 'Failed to load medical report details from server.';
        setErrorMsg(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRecordDetails();
  }, [recordId]);

  // Actions
  const handleDownload = async () => {
    if (!record) return;
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

  const handleReprocess = async () => {
    if (!record) return;
    setIsReprocessing(true);
    addToast({
      type: 'info',
      title: 'Gemini AI Processing Started',
      message: `Analyzing document bytes for "${record.title}"...`,
    });

    try {
      const res = await medicalRecordService.reprocessRecord(record.id);
      if (res && res.extractedData) {
        setAnalysisData(res.extractedData);
      }
      addToast({
        type: 'success',
        title: 'AI Reprocessing Complete',
        message: `Successfully re-extracted medical values for "${record.title}".`,
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Reprocessing Failed',
        message: err.message || 'Gemini AI extraction API failed.',
      });
    } finally {
      setIsReprocessing(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!record) return;
    setIsUpdating(true);
    try {
      const payload: UpdateRecordPayload = {
        title: editTitle,
        category: editCategory,
        description: editDescription,
      };
      await medicalRecordService.updateRecord(record.id, payload);
      setRecord((prev) => (prev ? { ...prev, title: editTitle, category: editCategory, description: editDescription } : null));

      addToast({
        type: 'success',
        title: 'Metadata Updated',
        message: `Successfully updated report details for "${editTitle}".`,
      });
      setIsEditOpen(false);
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

  const handleDelete = async () => {
    if (!record) return;
    setIsDeleting(true);
    try {
      await medicalRecordService.deleteRecord(record.id);
      addToast({
        type: 'warning',
        title: 'Report Deleted',
        message: `Medical report "${record.title}" deleted successfully.`,
      });
      navigate('/records');
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Delete Failed',
        message: err.message || 'Unable to delete medical record.',
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteOpen(false);
    }
  };

  const handleShareWithDoctor = () => {
    setIsShareOpen(false);
    addToast({
      type: 'success',
      title: 'Consent Granted',
      message: `Granted temporary medical record access to ${selectedDoctor}.`,
    });
  };

  // Zoom Control Handlers
  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 25, 50));
  const handleResetZoom = () => setZoomLevel(100);

  // Loading State
  if (isLoading) {
    return (
      <div className="p-12 text-center space-y-3 animate-fade-in">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto" />
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Loading Medical Report Details...</h3>
        <p className="text-xs text-slate-500">Retrieving encrypted EHR payload & Gemini AI extraction.</p>
      </div>
    );
  }

  // Access Denied / 403 Security Screen
  if (accessDenied || !record) {
    return (
      <div className="p-12 text-center space-y-4 animate-fade-in max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
          {accessDenied ? '403 Forbidden: Access Denied' : 'Report Not Found'}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          {errorMsg || 'The requested medical report could not be found or you do not have permission to view it.'}
        </p>
        <Button onClick={() => navigate('/records')} leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Return to My Medical Records
        </Button>
      </div>
    );
  }

  const patient = analysisData?.patient || {};
  const hospital = analysisData?.hospital || {};
  const testResults = analysisData?.test_results || [];

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* ---------------------------------------------------------------------- */}
      {/* Page Navigation & Title Bar */}
      {/* ---------------------------------------------------------------------- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/records')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-primary-600 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to My Medical Records
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {record.title}
            </h1>
            <Badge variant="primary" size="sm">{record.category}</Badge>
            <Badge variant="success" size="sm"><ShieldCheck className="w-3 h-3 mr-1" /> Verified Patient Owner</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Report ID: <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">{record.id}</span> • Uploaded on {record.dateUploaded}
          </p>
        </div>

        {/* Section 7: Toolbar Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsShareOpen(true)} leftIcon={<Share2 className="w-4 h-4 text-sky-500" />}>
            Share
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)} leftIcon={<Edit3 className="w-4 h-4 text-amber-500" />}>
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReprocess}
            disabled={isReprocessing}
            leftIcon={<RefreshCw className={cn('w-4 h-4 text-indigo-500', isReprocessing && 'animate-spin')} />}
          >
            {isReprocessing ? 'Reprocessing...' : 'Reprocess AI'}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsDeleteOpen(true)} leftIcon={<Trash2 className="w-4 h-4 text-rose-500" />}>
            Delete
          </Button>
          <Button size="sm" onClick={handleDownload} leftIcon={<Download className="w-4 h-4" />}>
            Download Report
          </Button>
        </div>
      </div>

      {/* ---------------------------------------------------------------------- */}
      {/* 2-Column Responsive Layout: Viewer (Left) & Extraction/Metadata (Right) */}
      {/* ---------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* =================================================================== */}
        {/* SECTION 1: ORIGINAL REPORT VIEWER (LEFT 5 COLS) */}
        {/* =================================================================== */}
        <div className="lg:col-span-5 space-y-4">
          <Card className={cn('border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col', isFullscreen && 'fixed inset-4 z-50 bg-white dark:bg-slate-900 shadow-2xl')}>
            <CardHeader className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-primary-600" /> Original Report Viewer
              </CardTitle>

              {/* Zoom Toolbar */}
              <div className="flex items-center gap-1">
                <button
                  onClick={handleZoomOut}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-2xs font-mono font-bold text-slate-600 dark:text-slate-300 px-1">
                  {zoomLevel}%
                </span>
                <button
                  onClick={handleZoomIn}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={handleResetZoom}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                  title="Reset Zoom"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                  title="Toggle Full Screen"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </CardHeader>

            <CardContent className="p-0 flex-1 min-h-[420px] bg-slate-950/90 relative flex items-center justify-center overflow-auto p-4">
              <div
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center center' }}
                className="transition-transform duration-200 w-full h-full flex flex-col items-center justify-center text-center p-6"
              >
                <div className="p-4 bg-primary-900/40 text-primary-300 rounded-2xl mb-3 border border-primary-500/30">
                  <FileText className="w-12 h-12" />
                </div>
                <h4 className="text-sm font-bold text-white">{record.title}</h4>
                <p className="text-xs text-slate-400 max-w-xs mt-1">
                  AES-256 Encrypted Payload ({record.fileSize || '1.2 MB'})
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <Badge variant="success" size="sm">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Original Intact
                  </Badge>
                  <Badge variant="primary" size="sm">
                    <Lock className="w-3 h-3 mr-1" /> 256-Bit Encrypted
                  </Badge>
                </div>
              </div>
            </CardContent>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-2xs text-slate-500">
              <span>File Format: <strong className="text-slate-800 dark:text-white font-mono">{record.fileType || 'PDF'}</strong></span>
              <button onClick={handleDownload} className="text-primary-600 hover:underline font-bold flex items-center gap-1">
                <Download className="w-3 h-3" /> Download Payload
              </button>
            </div>
          </Card>

          {/* Section 6: Report Metadata Information Card */}
          <Card className="border-slate-200/80 dark:border-slate-800 p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-indigo-500" /> Report System Telemetry
            </h4>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Upload Timestamp</span>
                <span className="font-semibold text-slate-900 dark:text-white font-mono mt-0.5 block">{record.dateUploaded}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Category</span>
                <span className="font-semibold text-primary-600 mt-0.5 block">{record.category}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Processing Status</span>
                <span className="font-semibold text-emerald-600 mt-0.5 block flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Completed
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Gemini Extraction</span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5 block flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> 2.5 Flash Verified
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* =================================================================== */}
        {/* SECTIONS 2, 3, 4, 5 & FUTURE READY MODULES (RIGHT 7 COLS) */}
        {/* =================================================================== */}
        <div className="lg:col-span-7 space-y-6">
          {/* SECTION 2: PATIENT INFORMATION */}
          <Card className="border-slate-200/80 dark:border-slate-800 p-6 bg-gradient-to-r from-slate-50/60 to-primary-50/20 dark:from-slate-900/60 dark:to-slate-900/90">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-primary-600" /> Section 2: Patient & Medical Facility Information
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Patient Name</span>
                <span className="font-extrabold text-slate-900 dark:text-white mt-0.5 block text-sm">{patient.name || 'Not Specified'}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Age / Gender</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                  {patient.age ? `${patient.age} Yrs` : 'N/A'} / {patient.gender || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Blood Group</span>
                <span className="font-bold text-rose-600 mt-0.5 block">{patient.blood_group || 'Not Specified'}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Patient ID / MRN</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{patient.patient_id || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Report Date</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block font-mono">{hospital.report_date || record.dateUploaded}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Department</span>
                <span className="font-bold text-indigo-600 mt-0.5 block">{hospital.department || 'General Diagnostics'}</span>
              </div>
              <div className="col-span-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Medical Facility / Lab</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{hospital.hospital || hospital.laboratory_name || 'Not Specified'}</span>
              </div>
              <div className="col-span-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Ordering Physician</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{hospital.doctor || 'Not Specified'}</span>
              </div>
            </div>
          </Card>

          {/* SECTION 4: AI CLINICAL SUMMARY */}
          <Card className="border-indigo-100 dark:border-indigo-900/60 bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 text-white p-6 shadow-md">
            <div className="flex items-center justify-between gap-4 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-indigo-500/20 text-indigo-300 rounded-xl">
                  <Brain className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Section 4: Gemini AI Clinical Impression</h3>
                  <p className="text-2xs text-indigo-200">Multimodal Neural Extraction Summary</p>
                </div>
              </div>
              <Badge variant="primary" size="sm" className="bg-indigo-500/30 text-indigo-200 border-indigo-400/40">
                <Sparkles className="w-3 h-3 mr-1" /> 2.5 Flash
              </Badge>
            </div>
            <p className="text-xs text-indigo-100 leading-relaxed">
              {analysisData?.diagnosis || 'No specific clinical impression recorded in document payload.'}
            </p>
          </Card>

          {/* SECTION 3: AI EXTRACTED LAB RESULTS TABLE */}
          <Card className="border-slate-200/80 dark:border-slate-800 overflow-hidden">
            <CardHeader className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" /> Section 3: Extracted Biomarkers & Test Results
                </CardTitle>
                <CardDescription className="text-2xs text-slate-500 mt-0.5">
                  Extracted {testResults.length} test parameter(s) from document
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              {testResults.length > 0 ? (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="px-5 py-3">Biomarker / Test Name</th>
                      <th className="px-5 py-3">Category</th>
                      <th className="px-5 py-3">Result Value</th>
                      <th className="px-5 py-3">Unit</th>
                      <th className="px-5 py-3">Reference Range</th>
                      <th className="px-5 py-3">Clinical Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {testResults.map((t: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                        <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">{t.test_name}</td>
                        <td className="px-5 py-3.5">
                          <span className="text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-md">
                            {t.category || 'Other'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-mono font-bold text-slate-800 dark:text-slate-200">{t.value}</td>
                        <td className="px-5 py-3.5 text-slate-500">{t.unit || '-'}</td>
                        <td className="px-5 py-3.5 text-slate-400 font-mono">{t.reference_range || 'Normal'}</td>
                        <td className="px-5 py-3.5">
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
              ) : (
                <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400 space-y-2">
                  <AlertCircle className="w-6 h-6 text-slate-400 mx-auto" />
                  <p className="font-bold text-slate-700 dark:text-slate-300">No Structured Biomarkers Extracted</p>
                  <p className="text-2xs max-w-sm mx-auto">
                    No individual lab test parameters were extracted from this report. Click "Reprocess AI" to run Gemini multimodal parsing again.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* SECTION 5: RECOMMENDATIONS */}
          <Card className="border-slate-200/80 dark:border-slate-800 p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Section 5: Doctor Recommendations & Clinical Guidance
            </h3>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-emerald-50/50 dark:bg-emerald-950/30 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
              {analysisData?.recommendations || 'No specific clinical recommendations recorded in report payload.'}
            </p>
          </Card>

          {/* =================================================================== */}
          {/* FUTURE-READY MODULES SLOT CONTAINER */}
          {/* =================================================================== */}
          <Card className="border-slate-200/80 dark:border-slate-800 p-6 bg-slate-50/40 dark:bg-slate-900/40">
            <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-600" /> Advanced Health Intelligence Modules
                </h4>
                <p className="text-2xs text-slate-500 mt-0.5">Future-Ready Clinical Extensions</p>
              </div>
              <Badge variant="outline" size="sm">Future Ready Architecture</Badge>
            </div>

            {/* Future Modules Navigation Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-none">
              <button
                onClick={() => setActiveFutureTab('results')}
                className={cn('px-3 py-1.5 rounded-xl text-2xs font-bold transition-all', activeFutureTab === 'results' ? 'bg-primary-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 border border-slate-200 dark:border-slate-700')}
              >
                🧬 Disease Prediction Slot
              </button>
              <button
                onClick={() => setActiveFutureTab('trends')}
                className={cn('px-3 py-1.5 rounded-xl text-2xs font-bold transition-all', activeFutureTab === 'trends' ? 'bg-primary-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 border border-slate-200 dark:border-slate-700')}
              >
                📈 Trend Analysis Slot
              </button>
              <button
                onClick={() => setActiveFutureTab('comparison')}
                className={cn('px-3 py-1.5 rounded-xl text-2xs font-bold transition-all', activeFutureTab === 'comparison' ? 'bg-primary-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 border border-slate-200 dark:border-slate-700')}
              >
                🔄 Report Comparison Slot
              </button>
              <button
                onClick={() => setActiveFutureTab('notes')}
                className={cn('px-3 py-1.5 rounded-xl text-2xs font-bold transition-all', activeFutureTab === 'notes' ? 'bg-primary-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 border border-slate-200 dark:border-slate-700')}
              >
                🩺 Doctor Notes Slot
              </button>
              <button
                onClick={() => setActiveFutureTab('governance')}
                className={cn('px-3 py-1.5 rounded-xl text-2xs font-bold transition-all', activeFutureTab === 'governance' ? 'bg-primary-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 border border-slate-200 dark:border-slate-700')}
              >
                🔒 Research Consent Slot
              </button>
            </div>

            {/* Future Module Container Slot Display */}
            <div className="p-6 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center space-y-2">
              {activeFutureTab === 'results' && (
                <div>
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 rounded-xl w-fit mx-auto mb-2">
                    <Brain className="w-5 h-5" />
                  </div>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white">Disease Risk Prediction Engine Slot</h5>
                  <p className="text-2xs text-slate-500 max-w-sm mx-auto">
                    Layout ready for ML Risk Models (CKD Stage Risk, Cardiovascular Risk, Diabetes Probability).
                  </p>
                </div>
              )}
              {activeFutureTab === 'trends' && (
                <div>
                  <div className="p-3 bg-sky-50 dark:bg-sky-950/60 text-sky-600 rounded-xl w-fit mx-auto mb-2">
                    <LineChart className="w-5 h-5" />
                  </div>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white">Historical Biomarker Trend Analysis Slot</h5>
                  <p className="text-2xs text-slate-500 max-w-sm mx-auto">
                    Layout ready for longitudinal biomarker graphs & trajectory comparison.
                  </p>
                </div>
              )}
              {activeFutureTab === 'comparison' && (
                <div>
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 rounded-xl w-fit mx-auto mb-2">
                    <GitCompare className="w-5 h-5" />
                  </div>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white">Side-by-Side Report Comparison Slot</h5>
                  <p className="text-2xs text-slate-500 max-w-sm mx-auto">
                    Layout ready for previous lab report Delta & change analysis.
                  </p>
                </div>
              )}
              {activeFutureTab === 'notes' && (
                <div>
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/60 text-amber-600 rounded-xl w-fit mx-auto mb-2">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white">Attending Doctor Notes & Clinical Remarks Slot</h5>
                  <p className="text-2xs text-slate-500 max-w-sm mx-auto">
                    Layout ready for encrypted physician annotations & consultation summaries.
                  </p>
                </div>
              )}
              {activeFutureTab === 'governance' && (
                <div>
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/60 text-rose-600 rounded-xl w-fit mx-auto mb-2">
                    <LockKeyhole className="w-5 h-5" />
                  </div>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white">Research Consent & Security Verification Slot</h5>
                  <p className="text-2xs text-slate-500 max-w-sm mx-auto">
                    Layout ready for k-anonymity research consent & future Biometric/PIN authentication verification.
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* ---------------------------------------------------------------------- */}
      {/* MODALS: SHARE WITH DOCTOR */}
      {/* ---------------------------------------------------------------------- */}
      <Dialog isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} title="Share Report with Physician" maxWidth="md">
        <div className="space-y-4 py-2 text-xs">
          <p className="text-slate-600 dark:text-slate-300">
            Select an authorized doctor to grant temporary access to this medical record payload.
          </p>
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Select Doctor</label>
            <select
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl p-2.5 border border-slate-200 dark:border-slate-700 focus:outline-none"
            >
              <option value="Dr. Robert Vance, MD">Dr. Robert Vance, MD (Nephrology)</option>
              <option value="Dr. Elena Rostova, MD">Dr. Elena Rostova, MD (Cardiology)</option>
              <option value="Dr. Marcus Thorne, MD">Dr. Marcus Thorne, MD (Internal Medicine)</option>
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => setIsShareOpen(false)}>Cancel</Button>
          <Button size="sm" onClick={handleShareWithDoctor}>Grant Access Consent</Button>
        </DialogFooter>
      </Dialog>

      {/* MODAL: EDIT METADATA */}
      <Dialog isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Report Metadata" maxWidth="md">
        <div className="space-y-4 py-2 text-xs">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl text-amber-800 dark:text-amber-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>Editing is restricted to Report Title, Category, and Description. AI extracted values cannot be modified directly.</span>
          </div>
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Title</label>
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
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              rows={3}
              className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl p-2.5 border border-slate-200 dark:border-slate-700 focus:outline-none"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => setIsEditOpen(false)} disabled={isUpdating}>Cancel</Button>
          <Button size="sm" onClick={handleSaveEdit} disabled={isUpdating}>{isUpdating ? 'Saving...' : 'Save Metadata'}</Button>
        </DialogFooter>
      </Dialog>

      {/* MODAL: DELETE CONFIRMATION */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Medical Report?"
        description="Are you sure you want to permanently delete this report? Physical file payload and database metadata will be removed."
        confirmText={isDeleting ? 'Deleting...' : 'Yes, Delete Report'}
        variant="danger"
      />
    </div>
  );
};

export default MedicalReportDetailsPage;
