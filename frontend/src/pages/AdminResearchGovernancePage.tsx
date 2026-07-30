import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Database,
  Building2,
  Calendar,
  Clock,
  ShieldCheck,
  User,
  X,
  History,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogFooter } from '../components/ui/dialog';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { DatasetGovernancePanel, DatasetGovernanceItem } from '../components/common/DatasetGovernancePanel';
import { ApprovalHistoryTable, ApprovalHistoryItem } from '../components/common/ApprovalHistoryTable';
import { Pagination } from '../components/common/Pagination';
import { useToast } from '../components/ui/toast';
import { cn } from '../lib/utils';

export interface AdminResearchRequestItem {
  id: string;
  researcherName: string;
  researcherId: string;
  institution: string;
  datasetRequested: string;
  researchTitle: string;
  submissionDate: string;
  status: 'Pending IRB Review' | 'Approved' | 'Rejected' | 'More Information Requested';
  objective: string;
  methodology: string;
  ethicsApprovalRef: string;
  expectedDuration: string;
  reviewerNotes: string;
}

const RESEARCH_PROPOSALS_DATA: AdminResearchRequestItem[] = [
  {
    id: 'REQ-301',
    researcherName: 'Dr. Evelyn Reed',
    researcherId: 'USR-107',
    institution: 'BioGen Institute',
    datasetRequested: 'De-identified Cardiology Telemetry Cohort (2026)',
    researchTitle: 'Longitudinal Analysis of Cardiac Telemetry & Serum Biomarkers in Heart Failure',
    submissionDate: '2026-07-28',
    status: 'Pending IRB Review',
    objective: 'Investigate early prognostic indicators of congestive heart failure progression using continuous ECG telemetry and lipid panel biomarkers.',
    methodology: 'Retrospective cohort study using XGBoost survival regression algorithms trained on 18,450 de-identified patient telemetry streams.',
    ethicsApprovalRef: 'IRB-2026-CARDIO-88102',
    expectedDuration: '12 Months (Aug 2026 - Aug 2027)',
    reviewerNotes: 'Initial intake completed. Awaiting admin clearance on Safe Harbor compliance certification.',
  },
  {
    id: 'REQ-302',
    researcherName: 'Dr. Alex Rivera',
    researcherId: 'USR-103',
    institution: 'BioGen Epidemiological Institute',
    datasetRequested: 'Pediatric Oncology Biomarkers & Genomic Variants',
    researchTitle: 'Pediatric Solid Tumor Genomic Variant Frequency Mapping',
    submissionDate: '2026-07-25',
    status: 'Approved',
    objective: 'Map novel single nucleotide polymorphism (SNP) frequencies in pediatric oncology cohorts across 12 participating academic medical centers.',
    methodology: 'Variant call format (VCF) analysis utilizing Apache Spark distributed genome alignment on Parquet binary datasets.',
    ethicsApprovalRef: 'IRB-2026-ONC-44012',
    expectedDuration: '24 Months',
    reviewerNotes: 'IRB protocol verified; access granted for Parquet binary payload download.',
  },
  {
    id: 'REQ-303',
    researcherName: 'Dr. Robert Langdon',
    researcherId: 'USR-105',
    institution: 'Harvard Medical School',
    datasetRequested: 'Type-2 Diabetes Glucose & HbA1c Longitudinal Set',
    researchTitle: 'Machine Learning Prediction of Renal Impairment Trajectory in Diabetic Nephropathy',
    submissionDate: '2026-07-20',
    status: 'More Information Requested',
    objective: 'Develop predictive deep neural network models for early detection of diabetic kidney disease using HbA1c trajectory vectors.',
    methodology: 'Longitudinal time-series recurrent neural network (RNN) modeling on 12,000 anonymized diabetic patient profiles.',
    ethicsApprovalRef: 'IRB-2026-NEPH-90412',
    expectedDuration: '18 Months',
    reviewerNotes: 'Requested updated IRB renewal documentation and principal investigator endorsement letter.',
  },
  {
    id: 'REQ-304',
    researcherName: 'Dr. Jonathan Crane',
    researcherId: 'USR-110',
    institution: 'Gotham Psychiatric Research Center',
    datasetRequested: 'Alzheimers Early Neuroimaging & PET Scans',
    researchTitle: 'Unsanctioned Biomarker Telemetry Aggregation',
    submissionDate: '2026-07-15',
    status: 'Rejected',
    objective: 'Evaluate neurodegenerative PET scan density variations across unverified patient demographics.',
    methodology: 'Custom image processing pipeline without IRB institutional review clearance.',
    ethicsApprovalRef: 'INVALID-IRB-000',
    expectedDuration: '6 Months',
    reviewerNotes: 'Proposal rejected due to missing institutional IRB ethics approval reference.',
  },
];

