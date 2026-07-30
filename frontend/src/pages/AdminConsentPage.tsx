import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Search,
  Filter,
  Eye,
  Activity,
  User,
  Stethoscope,
  Building2,
  Calendar,
  Clock,
  FileText,
  Lock,
  X,
  ShieldAlert,
  Terminal,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogFooter } from '../components/ui/dialog';
import { AccessLogTable, AccessLogItem } from '../components/common/AccessLogTable';
import { Pagination } from '../components/common/Pagination';
import { useToast } from '../components/ui/toast';
import { cn } from '../lib/utils';

export interface ConsentItem {
  id: string;
  patientName: string;
  patientId: string;
  doctorName: string;
  doctorId: string;
  hospital: string;
  sharedRecords: string[];
  purpose: string;
  status: 'Active' | 'Pending Request' | 'Revoked' | 'Expired';
  grantedDate: string;
  expiryDate: string;
  notes: string;
}

const CONSENT_DIRECTORY_DATA: ConsentItem[] = [
  {
    id: 'CNS-9001',
    patientName: 'Eleanor Vance',
    patientId: 'USR-101',
    doctorName: 'Dr. Marcus Brody',
    doctorId: 'USR-102',
    hospital: 'St. Jude Cardiology Practice',
    sharedRecords: ['Cardiology Telemetry', 'Blood Pressure Logs', 'ECG Waveforms'],
    purpose: 'Routine Hypertension Telehealth Monitoring & Longitudinal Care',
    status: 'Active',
    grantedDate: '2026-07-01',
    expiryDate: '2027-07-01',
    notes: 'Patient granted full 1-year telemetry sharing authorization.',
  },
  {
    id: 'CNS-9002',
    patientName: 'Eleanor Vance',
    patientId: 'USR-101',
    doctorName: 'Dr. Sarah Jenkins',
    doctorId: 'USR-108',
    hospital: 'General Health Medical Center',
    sharedRecords: ['Renal Lab Panel', 'Serum Creatinine', 'Ultrasound Imaging'],
    purpose: 'Chronic Kidney Disease Stage 2 Diagnostic Evaluation',
    status: 'Active',
    grantedDate: '2026-06-15',
    expiryDate: '2026-12-15',
    notes: '6-month diagnostic evaluation consent for CKD consultation.',
  },
  {
    id: 'CNS-9003',
    patientName: 'Robert Paulson',
    patientId: 'USR-109',
    doctorName: 'Dr. Robert Langdon',
    doctorId: 'USR-105',
    hospital: 'Harvard Medical Cardiology',
    sharedRecords: ['Genomic Variants', 'Pediatric Oncology Biomarkers'],
    purpose: 'Second Opinion Clinical Evaluation',
    status: 'Pending Request',
    grantedDate: '2026-07-28',
    expiryDate: '2026-10-28',
    notes: 'Awaiting patient approval for secondary genomic data sharing.',
  },
  {
    id: 'CNS-9004',
    patientName: 'Clara Oswald',
    patientId: 'USR-106',
    doctorName: 'Dr. Marcus Brody',
    doctorId: 'USR-102',
    hospital: 'St. Jude Cardiology Practice',
    sharedRecords: ['EHR History', 'Prescription Records'],
    purpose: 'Cardiovascular Care',
    status: 'Revoked',
    grantedDate: '2026-01-10',
    expiryDate: '2026-07-10',
    notes: 'Consent revoked directly by patient on July 10, 2026.',
  },
  {
    id: 'CNS-9005',
    patientName: 'Arthur Pendelton',
    patientId: 'USR-104',
    doctorName: 'Dr. Evelyn Reed',
    doctorId: 'USR-107',
    hospital: 'BioGen Institute',
    sharedRecords: ['Clinical Trial Telemetry'],
    purpose: 'Epidemiological Study Access',
    status: 'Expired',
    grantedDate: '2025-06-01',
    expiryDate: '2026-06-01',
    notes: 'Consent term expired automatically after 12 months.',
  },
];

