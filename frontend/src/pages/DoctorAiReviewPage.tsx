import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Brain,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle2,
  Grid,
  List as ListIcon,
  X,
  Cpu,
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogFooter } from '../components/ui/dialog';
import { PredictionCard } from '../components/common/PredictionCard';
import { ClinicalNotes } from '../components/common/ClinicalNotes';
import { PredictionComparison, PredictionComparisonItem } from '../components/common/PredictionComparison';
import { Pagination } from '../components/common/Pagination';
import { useToast } from '../components/ui/toast';
import { predictionService } from '../services/prediction.service';
import { cn } from '../lib/utils';

export interface DoctorPredictionReviewItem {
  id: string;
  patientName: string;
  mrn: string;
  age: number;
  gender: string;
  predictionDate: string;
  riskScore: number;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH';
  confidence: number;
  reviewStatus: 'Reviewed' | 'Pending Review';
  lastReviewedDate?: string;
  biomarkers: {
    sc: number;
    bu: number;
    hemo: number;
    bp: number;
    bgr: number;
    al: number;
  };
  keyFactors: string[];
  recommendation: string;
  notes?: string;
  previousAssessment: PredictionComparisonItem;
}

const REVIEW_PREDICTIONS_DATA: DoctorPredictionReviewItem[] = [
  {
    id: 'rev-301',
    patientName: 'Robert Langdon',
    mrn: 'MRN-5219',
    age: 51,
    gender: 'Male',
    predictionDate: '2026-07-28 14:15',
    riskScore: 78,
    riskLevel: 'HIGH',
    confidence: 94.2,
    reviewStatus: 'Pending Review',
    biomarkers: { sc: 1.8, bu: 62, hemo: 10.4, bp: 142, bgr: 165, al: 2 },
    keyFactors: ['Serum Creatinine 1.8 mg/dL', 'Blood Urea 62 mg/dL', 'Hemoglobin 10.4 g/dL'],
    recommendation: 'High risk of renal function decline. Urgent nephrology consultation and dietary protein modification advised.',
    notes: '',
    previousAssessment: {
      date: '2026-04-10',
      score: 58,
      level: 'MODERATE',
      confidence: 91.5,
      sc: 1.4,
      bu: 48,
      hemo: 11.8,
    },
  },
  {
    id: 'rev-302',
    patientName: 'Eleanor Vance',
    mrn: 'MRN-9021',
    age: 58,
    gender: 'Female',
    predictionDate: '2026-07-27 10:30',
    riskScore: 48,
    riskLevel: 'MODERATE',
    confidence: 93.8,
    reviewStatus: 'Reviewed',
    lastReviewedDate: '2026-07-27 16:00',
    biomarkers: { sc: 1.2, bu: 42, hemo: 13.1, bp: 134, bgr: 128, al: 1 },
    keyFactors: ['Fasting Glucose 128 mg/dL', 'Mild Systolic BP 134 mmHg'],
    recommendation: 'Moderate cardiovascular & metabolic risk. Re-evaluate blood pressure telemetry in 30 days.',
    notes: 'Reviewed during morning rounds. Patient instructed to maintain low-sodium diet.',
    previousAssessment: {
      date: '2026-03-15',
      score: 52,
      level: 'MODERATE',
      confidence: 92.0,
      sc: 1.3,
      bu: 45,
      hemo: 12.8,
    },
  },
  {
    id: 'rev-303',
    patientName: 'Marcus Brody',
    mrn: 'MRN-8812',
    age: 64,
    gender: 'Male',
    predictionDate: '2026-07-25 09:45',
    riskScore: 22,
    riskLevel: 'LOW',
    confidence: 96.1,
    reviewStatus: 'Reviewed',
    lastReviewedDate: '2026-07-25 11:30',
    biomarkers: { sc: 0.9, bu: 32, hemo: 14.8, bp: 120, bgr: 95, al: 0 },
    keyFactors: ['Optimal Serum Creatinine (0.9 mg/dL)', 'Normal BP 120/80'],
    recommendation: 'Renal parameters within optimal clinical baseline.',
    notes: 'No clinical intervention needed at present.',
    previousAssessment: {
      date: '2026-01-20',
      score: 25,
      level: 'LOW',
      confidence: 95.0,
      sc: 0.9,
      bu: 34,
      hemo: 14.5,
    },
  },
];

