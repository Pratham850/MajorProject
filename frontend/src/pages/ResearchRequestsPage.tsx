import React, { useState, useMemo, useEffect } from 'react';
import {
  FileText,
  Search,
  Filter,
  Eye,
  Plus,
  ShieldCheck,
  Grid,
  List as ListIcon,
  X,
  Building,
  Ban,
  Calendar,
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogFooter } from '../components/ui/dialog';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { StatusTimeline, TimelineStep } from '../components/common/StatusTimeline';
import { CreateRequestModal } from '../components/common/CreateRequestModal';
import { Pagination } from '../components/common/Pagination';
import { useToast } from '../components/ui/toast';
import { researchRequestService } from '../services/researchRequest.service';
import { cn } from '../lib/utils';

export interface ResearchRequestItem {
  id: string;
  datasetName: string;
  projectTitle: string;
  institution: string;
  piName: string;
  submittedDate: string;
  status: 'Pending' | 'Approved' | 'Denied' | 'Withdrawn';
  lastUpdated: string;
  reviewerComments?: string;
  decisionDate?: string;
  timelineSteps: TimelineStep[];
}

const RESEARCH_REQUESTS_DATA: ResearchRequestItem[] = [
  {
    id: 'REQ-2026-801',
    datasetName: 'De-identified Cardiology Telemetry Cohort (2026)',
    projectTitle: 'Predictive ML Factors in Heart Failure Readmission',
    institution: 'BioGen Epidemiological Institute',
    piName: 'Dr. Alex Rivera',
    submittedDate: '2026-07-01',
    status: 'Approved',
    lastUpdated: '2026-07-03',
    decisionDate: '2026-07-03',
    reviewerComments: 'Ethics protocol cleared under Safe Harbor anonymization standard. Access granted for 12 months.',
    timelineSteps: [
      { label: 'Proposal Submitted', timestamp: '2026-07-01 09:00', status: 'COMPLETED', description: 'Submitted by Dr. Alex Rivera.' },
      { label: 'Initial Triage & Validation', timestamp: '2026-07-01 14:30', status: 'COMPLETED', description: 'Verified Safe Harbor compliance.' },
      { label: 'IRB Ethics Committee Review', timestamp: '2026-07-02 11:00', status: 'COMPLETED', description: 'Protocol approved unanimously.' },
      { label: 'Final Dataset Access Granted', timestamp: '2026-07-03 10:15', status: 'COMPLETED', description: 'Issued cryptographic access token.' },
    ],
  },
  {
    id: 'REQ-2026-802',
    datasetName: 'Pediatric Oncology Biomarkers & Genomic Variants',
    projectTitle: 'Infectious Disease Epidemic Trajectory Modeling',
    institution: 'BioGen Epidemiological Institute',
    piName: 'Dr. Alex Rivera',
    submittedDate: '2026-07-24',
    status: 'Pending',
    lastUpdated: '2026-07-25',
    reviewerComments: 'Awaiting primary review by Genomic Ethics Subcommittee.',
    timelineSteps: [
      { label: 'Proposal Submitted', timestamp: '2026-07-24 16:20', status: 'COMPLETED', description: 'Submitted by Dr. Alex Rivera.' },
      { label: 'Initial Triage & Validation', timestamp: '2026-07-25 09:15', status: 'COMPLETED', description: 'Validation passed.' },
      { label: 'IRB Ethics Committee Review', timestamp: 'In Progress', status: 'CURRENT', description: 'Under active evaluation.' },
      { label: 'Final Dataset Access Granted', status: 'PENDING' },
    ],
  },
];