const ACCESS_LOG_EVENT_DATA: AccessLogItem[] = [
  {
    id: 'log-801',
    timestamp: '2026-07-28 10:30:15',
    user: 'Dr. Marcus Brody',
    userRole: 'DOCTOR',
    action: 'EHR_RECORD_READ',
    ipAddress: '192.168.1.45',
    device: 'Chrome v126 on Windows 11',
  },
  {
    id: 'log-802',
    timestamp: '2026-07-28 09:12:44',
    user: 'Eleanor Vance',
    userRole: 'PATIENT',
    action: 'CONSENT_GRANTED',
    ipAddress: '10.0.0.12',
    device: 'Safari v17 on macOS',
  },
  {
    id: 'log-803',
    timestamp: '2026-07-27 16:45:00',
    user: 'Dr. Sarah Jenkins',
    userRole: 'DOCTOR',
    action: 'PREVIEW_LAB_REPORT',
    ipAddress: '192.168.1.88',
    device: 'Edge v125 on Windows 10',
  },
  {
    id: 'log-804',
    timestamp: '2026-07-10 11:20:10',
    user: 'Clara Oswald',
    userRole: 'PATIENT',
    action: 'REVOKE_CONSENT',
    ipAddress: '172.16.0.4',
    device: 'Mobile Safari on iOS 17',
  },
];