export const DoctorAiReviewPage: React.FC = () => {
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [reviews, setReviews] = useState<DoctorPredictionReviewItem[]>(REVIEW_PREDICTIONS_DATA);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilterTab, setSelectedFilterTab] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  useEffect(() => {
    const fetchPredictionHistory = async () => {
      setIsLoading(true);
      try {
        const history = await predictionService.getPredictionHistory();
        if (history && history.length > 0) {
          const mapped: DoctorPredictionReviewItem[] = history.map((item, idx) => ({
            id: `rev-${item.id || idx + 300}`,
            patientName: `Patient #${item.id || idx + 1}`,
            mrn: `MRN-${5000 + (item.id || idx)}`,
            age: 52,
            gender: 'Male',
            predictionDate: item.created_at || new Date().toISOString().split('T')[0],
            riskScore: Math.round(item.predictedValue || 45),
            riskLevel: item.riskLevel || (item.predictedValue > 60 ? 'HIGH' : item.predictedValue > 35 ? 'MODERATE' : 'LOW'),
            confidence: 94.5,
            reviewStatus: 'Pending Review',
            biomarkers: { sc: 1.5, bu: 50, hemo: 11.2, bp: 135, bgr: 140, al: 1 },
            keyFactors: [`Disease: ${item.disease}`, `Forecast Year: ${item.year}`, `Predicted Rate: ${item.predictedValue}`],
            recommendation: `FastAPI regression forecast for ${item.disease} (${item.year}). Follow-up clinical monitoring advised.`,
            previousAssessment: {
              date: '2026-01-15',
              score: 35,
              level: 'LOW',
              confidence: 91.0,
              sc: 1.1,
              bu: 38,
              hemo: 12.5,
            },
          }));
          setReviews(mapped);
        }
      } catch (err: any) {
        console.warn('Prediction history fetch info:', err?.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPredictionHistory();
  }, []);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Selected Prediction Details Panel Modal State
  const [selectedReviewModal, setSelectedReviewModal] = useState<DoctorPredictionReviewItem | null>(null);

  // Filter Categories
  const filterTabs = ['ALL', 'PENDING REVIEW', 'HIGH RISK', 'MODERATE RISK', 'LOW RISK'];

  // Filtered Reviews calculation
  const filteredReviews = useMemo(() => {
    return reviews.filter((item) => {
      const matchesSearch =
        item.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.mrn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.riskLevel.toLowerCase().includes(searchQuery.toLowerCase());

      let matchesTab = true;
      if (selectedFilterTab === 'PENDING REVIEW') {
        matchesTab = item.reviewStatus === 'Pending Review';
      } else if (selectedFilterTab !== 'ALL') {
        matchesTab = item.riskLevel.toUpperCase() === selectedFilterTab.toUpperCase();
      }

      return matchesSearch && matchesTab;
    });
  }, [reviews, searchQuery, selectedFilterTab]);

  // Paginated Reviews slice
  const paginatedReviews = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredReviews.slice(startIndex, startIndex + pageSize);
  }, [filteredReviews, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredReviews.length / pageSize);

  // Handlers
  const handleDownloadReport = (review: DoctorPredictionReviewItem) => {
    addToast({
      type: 'info',
      title: 'Report Download Started',
      message: `Generating AI CKD Risk Evaluation PDF for ${review.patientName}.`,
    });
  };

  const handleSignOffReview = (review: DoctorPredictionReviewItem) => {
    review.reviewStatus = 'Reviewed';
    review.lastReviewedDate = new Date().toLocaleString();
    setSelectedReviewModal(null);
    addToast({
      type: 'success',
      title: 'Prediction Reviewed & Signed',
      message: `Successfully validated AI report for ${review.patientName}.`,
    });
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-2">
            <Cpu className="w-3.5 h-3.5" /> XGBoost Clinical Decision Support v2.4
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            AI Risk Prediction Review Workspace
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Validate, compare, and sign off on patient machine learning diagnostic assessments.
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
            placeholder="Search by patient name, MRN, or risk level..."
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

        {/* View Switcher & Filter Tabs */}
        <div className="flex items-center gap-3 overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center gap-1.5 shrink-0">
            <Filter className="w-4 h-4 text-slate-400 shrink-0 mr-1" />
            {filterTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setSelectedFilterTab(tab);
                  setCurrentPage(1);
                }}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all select-none',
                  selectedFilterTab === tab
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800/70 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                )}
              >
                {tab === 'ALL' ? 'All Predictions' : tab}
              </button>
            ))}
          </div>

          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-1.5 rounded-lg text-xs font-bold transition-all',
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
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
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              )}
              title="Table View"
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Prediction Review List (Grid & Table View) */}
      {filteredReviews.length === 0 ? (
        /* Empty State UI */
        <Card className="p-12 text-center border-slate-200/80 dark:border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 flex items-center justify-center mx-auto mb-4">
            <Brain className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No Prediction Reports Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
            No prediction assessments match your current search query or filter selection.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery('');
              setSelectedFilterTab('ALL');
            }}
            className="mt-4"
          >
            Reset Filters
          </Button>
        </Card>
      ) : viewMode === 'grid' ? (
        /* Grid Layout */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedReviews.map((item) => (
            <Card
              key={item.id}
              className="p-5 flex flex-col justify-between hover:shadow-md transition-all duration-200 border-slate-200/80 dark:border-slate-800 space-y-4"
            >
              <div>
                {/* Header Status & Risk Badge */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <Badge variant={item.riskLevel === 'LOW' ? 'success' : item.riskLevel === 'MODERATE' ? 'warning' : 'danger'} size="sm" dot>
                    {item.riskLevel} RISK ({item.riskScore}%)
                  </Badge>
                  <Badge variant={item.reviewStatus === 'Reviewed' ? 'success' : 'warning'} size="sm">
                    {item.reviewStatus}
                  </Badge>
                </div>

                {/* Patient Profile */}
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 shrink-0">
                    <Brain className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{item.patientName}</h4>
                    <p className="text-2xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                      {item.mrn} • {item.age}y, {item.gender}
                    </p>
                  </div>
                </div>

                {/* Key Predictors */}
                <div className="mt-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Primary Risk Biomarkers:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {item.keyFactors.map((f, idx) => (
                      <span key={idx} className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Date & Confidence */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-2xs text-slate-400">
                  <span className="font-mono">{item.predictionDate}</span>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{item.confidence}% Confidence</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                <Button variant="ghost" size="xs" onClick={() => handleDownloadReport(item)} leftIcon={<Download className="w-3.5 h-3.5" />}>
                  PDF Report
                </Button>
                <Button variant="primary" size="xs" onClick={() => setSelectedReviewModal(item)} leftIcon={<Eye className="w-3.5 h-3.5" />}>
                  Review Assessment
                </Button>
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
                  <th className="px-6 py-3.5">Patient Name</th>
                  <th className="px-6 py-3.5">MRN</th>
                  <th className="px-6 py-3.5">Prediction Date</th>
                  <th className="px-6 py-3.5">Risk Level & Score</th>
                  <th className="px-6 py-3.5">Confidence</th>
                  <th className="px-6 py-3.5">Review Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paginatedReviews.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                      <Brain className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>{item.patientName}</span>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-500">{item.mrn}</td>
                    <td className="px-6 py-4 text-slate-400 font-mono">{item.predictionDate}</td>
                    <td className="px-6 py-4 font-bold">
                      <span className="mr-2">{item.riskScore}%</span>
                      <Badge variant={item.riskLevel === 'LOW' ? 'success' : item.riskLevel === 'MODERATE' ? 'warning' : 'danger'} size="sm">
                        {item.riskLevel}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-mono">{item.confidence}%</td>
                    <td className="px-6 py-4">
                      <Badge variant={item.reviewStatus === 'Reviewed' ? 'success' : 'warning'} size="sm">
                        {item.reviewStatus}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="xs" onClick={() => handleDownloadReport(item)} title="Download Report">
                          <Download className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="xs" onClick={() => setSelectedReviewModal(item)} title="Review Details">
                          <Eye className="w-3.5 h-3.5" />
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
        totalItems={filteredReviews.length}
        pageSize={pageSize}
      />

      {/* 5. PREDICTION DETAILS & CLINICAL REVIEW MODAL */}
      {selectedReviewModal && (
        <Dialog
          isOpen={!!selectedReviewModal}
          onClose={() => setSelectedReviewModal(null)}
          title={`AI Prediction Review: ${selectedReviewModal.patientName} (${selectedReviewModal.mrn})`}
          maxWidth="lg"
        >
          <div className="space-y-6 py-2">
            {/* Top Prediction Visualizer Card */}
            <PredictionCard
              diseaseName="CKD Diagnostic Risk Evaluation"
              riskScore={selectedReviewModal.riskScore}
              riskLevel={selectedReviewModal.riskLevel}
              confidence={selectedReviewModal.confidence}
              keyFeatures={selectedReviewModal.keyFactors}
              recommendation={selectedReviewModal.recommendation}
            />

            {/* Health Biomarkers Grid */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Evaluated Physiological Biomarkers
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Serum Creatinine</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white mt-0.5 block">{selectedReviewModal.biomarkers.sc} mg/dL</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Blood Urea</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white mt-0.5 block">{selectedReviewModal.biomarkers.bu} mg/dL</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Hemoglobin</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white mt-0.5 block">{selectedReviewModal.biomarkers.hemo} g/dL</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Systolic BP</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white mt-0.5 block">{selectedReviewModal.biomarkers.bp} mmHg</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Blood Glucose</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white mt-0.5 block">{selectedReviewModal.biomarkers.bgr} mg/dL</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Urinary Albumin</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white mt-0.5 block">Grade {selectedReviewModal.biomarkers.al}</span>
                </div>
              </div>
            </div>

            {/* Prediction Comparison Component */}
            <PredictionComparison
              current={{
                date: selectedReviewModal.predictionDate.split(' ')[0],
                score: selectedReviewModal.riskScore,
                level: selectedReviewModal.riskLevel,
                confidence: selectedReviewModal.confidence,
                sc: selectedReviewModal.biomarkers.sc,
                bu: selectedReviewModal.biomarkers.bu,
                hemo: selectedReviewModal.biomarkers.hemo,
              }}
              previous={selectedReviewModal.previousAssessment}
            />

            {/* Clinical Notes Section */}
            <ClinicalNotes
              initialNotes={selectedReviewModal.notes}
              patientName={selectedReviewModal.patientName}
            />

            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setSelectedReviewModal(null)}>
                Close
              </Button>
              <Button variant="soft" size="sm" onClick={() => handleDownloadReport(selectedReviewModal)} leftIcon={<Download className="w-4 h-4" />}>
                Download PDF
              </Button>
              <Button size="sm" onClick={() => handleSignOffReview(selectedReviewModal)} leftIcon={<CheckCircle2 className="w-4 h-4" />}>
                Sign Off & Validate Review
              </Button>
            </DialogFooter>
          </div>
        </Dialog>
      )}
    </div>
  );
};

export default DoctorAiReviewPage;
