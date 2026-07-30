import React, { useState, useMemo, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Key,
  Building,
  Search,
  X,
  FileCheck,
  History,
  Plus,
  User,
  Calendar,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogFooter } from '../components/ui/dialog';
import { StatCard } from '../components/common/StatCard';
import { ConsentCard } from '../components/common/ConsentCard';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Pagination } from '../components/common/Pagination';
import { useToast } from '../components/ui/toast';
import { consentService, ConsentItemData } from '../services/consent.service';
import { doctorLookupService, DoctorLookupItem } from '../services/doctorLookup.service';
import { auditService, AuditLogData } from '../services/audit.service';
import { cn } from '../lib/utils';

export interface ConsentRecordItem {
  id: string;
  doctorId?: number;
  granteeName: string;
  granteeRole: 'DOCTOR' | 'RESEARCHER' | 'ADMIN';
  granteeOrganization: string;
  purpose: string;
  scope: string[];
  status: 'ACTIVE' | 'PENDING' | 'REVOKED' | 'EXPIRED';
  validUntil: string;
  createdAt: string;
  requestedDuration: string;
  accessCount?: number;
  lastAccessedAt?: string;
}

export interface ConsentHistoryLog {
  id: string;
  granteeName: string;
  granteeOrganization: string;
  action: 'APPROVED' | 'REVOKED' | 'DENIED' | 'EXPIRED';
  timestamp: string;
  actor: string;
}

const INITIAL_CONSENTS: ConsentRecordItem[] = [
  {
    id: 'cr-101',
    doctorId: 108,
    granteeName: 'Dr. Sarah Jenkins',
    granteeRole: 'DOCTOR',
    granteeOrganization: 'St. Jude Cardiology Center',
    purpose: 'Quarterly cardiovascular assessment & treatment plan review',
    scope: ['EHR Summary', 'Lab Trends', 'Lipid Panel', 'ECG Waveforms'],
    status: 'PENDING',
    validUntil: '2026-12-31',
    createdAt: 'Today, 10:30 AM',
    requestedDuration: '90 Days',
    accessCount: 0,
  },
  {
    id: 'cr-102',
    doctorId: 105,
    granteeName: 'Dr. Marcus Brody',
    granteeRole: 'DOCTOR',
    granteeOrganization: 'Metro General Hospital',
    purpose: 'Pre-operative health evaluation & surgical clearance',
    scope: ['Blood Panel', 'Radiology Scans', 'Medication List'],
    status: 'ACTIVE',
    validUntil: '2026-09-15',
    createdAt: '2026-05-10',
    requestedDuration: '120 Days',
    accessCount: 6,
    lastAccessedAt: '3 days ago',
  },
  {
    id: 'cr-103',
    doctorId: 112,
    granteeName: 'Dr. Emily Watson',
    granteeRole: 'DOCTOR',
    granteeOrganization: 'Johns Hopkins Hospital',
    purpose: 'Diagnostic imaging & radiological review',
    scope: ['Chest CT Scan', 'Mammography', 'Ultrasonic Scans'],
    status: 'ACTIVE',
    validUntil: '2026-10-30',
    createdAt: '2026-06-20',
    requestedDuration: '180 Days',
    accessCount: 12,
    lastAccessedAt: 'Yesterday, 14:20',
  },
  {
    id: 'cr-104',
    doctorId: 115,
    granteeName: 'BioGen Research Institute',
    granteeRole: 'RESEARCHER',
    granteeOrganization: 'BioGen Epidemiological Study',
    purpose: 'Anonymized observational study on chronic renal health trends',
    scope: ['Anonymized EHR', 'Renal Function Metrics'],
    status: 'REVOKED',
    validUntil: '2026-04-01',
    createdAt: '2026-01-10',
    requestedDuration: '60 Days',
    accessCount: 2,
    lastAccessedAt: '2026-03-22',
  },
];

const INITIAL_HISTORY_LOGS: ConsentHistoryLog[] = [
  {
    id: 'log-1',
    granteeName: 'PharmaTech Trials Lab',
    granteeOrganization: 'PharmaTech Clinical Research',
    action: 'REVOKED',
    timestamp: '2026-03-22 11:20',
    actor: 'Patient (Self)',
  },
  {
    id: 'log-2',
    granteeName: 'BioGen Research Institute',
    granteeOrganization: 'BioGen Epidemiological Study',
    action: 'APPROVED',
    timestamp: '2026-06-15 09:30',
    actor: 'Patient (Self)',
  },
  {
    id: 'log-3',
    granteeName: 'Dr. Marcus Brody',
    granteeOrganization: 'Metro General Hospital',
    action: 'APPROVED',
    timestamp: '2026-05-10 14:15',
    actor: 'Patient (Self)',
  },
];