export const AdminConsentPage: React.FC = () => {
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [consents] = useState<ConsentItem[]>(CONSENT_DIRECTORY_DATA);
  const [accessLogs] = useState<AccessLogItem[]>(ACCESS_LOG_EVENT_DATA);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusTab, setSelectedStatusTab] = useState<string>('ALL');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Selected Consent Details Modal State
  const [selectedConsentModal, setSelectedConsentModal] = useState<ConsentItem | null>(null);

  // Selected Access Log Modal State
  const [isAccessLogModalOpen, setIsAccessLogModalOpen] = useState(false);

  // Status Filter Categories
  const statusTabs = ['ALL', 'Active', 'Pending Request', 'Revoked', 'Expired'];

  // Filtered Consents calculation
  const filteredConsents = useMemo(() => {
    return consents.filter((item) => {
      const matchesSearch =
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.hospital.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        selectedStatusTab === 'ALL' || item.status.toUpperCase() === selectedStatusTab.toUpperCase();

      return matchesSearch && matchesStatus;
    });
  }, [consents, searchQuery, selectedStatusTab]);

  // Paginated Consents slice
  const paginatedConsents = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredConsents.slice(startIndex, startIndex + pageSize);
  }, [filteredConsents, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredConsents.length / pageSize);

  // Navigation Handlers
  const handleViewPatient = (patientName: string) => {
    navigate(`/admin/users?query=${encodeURIComponent(patientName)}`);
  };

  const handleViewDoctor = (doctorName: string) => {
    navigate(`/admin/users?query=${encodeURIComponent(doctorName)}`);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" /> Enterprise Consent & Access Control Governance
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Consent & Access Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Audit patient consent grants, boundary scopes, doctor authorizations, and cryptographic telemetry logs.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsAccessLogModalOpen(true)}
          leftIcon={<Activity className="w-4 h-4 text-emerald-500" />}
        >
          View System Access Log
        </Button>
      </div>

      {/* 2. Consent Statistics KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Consent Grants</span>
          <span className="text-xl font-black text-slate-900 dark:text-white font-mono block">890</span>
          <span className="text-2xs text-slate-500">Historical records</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider block">Active Consents</span>
          <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono block">620</span>
          <span className="text-2xs text-slate-500">Authorized data flows</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider block">Pending Requests</span>
          <span className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono block">180</span>
          <span className="text-2xs text-slate-500">Awaiting patient approval</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Revoked / Expired</span>
          <span className="text-xl font-black text-slate-700 dark:text-slate-300 font-mono block">90</span>
          <span className="text-2xs text-slate-500">Terminated permissions</span>
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
            placeholder="Search Consent ID, patient, doctor, or hospital..."
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

      {/* 4. Consent Table */}
      {filteredConsents.length === 0 ? (
        /* Empty State UI */
        <Card className="p-12 text-center border-slate-200/80 dark:border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No Consent Records Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
            No patient consent grants match your search query or status filter.
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
                  <th className="px-6 py-3.5">Consent ID</th>
                  <th className="px-6 py-3.5">Patient</th>
                  <th className="px-6 py-3.5">Authorized Doctor</th>
                  <th className="px-6 py-3.5">Hospital / Facility</th>
                  <th className="px-6 py-3.5">Shared Records Scope</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Granted Date</th>
                  <th className="px-6 py-3.5">Expiry Date</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paginatedConsents.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-500">{item.id}</td>
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-primary-600 shrink-0" />
                      <span>{item.patientName}</span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <Stethoscope className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{item.doctorName}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{item.hospital}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {item.sharedRecords.map((rec, i) => (
                          <Badge key={i} variant="outline" size="sm">{rec}</Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={item.status === 'Active' ? 'success' : item.status === 'Pending Request' ? 'warning' : 'secondary'} size="sm" dot>
                        {item.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-400">{item.grantedDate}</td>
                    <td className="px-6 py-4 font-mono text-slate-400">{item.expiryDate}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="xs" onClick={() => setSelectedConsentModal(item)} title="View Details">
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="xs" onClick={() => setIsAccessLogModalOpen(true)} title="View Access Log">
                          <Activity className="w-3.5 h-3.5 text-emerald-500" />
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
        totalItems={filteredConsents.length}
        pageSize={pageSize}
      />

      {/* 6. CONSENT DETAILS PANEL MODAL */}
      {selectedConsentModal && (
        <Dialog
          isOpen={!!selectedConsentModal}
          onClose={() => setSelectedConsentModal(null)}
          title={`Consent Record Authorization Details: ${selectedConsentModal.id}`}
          maxWidth="lg"
        >
          <div className="space-y-6 py-2 text-xs">
            {/* Header info grid */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Status</span>
                <Badge variant={selectedConsentModal.status === 'Active' ? 'success' : 'warning'} size="sm" className="mt-1">
                  {selectedConsentModal.status}
                </Badge>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Granted Date</span>
                <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block font-mono">{selectedConsentModal.grantedDate}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Expiration Date</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5 block font-mono">{selectedConsentModal.expiryDate}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Hospital / Facility</span>
                <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block truncate">{selectedConsentModal.hospital}</span>
              </div>
            </div>

            {/* Patient & Doctor Card Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-primary-600" /> Patient Info
                </span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{selectedConsentModal.patientName}</h4>
                <p className="text-2xs text-slate-400 font-mono">ID: {selectedConsentModal.patientId}</p>
                <Button variant="ghost" size="xs" onClick={() => { setSelectedConsentModal(null); handleViewPatient(selectedConsentModal.patientName); }} className="mt-1">
                  View Patient Account
                </Button>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <Stethoscope className="w-3.5 h-3.5 text-emerald-500" /> Authorized Doctor
                </span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{selectedConsentModal.doctorName}</h4>
                <p className="text-2xs text-slate-400 font-mono">ID: {selectedConsentModal.doctorId}</p>
                <Button variant="ghost" size="xs" onClick={() => { setSelectedConsentModal(null); handleViewDoctor(selectedConsentModal.doctorName); }} className="mt-1">
                  View Doctor Clearance
                </Button>
              </div>
            </div>

            {/* Shared Record Categories */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Shared Record Categories</h4>
              <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                {selectedConsentModal.sharedRecords.map((rec, i) => (
                  <Badge key={i} variant="primary" size="sm">{rec}</Badge>
                ))}
              </div>
            </div>

            {/* Purpose & Notes */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Clinical Purpose & Audit Notes</h4>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                {selectedConsentModal.purpose}
              </p>
              <p className="text-2xs text-slate-400 italic px-1">
                Notes: {selectedConsentModal.notes}
              </p>
            </div>

            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setSelectedConsentModal(null)}>
                Close
              </Button>
              <Button size="sm" onClick={() => { setSelectedConsentModal(null); setIsAccessLogModalOpen(true); }} leftIcon={<Activity className="w-4 h-4" />}>
                View Access Log Events
              </Button>
            </DialogFooter>
          </div>
        </Dialog>
      )}

      {/* 7. ACCESS LOG VIEWER MODAL */}
      <Dialog
        isOpen={isAccessLogModalOpen}
        onClose={() => setIsAccessLogModalOpen(false)}
        title="System Access & Authorization Telemetry Log"
        maxWidth="lg"
      >
        <div className="space-y-4 py-2">
          <AccessLogTable logs={accessLogs} />
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setIsAccessLogModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </div>
      </Dialog>
    </div>
  );
};

export default AdminConsentPage;