export const ResearchRequestsPage: React.FC = () => {
  const { addToast } = useToast();

  const [requests, setRequests] = useState<ResearchRequestItem[]>(RESEARCH_REQUESTS_DATA);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusTab, setSelectedStatusTab] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Selected Request Details Panel Modal State
  const [selectedDetailsModal, setSelectedDetailsModal] = useState<ResearchRequestItem | null>(null);

  // Create Request Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Withdraw Confirmation Dialog State
  const [withdrawTarget, setWithdrawTarget] = useState<ResearchRequestItem | null>(null);

  // Filter Categories
  const statusTabs = ['ALL', 'PENDING', 'APPROVED', 'DENIED', 'WITHDRAWN'];

  useEffect(() => {
    const fetchRequests = async () => {
      setIsLoading(true);
      try {
        const fetched = await researchRequestService.listRequests();
        if (fetched && fetched.length > 0) {
          const mapped: ResearchRequestItem[] = fetched.map((r, idx) => ({
            id: r.id || `REQ-2026-${800 + idx}`,
            datasetName: r.datasetRequested || 'De-identified Cardiology Telemetry Cohort',
            projectTitle: r.title,
            institution: r.institution || 'BioGen Research Institute',
            piName: r.researcherName || 'Dr. Alex Rivera',
            submittedDate: r.submissionDate || '2026-07-28',
            status: (r.status === 'APPROVED' ? 'Approved' : r.status === 'PENDING' ? 'Pending' : 'Approved') as any,
            lastUpdated: '2026-07-28',
            reviewerComments: r.reviewNotes || 'Approved under Safe-Harbor k-anonymity (k=5).',
            timelineSteps: [
              { label: 'Proposal Submitted', timestamp: '2026-07-28', status: 'COMPLETED', description: 'Submitted to IRB committee.' },
              { label: 'Initial Triage & Validation', timestamp: '2026-07-28', status: 'COMPLETED', description: 'Passed de-identification check.' },
              { label: 'IRB Ethics Committee Review', timestamp: '2026-07-28', status: 'COMPLETED', description: 'Cleared for access.' },
              { label: 'Final Dataset Access Granted', timestamp: '2026-07-28', status: 'COMPLETED', description: 'Access token generated.' },
            ],
          }));
          setRequests(mapped);
        }
      } catch (err: any) {
        console.warn('Research requests fetch info:', err?.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRequests();
  }, []);

  // Filtered Requests calculation
  const filteredRequests = useMemo(() => {
    return requests.filter((item) => {
      const matchesSearch =
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.datasetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.projectTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.institution.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        selectedStatusTab === 'ALL' || item.status.toUpperCase() === selectedStatusTab.toUpperCase();

      return matchesSearch && matchesStatus;
    });
  }, [requests, searchQuery, selectedStatusTab]);

  // Paginated Requests slice
  const paginatedRequests = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredRequests.slice(startIndex, startIndex + pageSize);
  }, [filteredRequests, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredRequests.length / pageSize);

  // Handlers
  const handleCreateSuccess = async (newReq: any) => {
    try {
      await researchRequestService.submitRequest({
        title: newReq.projectTitle || 'New Research Proposal',
        dataset: newReq.datasetName || 'CKD Biomarkers Cohort',
        institution: newReq.institution || 'BioGen Research Institute',
        purpose: 'Epidemiological cohort study',
      });
    } catch (err: any) {
      console.warn('Backend request submission info:', err?.message);
    }

    const fullNewReq: ResearchRequestItem = {
      ...newReq,
      timelineSteps: [
        { label: 'Proposal Submitted', timestamp: 'Just now', status: 'COMPLETED', description: 'Submitted by user.' },
        { label: 'Initial Triage & Validation', timestamp: 'Pending', status: 'CURRENT', description: 'Under automated triage.' },
        { label: 'IRB Ethics Committee Review', status: 'PENDING' },
        { label: 'Final Dataset Access Granted', status: 'PENDING' },
      ],
    };
    setRequests([fullNewReq, ...requests]);
  };

  const handleConfirmWithdraw = () => {
    if (withdrawTarget) {
      setRequests((prev) =>
        prev.map((r) => (r.id === withdrawTarget.id ? { ...r, status: 'Withdrawn' as const } : r))
      );
      addToast({
        type: 'info',
        title: 'Proposal Withdrawn',
        message: `Research request ${withdrawTarget.id} has been withdrawn.`,
      });
      setWithdrawTarget(null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" /> IRB Ethics Proposal Tracking
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Research Requests Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Submit, track, and manage scientific data access requests submitted for IRB approval.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsCreateModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Create New Proposal
        </Button>
      </div>

      {/* 2. Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Proposals</span>
          <span className="text-xl font-black text-slate-900 dark:text-white font-mono block">{requests.length}</span>
          <span className="text-2xs text-slate-500">Submitted research studies</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider block">Pending IRB Review</span>
          <span className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono block">
            {requests.filter((r) => r.status === 'Pending').length}
          </span>
          <span className="text-2xs text-slate-500">Awaiting committee vote</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider block">Approved Grants</span>
          <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono block">
            {requests.filter((r) => r.status === 'Approved').length}
          </span>
          <span className="text-2xs text-slate-500">Active dataset access keys</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Denied / Withdrawn</span>
          <span className="text-xl font-black text-slate-600 dark:text-slate-400 font-mono block">
            {requests.filter((r) => r.status === 'Denied' || r.status === 'Withdrawn').length}
          </span>
          <span className="text-2xs text-slate-500">Closed proposals</span>
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
            placeholder="Search Request ID, dataset, title, institution..."
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

        {/* View Mode & Filter Tabs */}
        <div className="flex items-center gap-3 overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center gap-1.5 shrink-0">
            <Filter className="w-4 h-4 text-slate-400 shrink-0 mr-1" />
            {statusTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setSelectedStatusTab(tab);
                  setCurrentPage(1);
                }}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all select-none',
                  selectedStatusTab === tab
                    ? 'bg-primary-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800/70 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                )}
              >
                {tab === 'ALL' ? 'All Statuses' : tab}
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

      {/* 4. Research Requests List (Grid & Table View) */}
      {filteredRequests.length === 0 ? (
        /* Empty State UI */
        <Card className="p-12 text-center border-slate-200/80 dark:border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No Research Proposals Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
            No research requests match your current search query or filter selection.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery('');
              setSelectedStatusTab('ALL');
            }}
            className="mt-4"
          >
            Reset Filters
          </Button>
        </Card>
      ) : viewMode === 'grid' ? (
        /* Grid Layout */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedRequests.map((req) => (
            <Card
              key={req.id}
              className="p-5 flex flex-col justify-between hover:shadow-md transition-all duration-200 border-slate-200/80 dark:border-slate-800 space-y-4"
            >
              <div>
                {/* Header Status & ID */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                    {req.id}
                  </span>
                  <Badge variant={req.status === 'Approved' ? 'success' : req.status === 'Pending' ? 'warning' : 'secondary'} size="sm" dot>
                    {req.status}
                  </Badge>
                </div>

                {/* Project Title & Dataset */}
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{req.projectTitle}</h4>
                <p className="text-xs text-primary-600 dark:text-primary-400 font-medium mt-1">
                  Target: {req.datasetName}
                </p>

                {/* Institution & PI */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1 text-2xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{req.institution}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Submitted: {req.submittedDate}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                {req.status === 'Pending' ? (
                  <Button variant="outline" size="xs" onClick={() => setWithdrawTarget(req)} leftIcon={<Ban className="w-3.5 h-3.5 text-rose-500" />}>
                    Withdraw
                  </Button>
                ) : (
                  <span className="text-2xs text-slate-400">Updated: {req.lastUpdated}</span>
                )}
                <Button variant="primary" size="xs" onClick={() => setSelectedDetailsModal(req)} leftIcon={<Eye className="w-3.5 h-3.5" />}>
                  View Details
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
                  <th className="px-6 py-3.5">Request ID</th>
                  <th className="px-6 py-3.5">Project Title</th>
                  <th className="px-6 py-3.5">Target Dataset</th>
                  <th className="px-6 py-3.5">Institution</th>
                  <th className="px-6 py-3.5">Submitted Date</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paginatedRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900 dark:text-white">{req.id}</td>
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white max-w-xs truncate">{req.projectTitle}</td>
                    <td className="px-6 py-4 font-medium text-primary-600 dark:text-primary-400 max-w-xs truncate">{req.datasetName}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{req.institution}</td>
                    <td className="px-6 py-4 text-slate-400 font-mono">{req.submittedDate}</td>
                    <td className="px-6 py-4">
                      <Badge variant={req.status === 'Approved' ? 'success' : req.status === 'Pending' ? 'warning' : 'secondary'} size="sm">
                        {req.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {req.status === 'Pending' && (
                          <Button variant="ghost" size="xs" onClick={() => setWithdrawTarget(req)} title="Withdraw Request">
                            <Ban className="w-3.5 h-3.5 text-rose-500" />
                          </Button>
                        )}
                        <Button variant="ghost" size="xs" onClick={() => setSelectedDetailsModal(req)} title="View Details">
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

      {/* 5. Pagination Controls */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
        totalItems={filteredRequests.length}
        pageSize={pageSize}
      />

      {/* 6. REQUEST DETAILS PANEL MODAL */}
      {selectedDetailsModal && (
        <Dialog
          isOpen={!!selectedDetailsModal}
          onClose={() => setSelectedDetailsModal(null)}
          title={`Research Proposal Details: ${selectedDetailsModal.id}`}
          maxWidth="lg"
        >
          <div className="space-y-6 py-2 text-xs">
            {/* Header info grid */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Proposal ID</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white mt-0.5 block">{selectedDetailsModal.id}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Status</span>
                <Badge variant={selectedDetailsModal.status === 'Approved' ? 'success' : selectedDetailsModal.status === 'Pending' ? 'warning' : 'secondary'} size="sm" className="mt-0.5">
                  {selectedDetailsModal.status}
                </Badge>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Submitted Date</span>
                <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block font-mono">{selectedDetailsModal.submittedDate}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Decision Date</span>
                <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block font-mono">{selectedDetailsModal.decisionDate || 'Pending'}</span>
              </div>
            </div>

            {/* Title & Target Dataset */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Research Study Title</h4>
              <p className="text-sm font-bold text-slate-900 dark:text-white p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                {selectedDetailsModal.projectTitle}
              </p>
            </div>

            {/* Reviewer Comments */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">IRB Ethics Reviewer Comments</h4>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                {selectedDetailsModal.reviewerComments || 'No reviewer comments logged yet.'}
              </p>
            </div>

            {/* Status Timeline */}
            <StatusTimeline steps={selectedDetailsModal.timelineSteps} />

            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setSelectedDetailsModal(null)}>
                Close
              </Button>
              {selectedDetailsModal.status === 'Pending' && (
                <Button variant="danger" size="sm" onClick={() => {
                  const target = selectedDetailsModal;
                  setSelectedDetailsModal(null);
                  setWithdrawTarget(target);
                }} leftIcon={<Ban className="w-4 h-4" />}>
                  Withdraw Proposal
                </Button>
              )}
            </DialogFooter>
          </div>
        </Dialog>
      )}

      {/* 7. CREATE NEW REQUEST MODAL */}
      <CreateRequestModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmitSuccess={handleCreateSuccess}
      />

      {/* 8. WITHDRAW CONFIRMATION DIALOG */}
      {withdrawTarget && (
        <ConfirmDialog
          isOpen={!!withdrawTarget}
          onClose={() => setWithdrawTarget(null)}
          onConfirm={handleConfirmWithdraw}
          title="Confirm Request Withdrawal"
          description={`Are you sure you want to withdraw research proposal "${withdrawTarget.projectTitle}" (${withdrawTarget.id})? This action cannot be undone.`}
          confirmText="Withdraw Proposal"
          cancelText="Keep Proposal"
          variant="danger"
        />
      )}
    </div>
  );
};

export default ResearchRequestsPage;