const DATASET_GOVERNANCE_DATA: DatasetGovernanceItem[] = [
  {
    id: 'ds-1',
    name: 'De-identified Cardiology Telemetry Cohort (2026)',
    publicationStatus: 'Published',
    accessLevel: 'IRB Clearance Required',
    category: 'Cardiology',
    lastUpdated: '2026-07-28',
    approvedResearchersCount: 18,
  },
  {
    id: 'ds-2',
    name: 'Pediatric Oncology Biomarkers & Genomic Variants',
    publicationStatus: 'Published',
    accessLevel: 'Controlled Access',
    category: 'Oncology',
    lastUpdated: '2026-07-25',
    approvedResearchersCount: 12,
  },
  {
    id: 'ds-3',
    name: 'Type-2 Diabetes Glucose & HbA1c Longitudinal Set',
    publicationStatus: 'Published',
    accessLevel: 'IRB Clearance Required',
    category: 'Endocrinology',
    lastUpdated: '2026-07-20',
    approvedResearchersCount: 24,
  },
  {
    id: 'ds-4',
    name: 'Alzheimers Early Neuroimaging & PET Scans',
    publicationStatus: 'Restricted',
    accessLevel: 'Controlled Access',
    category: 'Neurology',
    lastUpdated: '2026-07-15',
    approvedResearchersCount: 6,
  },
];

const APPROVAL_HISTORY_DATA: ApprovalHistoryItem[] = [
  {
    id: 'hist-701',
    approvalDate: '2026-07-25 11:30',
    requestId: 'REQ-302',
    researcherName: 'Dr. Alex Rivera',
    decision: 'Approved',
    decisionMaker: 'System Administrator (Arthur Pendelton)',
    reviewerComments: 'Verified IRB protocol IRB-2026-ONC-44012; approved dataset clearance.',
  },
  {
    id: 'hist-702',
    approvalDate: '2026-07-20 15:45',
    requestId: 'REQ-303',
    researcherName: 'Dr. Robert Langdon',
    decision: 'More Information Requested',
    decisionMaker: 'System Administrator (Arthur Pendelton)',
    reviewerComments: 'Requested clarification regarding PI endorsement letter and IRB expiration date.',
  },
  {
    id: 'hist-703',
    approvalDate: '2026-07-15 09:10',
    requestId: 'REQ-304',
    researcherName: 'Dr. Jonathan Crane',
    decision: 'Rejected',
    decisionMaker: 'System Administrator (Arthur Pendelton)',
    reviewerComments: 'Rejected proposal due to invalid ethics approval reference.',
  },
];