export const ConsentManagementPage: React.FC = () => {
  const { addToast } = useToast();

  const [consents, setConsents] = useState<ConsentRecordItem[]>(INITIAL_CONSENTS);
  const [historyLogs, setHistoryLogs] = useState<ConsentHistoryLog[]>(INITIAL_HISTORY_LOGS);
  const [availableDoctors, setAvailableDoctors] = useState<DoctorLookupItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'ALL' | 'PENDING' | 'ACTIVE' | 'REVOKED'>('ALL');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Modals & Confirmation States
  const [isGrantModalOpen, setIsGrantModalOpen] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState<ConsentRecordItem | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'APPROVE' | 'REVOKE';
    consent: ConsentRecordItem;
  } | null>(null);

  // Grant Consent Form State
  const [selectedDoctorId, setSelectedDoctorId] = useState<number>(108);
  const [hospitalName, setHospitalName] = useState('St. Jude Medical Center');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'EHR Summary',
    'Lab Trends',
  ]);
  const [accessScope, setAccessScope] = useState('Full Access');
  const [consentDuration, setConsentDuration] = useState('90 Days');
  const [purposeNotes, setPurposeNotes] = useState('Routine clinical care and telemetry monitoring');
  const [isSubmittingGrant, setIsSubmittingGrant] = useState(false);

  // Initial Fetch Data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Fetch doctor lookup
        const docs = await doctorLookupService.getAvailableDoctors();
        setAvailableDoctors(docs);
        if (docs.length > 0) {
          setSelectedDoctorId(docs[0].id);
          setHospitalName(docs[0].hospital);
        }

        // Fetch consents
        const activeConsents = await consentService.listActiveConsents();
        if (activeConsents && activeConsents.length > 0) {
          const mapped: ConsentRecordItem[] = activeConsents.map((c: any, idx: number) => ({
            id: `cr-${c.id || idx + 100}`,
            doctorId: c.doctorId || c.doctor_id || 108,
            granteeName: c.doctorName || c.granteeName || `Dr. ${c.doctorId || 'Jenkins'}`,
            granteeRole: 'DOCTOR',
            granteeOrganization: c.hospital || 'St. Jude Cardiology Practice',
            purpose: c.purpose || 'Clinical care and health record review',
            scope: c.sharedRecords || ['EHR Summary', 'Lab Trends'],
            status: c.status === 'Active' || c.status === 'ACTIVE' ? 'ACTIVE' : 'PENDING',
            validUntil: c.expiryDate || c.expiry_date || '2026-12-31',
            createdAt: c.grantedDate || c.granted_date || '2026-07-28',
            requestedDuration: '90 Days',
            accessCount: 4,
          }));
          setConsents(mapped);
        }

        // Fetch audit logs
        const auditLogs = await auditService.getAuditLogs();
        if (auditLogs && auditLogs.length > 0) {
          const mappedLogs: ConsentHistoryLog[] = auditLogs.map((log: any, idx: number) => ({
            id: `log-${log.id || idx}`,
            granteeName: log.details?.split(' ')[0] || 'Clinician',
            granteeOrganization: 'HealthShare Medical Network',
            action: log.action.includes('Revoke') ? 'REVOKED' : 'APPROVED',
            timestamp: log.timestamp || new Date().toISOString(),
            actor: 'Patient (Self)',
          }));
          setHistoryLogs(mappedLogs);
        }
      } catch (err: any) {
        console.warn('Consent fetch info:', err?.message);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Summary Metrics
  const summary = useMemo(() => {
    return {
      total: consents.length,
      active: consents.filter((c) => c.status === 'ACTIVE').length,
      pending: consents.filter((c) => c.status === 'PENDING').length,
      revoked: consents.filter((c) => c.status === 'REVOKED' || c.status === 'EXPIRED').length,
    };
  }, [consents]);

  // Filtered Consents
  const filteredConsents = useMemo(() => {
    return consents.filter((item) => {
      const matchesSearch =
        item.granteeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.granteeOrganization.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.purpose.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTab =
        selectedTab === 'ALL' || item.status.toUpperCase() === selectedTab.toUpperCase();

      return matchesSearch && matchesTab;
    });
  }, [consents, searchQuery, selectedTab]);

  // Paginated Consents
  const paginatedConsents = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredConsents.slice(startIndex, startIndex + pageSize);
  }, [filteredConsents, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredConsents.length / pageSize);

  // Category Toggle Handler
  const toggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  // Submit Grant Consent Handler
  const handleGrantConsentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCategories.length === 0) {
      addToast({ type: 'error', title: 'Scope Required', message: 'Please select at least one record category.' });
      return;
    }

    setIsSubmittingGrant(true);
    try {
      const doctorObj = availableDoctors.find((d) => d.id === selectedDoctorId);
      const docName = doctorObj ? doctorObj.name : 'Dr. Sarah Jenkins';
      const docHosp = doctorObj ? doctorObj.hospital : hospitalName;

      await consentService.grantConsent({
        doctor_id: selectedDoctorId,
        expiry_date: '2026-12-31',
      });

      const newConsent: ConsentRecordItem = {
        id: `cr-${Date.now()}`,
        doctorId: selectedDoctorId,
        granteeName: docName,
        granteeRole: 'DOCTOR',
        granteeOrganization: docHosp,
        purpose: purposeNotes,
        scope: selectedCategories,
        status: 'ACTIVE',
        validUntil: '2026-12-31',
        createdAt: 'Just now',
        requestedDuration: consentDuration,
        accessCount: 0,
      };

      setConsents([newConsent, ...consents]);
      setHistoryLogs([
        {
          id: `log-${Date.now()}`,
          granteeName: docName,
          granteeOrganization: docHosp,
          action: 'APPROVED',
          timestamp: new Date().toLocaleString(),
          actor: 'Patient (Self)',
        },
        ...historyLogs,
      ]);

      setIsGrantModalOpen(false);
      addToast({
        type: 'success',
        title: 'Consent Granted',
        message: `Successfully granted data access to ${docName}.`,
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Consent Failed',
        message: err.message || 'Unable to issue consent grant to backend.',
      });
    } finally {
      setIsSubmittingGrant(false);
    }
  };

  // Handlers
  const handleApprove = (consent: ConsentRecordItem) => {
    setConsents((prev) =>
      prev.map((c) => (c.id === consent.id ? { ...c, status: 'ACTIVE' } : c))
    );
    setHistoryLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        granteeName: consent.granteeName,
        granteeOrganization: consent.granteeOrganization,
        action: 'APPROVED',
        timestamp: new Date().toLocaleString(),
        actor: 'Patient (Self)',
      },
      ...prev,
    ]);
    setConfirmAction(null);
    addToast({
      type: 'success',
      title: 'Consent Approved',
      message: `Granted data access to ${consent.granteeName}.`,
    });
  };

  const handleRevoke = async (consent: ConsentRecordItem) => {
    try {
      if (consent.doctorId) {
        await consentService.revokeConsent({ doctor_id: consent.doctorId });
      }
      setConsents((prev) =>
        prev.map((c) => (c.id === consent.id ? { ...c, status: 'REVOKED' } : c))
      );
      setHistoryLogs((prev) => [
        {
          id: `log-${Date.now()}`,
          granteeName: consent.granteeName,
          granteeOrganization: consent.granteeOrganization,
          action: consent.status === 'PENDING' ? 'DENIED' : 'REVOKED',
          timestamp: new Date().toLocaleString(),
          actor: 'Patient (Self)',
        },
        ...prev,
      ]);
      setConfirmAction(null);
      addToast({
        type: 'warning',
        title: 'Consent Revoked',
        message: `Data sharing permissions for ${consent.granteeName} have been revoked.`,
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Revoke Failed',
        message: err.message || 'Failed to communicate consent revocation to backend.',
      });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" /> HIPAA Dynamic Access Control
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Consent Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Grant, review, or revoke clinician and researcher access to your health data in real time.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsGrantModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Grant New Consent
        </Button>
      </div>

      {/* 2. Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Agreements"
          value={summary.total}
          subtext="Total consent contracts"
          icon={<FileCheck className="w-5 h-5" />}
        />
        <StatCard
          title="Active Grants"
          value={summary.active}
          subtext="Currently sharing data"
          icon={<ShieldCheck className="w-5 h-5" />}
          iconBg="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
        />
        <StatCard
          title="Pending Requests"
          value={summary.pending}
          subtext="Awaiting your approval"
          icon={<ShieldAlert className="w-5 h-5" />}
          iconBg="bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
        />
        <StatCard
          title="Revoked / Expired"
          value={summary.revoked}
          subtext="Inactive access rules"
          icon={<ShieldX className="w-5 h-5" />}
          iconBg="bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
        />
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by physician, hospital, or purpose..."
            className="w-full bg-slate-100 dark:bg-slate-800/70 text-slate-900 dark:text-slate-100 text-xs rounded-xl pl-9 pr-8 py-2.5 border border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all placeholder:text-slate-400"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['ALL', 'PENDING', 'ACTIVE', 'REVOKED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setSelectedTab(tab);
                setCurrentPage(1);
              }}
              className={cn(
                'px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all select-none',
                selectedTab === tab
                  ? 'bg-primary-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800/70 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              )}
            >
              {tab === 'ALL' ? 'All Consents' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Consent Cards List Grid */}
      {filteredConsents.length === 0 ? (
        <Card className="p-12 text-center border-slate-200/80 dark:border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No Consent Records Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
            No active, pending, or historical consent grants match your current filter criteria.
          </p>
          <Button variant="outline" size="sm" onClick={() => { setSearchQuery(''); setSelectedTab('ALL'); }} className="mt-4">
            Reset Filters
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedConsents.map((item) => (
            <ConsentCard
              key={item.id}
              id={item.id}
              granteeName={item.granteeName}
              granteeRole={item.granteeRole}
              granteeOrganization={item.granteeOrganization}
              purpose={item.purpose}
              scope={item.scope}
              status={item.status}
              validUntil={item.validUntil}
              createdAt={item.createdAt}
              requestedDuration={item.requestedDuration}
              onGrant={() => setConfirmAction({ type: 'APPROVE', consent: item })}
              onRevoke={() => setConfirmAction({ type: 'REVOKE', consent: item })}
              onViewDetails={() => setSelectedDetails(item)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
        totalItems={filteredConsents.length}
        pageSize={pageSize}
      />

      {/* 5. CONSENT AUDIT HISTORY SECTION */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-4 h-4 text-slate-400" /> Consent Action Audit Log
          </h3>
          <span className="text-xs text-slate-400">Total Log Entries: {historyLogs.length}</span>
        </div>

        <Card className="border-slate-200/80 dark:border-slate-800 overflow-hidden">
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-3.5">Timestamp</th>
                  <th className="px-6 py-3.5">Clinician / Organization</th>
                  <th className="px-6 py-3.5">Action Executed</th>
                  <th className="px-6 py-3.5">Executed By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {historyLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-mono text-slate-500">{log.timestamp}</td>
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                      {log.granteeName} <span className="text-2xs font-normal text-slate-400">({log.granteeOrganization})</span>
                    </td>
                    <td className="px-6 py-4">
                      {log.action === 'APPROVED' && <Badge variant="success" size="sm">APPROVED</Badge>}
                      {log.action === 'REVOKED' && <Badge variant="danger" size="sm">REVOKED</Badge>}
                      {log.action === 'DENIED' && <Badge variant="warning" size="sm">DENIED</Badge>}
                      {log.action === 'EXPIRED' && <Badge variant="secondary" size="sm">EXPIRED</Badge>}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-medium">{log.actor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      {/* 6. GRANT NEW CONSENT MODAL */}
      <Dialog
        isOpen={isGrantModalOpen}
        onClose={() => setIsGrantModalOpen(false)}
        title="Grant New Healthcare Access Consent"
        maxWidth="lg"
      >
        <form onSubmit={handleGrantConsentSubmit} className="space-y-4 py-2 text-xs">
          {/* Doctor Selection */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Select Physician / Practitioner
            </label>
            <select
              value={selectedDoctorId}
              onChange={(e) => {
                const docId = Number(e.target.value);
                setSelectedDoctorId(docId);
                const match = availableDoctors.find((d) => d.id === docId);
                if (match) setHospitalName(match.hospital);
              }}
              className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-primary-500"
            >
              {availableDoctors.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.name} — {doc.specialty} ({doc.hospital})
                </option>
              ))}
            </select>
          </div>

          {/* Hospital / Clinic Organization */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Hospital / Clinic Facility
            </label>
            <input
              type="text"
              value={hospitalName}
              onChange={(e) => setHospitalName(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-primary-500"
            />
          </div>

          {/* Record Categories Checkboxes */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Authorized Medical Record Categories
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
              {[
                'EHR Summary',
                'Lab Trends',
                'Lipid Panel',
                'ECG Waveforms',
                'Radiology Scans',
                'Prescription History',
              ].map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={cn(
                    'p-2.5 rounded-xl text-xs font-semibold text-left border transition-all flex items-center justify-between',
                    selectedCategories.includes(cat)
                      ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-950/60 dark:text-primary-300'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  )}
                >
                  <span>{cat}</span>
                  {selectedCategories.includes(cat) && <CheckCircle2 className="w-3.5 h-3.5 text-primary-600" />}
                </button>
              ))}
            </div>
          </div>

          {/* Access Scope & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Access Scope Level
              </label>
              <select
                value={accessScope}
                onChange={(e) => setAccessScope(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-primary-500"
              >
                <option value="Full Access">Full Access (Read & Export)</option>
                <option value="Read-Only">Read-Only Viewer</option>
                <option value="Emergency Only">Emergency Care Access</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Consent Expiry Duration
              </label>
              <select
                value={consentDuration}
                onChange={(e) => setConsentDuration(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-primary-500"
              >
                <option value="30 Days">30 Days</option>
                <option value="90 Days">90 Days</option>
                <option value="180 Days">180 Days</option>
                <option value="1 Year">1 Year</option>
                <option value="Permanent">Permanent Access</option>
              </select>
            </div>
          </div>

          {/* Clinical Purpose Notes */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Purpose & Clinical Context Notes
            </label>
            <textarea
              rows={3}
              value={purposeNotes}
              onChange={(e) => setPurposeNotes(e.target.value)}
              placeholder="e.g. Authorized for ongoing hypertension consultation and lab trend review..."
              className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs focus:outline-none focus:border-primary-500"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={() => setIsGrantModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSubmittingGrant} leftIcon={<ShieldCheck className="w-4 h-4" />}>
              Issue Signed Consent
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* 7. CONSENT DETAILS MODAL */}
      {selectedDetails && (
        <Dialog
          isOpen={!!selectedDetails}
          onClose={() => setSelectedDetails(null)}
          title={`Consent Contract: ${selectedDetails.granteeName}`}
          maxWidth="md"
        >
          <div className="space-y-4 py-2 text-xs">
            {/* Header info */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white text-sm">{selectedDetails.granteeName}</span>
                <Badge variant={selectedDetails.status === 'ACTIVE' ? 'success' : selectedDetails.status === 'PENDING' ? 'warning' : 'danger'} size="sm">
                  {selectedDetails.status}
                </Badge>
              </div>
              <p className="text-slate-500 flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-slate-400" /> {selectedDetails.granteeOrganization}
              </p>
            </div>

            {/* Purpose & Scopes */}
            <div className="space-y-2">
              <span className="font-bold text-slate-900 dark:text-white uppercase text-[10px] tracking-wider block">Clinical Purpose</span>
              <p className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                {selectedDetails.purpose}
              </p>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-slate-900 dark:text-white uppercase text-[10px] tracking-wider block">Authorized Data Scope</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedDetails.scope.map((s, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-semibold">
                    <Key className="w-3 h-3 text-primary-600" /> {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Timestamps */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800 text-2xs text-slate-500">
              <div>
                <span className="block font-bold text-slate-400 uppercase">Created Date</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{selectedDetails.createdAt}</span>
              </div>
              <div>
                <span className="block font-bold text-slate-400 uppercase">Expiry Date</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{selectedDetails.validUntil}</span>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setSelectedDetails(null)}>
                Close
              </Button>
            </DialogFooter>
          </div>
        </Dialog>
      )}

      {/* 8. APPROVE / REVOKE CONFIRMATION DIALOG */}
      {confirmAction && (
        <ConfirmDialog
          isOpen={!!confirmAction}
          onClose={() => setConfirmAction(null)}
          onConfirm={() => {
            if (confirmAction.type === 'APPROVE') {
              handleApprove(confirmAction.consent);
            } else {
              handleRevoke(confirmAction.consent);
            }
          }}
          title={confirmAction.type === 'APPROVE' ? 'Approve Data Access Consent?' : 'Revoke Data Access Consent?'}
          description={
            confirmAction.type === 'APPROVE'
              ? `Grant ${confirmAction.consent.granteeName} at ${confirmAction.consent.granteeOrganization} access to your medical records for ${confirmAction.consent.requestedDuration}.`
              : `Immediately revoke access for ${confirmAction.consent.granteeName}. They will no longer be able to view your encrypted health records.`
          }
          confirmText={confirmAction.type === 'APPROVE' ? 'Yes, Approve Consent' : 'Yes, Revoke Access'}
          variant={confirmAction.type === 'APPROVE' ? 'info' : 'danger'}
        />
      )}
    </div>
  );
};

export default ConsentManagementPage;