export const AdminResearchGovernancePage: React.FC = () => {
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [proposals, setProposals] = useState<AdminResearchRequestItem[]>(RESEARCH_PROPOSALS_DATA);
  const [datasets] = useState<DatasetGovernanceItem[]>(DATASET_GOVERNANCE_DATA);
  const [history] = useState<ApprovalHistoryItem[]>(APPROVAL_HISTORY_DATA);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusTab, setSelectedStatusTab] = useState<string>('ALL');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Details Modal State
  const [selectedProposalModal, setSelectedProposalModal] = useState<AdminResearchRequestItem | null>(null);

  // Decision Confirmation Dialog State
  const [decisionActionTarget, setDecisionActionTarget] = useState<{
    proposal: AdminResearchRequestItem;
    action: 'Approve' | 'Reject' | 'Request Info';
  } | null>(null);

  // Status Filter Tabs
  const statusTabs = ['ALL', 'Pending IRB Review', 'Approved', 'Rejected', 'More Information Requested'];

  // Filtered Proposals calculation
  const filteredProposals = useMemo(() => {
    return proposals.filter((item) => {
      const matchesSearch =
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.researcherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.institution.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.datasetRequested.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.researchTitle.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        selectedStatusTab === 'ALL' || item.status.toUpperCase() === selectedStatusTab.toUpperCase();

      return matchesSearch && matchesStatus;
    });
  }, [proposals, searchQuery, selectedStatusTab]);

  // Paginated Proposals slice
  const paginatedProposals = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredProposals.slice(startIndex, startIndex + pageSize);
  }, [filteredProposals, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredProposals.length / pageSize);

  // Handlers for Decision Actions
  const handleExecuteDecision = () => {
    if (decisionActionTarget) {
      const { proposal, action } = decisionActionTarget;
      let newStatus: AdminResearchRequestItem['status'] = 'Approved';
      if (action === 'Reject') newStatus = 'Rejected';
      if (action === 'Request Info') newStatus = 'More Information Requested';

      setProposals((prev) =>
        prev.map((p) => (p.id === proposal.id ? { ...p, status: newStatus } : p))
      );

      addToast({
        type: action === 'Approve' ? 'success' : action === 'Reject' ? 'error' : 'warning',
        title: `Proposal ${action}d`,
        message: `Updated governance status for proposal ${proposal.id} (${proposal.researcherName}).`,
      });

      setDecisionActionTarget(null);
      setSelectedProposalModal(null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-2">
            <FileText className="w-3.5 h-3.5" /> IRB Ethics Review & Dataset Governance
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Research Approval & Dataset Governance
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Evaluate scientific data access proposals, grant IRB dataset clearances, and govern publication policies.
          </p>
        </div>
      </div>

      {/* 2. Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Research Proposals</span>
          <span className="text-xl font-black text-slate-900 dark:text-white font-mono block">14</span>
          <span className="text-2xs text-slate-500">Submitted for review</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider block">Pending IRB Review</span>
          <span className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono block">4</span>
          <span className="text-2xs text-slate-500">Requires admin clearance</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider block">Approved Grants</span>
          <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono block">8</span>
          <span className="text-2xs text-slate-500">Active dataset access</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider block">Active Datasets</span>
          <span className="text-xl font-black text-indigo-600 dark:text-indigo-400 font-mono block">4</span>
          <span className="text-2xs text-slate-500">Safe Harbor repositories</span>
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
            placeholder="Search Request ID, researcher, institution, or title..."
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

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 shrink-0">
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
      </div>

      {/* 4. Research Request Table */}
      {filteredProposals.length === 0 ? (
        /* Empty State UI */
        <Card className="p-12 text-center border-slate-200/80 dark:border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No Research Proposals Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
            No research requests match your search query or governance status filter.
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
      ) : (
        <Card className="border-slate-200/80 dark:border-slate-800 overflow-hidden">
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-3.5">Request ID</th>
                  <th className="px-6 py-3.5">Researcher Name</th>
                  <th className="px-6 py-3.5">Institution</th>
                  <th className="px-6 py-3.5">Target Dataset</th>
                  <th className="px-6 py-3.5">Submission Date</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paginatedProposals.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-500">{item.id}</td>
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-primary-600 shrink-0" />
                      <span>{item.researcherName}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{item.institution}</td>
                    <td className="px-6 py-4 font-semibold text-indigo-600 dark:text-indigo-400">{item.datasetRequested}</td>
                    <td className="px-6 py-4 font-mono text-slate-400">{item.submissionDate}</td>
                    <td className="px-6 py-4">
                      <Badge variant={item.status === 'Approved' ? 'success' : item.status === 'Pending IRB Review' ? 'warning' : item.status === 'Rejected' ? 'danger' : 'secondary'} size="sm" dot>
                        {item.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="xs" onClick={() => setSelectedProposalModal(item)} leftIcon={<Eye className="w-3.5 h-3.5" />}>
                        Review Details
                      </Button>
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
        totalItems={filteredProposals.length}
        pageSize={pageSize}
      />

      {/* 6. DATASET GOVERNANCE PANEL */}
      <DatasetGovernancePanel datasets={datasets} />

      {/* 7. APPROVAL HISTORY LOG TABLE */}
      <ApprovalHistoryTable history={history} />

      {/* 8. RESEARCH REQUEST DETAILS PANEL MODAL */}
      {selectedProposalModal && (
        <Dialog
          isOpen={!!selectedProposalModal}
          onClose={() => setSelectedProposalModal(null)}
          title={`Research Proposal Review: ${selectedProposalModal.id}`}
          maxWidth="lg"
        >
          <div className="space-y-6 py-2 text-xs">
            {/* Header info grid */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Governance Status</span>
                <Badge variant={selectedProposalModal.status === 'Approved' ? 'success' : 'warning'} size="sm" className="mt-1">
                  {selectedProposalModal.status}
                </Badge>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Ethics Ref</span>
                <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block font-mono">{selectedProposalModal.ethicsApprovalRef}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Expected Duration</span>
                <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block font-mono">{selectedProposalModal.expectedDuration}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Submission Date</span>
                <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block font-mono">{selectedProposalModal.submissionDate}</span>
              </div>
            </div>

            {/* Researcher Info Card */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Principal Investigator</span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{selectedProposalModal.researcherName}</h4>
                <p className="text-2xs text-slate-500">{selectedProposalModal.institution} (ID: {selectedProposalModal.researcherId})</p>
              </div>
              <Button variant="ghost" size="xs" onClick={() => { setSelectedProposalModal(null); navigate(`/admin/users?query=${encodeURIComponent(selectedProposalModal.researcherName)}`); }}>
                View Researcher Profile
              </Button>
            </div>

            {/* Target Dataset */}
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Target Anonymized Dataset</h4>
              <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900">
                <span className="font-bold text-indigo-700 dark:text-indigo-300">{selectedProposalModal.datasetRequested}</span>
                <Button variant="ghost" size="xs" onClick={() => { setSelectedProposalModal(null); navigate('/datasets'); }}>
                  View Dataset Details
                </Button>
              </div>
            </div>

            {/* Scientific Objective & Methodology */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Research Abstract & Objective</h4>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                {selectedProposalModal.objective}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Analytical Methodology</h4>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 font-mono text-2xs">
                {selectedProposalModal.methodology}
              </p>
            </div>

            {/* Reviewer Notes */}
            <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-2xs text-slate-600 dark:text-slate-300 space-y-1">
              <span className="font-bold uppercase tracking-wider block text-slate-400">IRB Reviewer Intake Notes</span>
              <p>{selectedProposalModal.reviewerNotes}</p>
            </div>

            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setSelectedProposalModal(null)}>
                Close
              </Button>
              {selectedProposalModal.status === 'Pending IRB Review' && (
                <>
                  <Button variant="ghost" size="sm" onClick={() => setDecisionActionTarget({ proposal: selectedProposalModal, action: 'Request Info' })} className="text-amber-600 hover:text-amber-700">
                    Request Info
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setDecisionActionTarget({ proposal: selectedProposalModal, action: 'Reject' })} className="text-rose-600 hover:text-rose-700">
                    Reject Proposal
                  </Button>
                  <Button variant="success" size="sm" onClick={() => setDecisionActionTarget({ proposal: selectedProposalModal, action: 'Approve' })} leftIcon={<CheckCircle2 className="w-4 h-4" />}>
                    Approve IRB Access
                  </Button>
                </>
              )}
            </DialogFooter>
          </div>
        </Dialog>
      )}

      {/* 9. DECISION CONFIRMATION DIALOG */}
      {decisionActionTarget && (
        <ConfirmDialog
          isOpen={!!decisionActionTarget}
          onClose={() => setDecisionActionTarget(null)}
          onConfirm={handleExecuteDecision}
          title={`Confirm ${decisionActionTarget.action} Governance Action`}
          description={`Are you sure you want to set governance status to "${decisionActionTarget.action}" for proposal ${decisionActionTarget.proposal.id} submitted by ${decisionActionTarget.proposal.researcherName}?`}
          confirmText={`Confirm ${decisionActionTarget.action}`}
          variant={decisionActionTarget.action === 'Approve' ? 'success' : decisionActionTarget.action === 'Reject' ? 'danger' : 'warning'}
        />
      )}
    </div>
  );
};

export default AdminResearchGovernancePage;
