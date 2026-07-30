import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  ShieldCheck,
  Clock,
  Grid,
  List as ListIcon,
  X,
  FileText,
  Brain,
  Calendar,
  Key,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Building,
  Activity,
  Heart,
  FileCheck,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogFooter } from '../components/ui/dialog';
import { PatientCard } from '../components/common/PatientCard';
import { Pagination } from '../components/common/Pagination';
import { useToast } from '../components/ui/toast';
import { patientService } from '../services/patient.service';
import { cn } from '../lib/utils';

export interface AuthorizedPatientItem {
  id: string;
  name: string;
  mrn: string;
  age: number;
  gender: string;
  consentStatus: 'Active' | 'Expiring Soon' | 'Pending Renewal';
  consentExpiry: string;
  lastUpdated: string;
  dataScopes: string[];
  aiRiskLevel: 'LOW' | 'MODERATE' | 'HIGH';
  aiRiskScore: number;
  primaryCondition: string;
  recentRecordsCount: number;
  contactEmail: string;
  phone: string;
}

const AUTHORIZED_PATIENTS_DATA: AuthorizedPatientItem[] = [
  {
    id: 'pat-101',
    name: 'Eleanor Vance',
    mrn: 'MRN-9021',
    age: 58,
    gender: 'Female',
    consentStatus: 'Active',
    consentExpiry: '2026-12-31',
    lastUpdated: '2026-07-28',
    dataScopes: ['EHR Summary', 'Lab Trends', 'Lipid Panel', 'ECG Waveforms'],
    aiRiskLevel: 'MODERATE',
    aiRiskScore: 48,
    primaryCondition: 'Hypertension & Dyslipidemia',
    recentRecordsCount: 6,
    contactEmail: 'eleanor.vance@healthshare.org',
    phone: '+1 (555) 234-5678',
  },
  {
    id: 'pat-102',
    name: 'Marcus Brody',
    mrn: 'MRN-8812',
    age: 64,
    gender: 'Male',
    consentStatus: 'Active',
    consentExpiry: '2026-11-15',
    lastUpdated: '2026-07-27',
    dataScopes: ['ECG Reports', 'EHR Summary', 'Blood Pressure Telemetry'],
    aiRiskLevel: 'LOW',
    aiRiskScore: 22,
    primaryCondition: 'Controlled Hypertension',
    recentRecordsCount: 4,
    contactEmail: 'marcus.brody@healthshare.org',
    phone: '+1 (555) 876-5432',
  },
  {
    id: 'pat-103',
    name: 'Arthur Pendelton',
    mrn: 'MRN-7419',
    age: 42,
    gender: 'Male',
    consentStatus: 'Expiring Soon',
    consentExpiry: '2026-08-05',
    lastUpdated: '2026-07-20',
    dataScopes: ['Lab Results', 'Metabolic Panel'],
    aiRiskLevel: 'LOW',
    aiRiskScore: 18,
    primaryCondition: 'Routine Wellness Screening',
    recentRecordsCount: 2,
    contactEmail: 'arthur.p@healthshare.org',
    phone: '+1 (555) 345-6789',
  },
  {
    id: 'pat-104',
    name: 'Clara Oswald',
    mrn: 'MRN-6102',
    age: 34,
    gender: 'Female',
    consentStatus: 'Active',
    consentExpiry: '2026-10-30',
    lastUpdated: '2026-07-15',
    dataScopes: ['EHR Summary', 'Prescription History'],
    aiRiskLevel: 'LOW',
    aiRiskScore: 12,
    primaryCondition: 'Asthma Management',
    recentRecordsCount: 3,
    contactEmail: 'clara.oswald@healthshare.org',
    phone: '+1 (555) 456-7890',
  },
  {
    id: 'pat-105',
    name: 'Robert Langdon',
    mrn: 'MRN-5219',
    age: 51,
    gender: 'Male',
    consentStatus: 'Pending Renewal',
    consentExpiry: '2026-07-31',
    lastUpdated: '2026-06-30',
    dataScopes: ['Cardiology EMR', 'Lipid Panel'],
    aiRiskLevel: 'HIGH',
    aiRiskScore: 78,
    primaryCondition: 'Chronic Kidney Disease Stage 2',
    recentRecordsCount: 8,
    contactEmail: 'robert.l@healthshare.org',
    phone: '+1 (555) 567-8901',
  },
  {
    id: 'pat-106',
    name: 'Sarah Connor',
    mrn: 'MRN-4301',
    age: 49,
    gender: 'Female',
    consentStatus: 'Active',
    consentExpiry: '2026-12-15',
    lastUpdated: '2026-07-22',
    dataScopes: ['Radiology Scans', 'Lab Trends'],
    aiRiskLevel: 'MODERATE',
    aiRiskScore: 42,
    primaryCondition: 'Arrhythmia Monitoring',
    recentRecordsCount: 5,
    contactEmail: 'sarah.c@healthshare.org',
    phone: '+1 (555) 678-9012',
  },
];

export const AuthorizedPatientsPage: React.FC = () => {
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [patients] = useState<AuthorizedPatientItem[]>(AUTHORIZED_PATIENTS_DATA);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusTab, setSelectedStatusTab] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Selected Patient Details Panel Modal State
  const [selectedPatientDetails, setSelectedPatientDetails] = useState<AuthorizedPatientItem | null>(null);

  // Filtered Patients calculation
  const filteredPatients = useMemo(() => {
    return patients.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.mrn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.primaryCondition.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        selectedStatusTab === 'ALL' || item.consentStatus.toUpperCase() === selectedStatusTab.toUpperCase();

      return matchesSearch && matchesStatus;
    });
  }, [patients, searchQuery, selectedStatusTab]);

  // Paginated Patients slice
  const paginatedPatients = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredPatients.slice(startIndex, startIndex + pageSize);
  }, [filteredPatients, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredPatients.length / pageSize);

  // Handlers
  const handleViewRecords = (patient: AuthorizedPatientItem) => {
    addToast({
      type: 'info',
      title: 'Opening Medical Records',
      message: `Loading encrypted records for ${patient.name} (${patient.mrn}).`,
    });
    navigate('/records');
  };

  const handleViewPrediction = (patient: AuthorizedPatientItem) => {
    addToast({
      type: 'info',
      title: 'Opening AI Risk Predictor',
      message: `Loading ML diagnostic models for ${patient.name}.`,
    });
    navigate('/ai-prediction');
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" /> HIPAA-Consented Patient Directory
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Authorized Patients
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Directory of patients who have granted active data sharing permissions to your practice.
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
            placeholder="Search by patient name, MRN, or diagnosis..."
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

        {/* View Switcher & Status Filter Pills */}
        <div className="flex items-center gap-3 overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center gap-1.5 shrink-0">
            {(['ALL', 'ACTIVE', 'EXPIRING SOON', 'PENDING RENEWAL'] as const).map((tab) => (
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
                {tab === 'ALL' ? 'All Patients' : tab}
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

      {/* 3. Authorized Patients List (Grid & Table View) */}
      {filteredPatients.length === 0 ? (
        /* Empty State UI */
        <Card className="p-12 text-center border-slate-200/80 dark:border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No Authorized Patients Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
            No patient consent records match your current search query or filter choice.
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
            Clear Filters
          </Button>
        </Card>
      ) : viewMode === 'grid' ? (
        /* Grid Layout */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedPatients.map((patient) => (
            <PatientCard
              key={patient.id}
              id={patient.id}
              name={patient.name}
              mrn={patient.mrn}
              age={patient.age}
              gender={patient.gender}
              consentStatus={patient.consentStatus}
              consentExpiry={patient.consentExpiry}
              lastUpdated={patient.lastUpdated}
              dataScopes={patient.dataScopes}
              aiRiskLevel={patient.aiRiskLevel}
              onViewRecords={() => handleViewRecords(patient)}
              onViewPrediction={() => handleViewPrediction(patient)}
              onViewConsent={() => setSelectedPatientDetails(patient)}
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
                  <th className="px-6 py-3.5">Patient Name</th>
                  <th className="px-6 py-3.5">MRN</th>
                  <th className="px-6 py-3.5">Demographics</th>
                  <th className="px-6 py-3.5">Primary Diagnosis</th>
                  <th className="px-6 py-3.5">Consent Status</th>
                  <th className="px-6 py-3.5">Expiry Date</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paginatedPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-primary-50 dark:bg-primary-950/60 text-primary-600 font-bold text-xs flex items-center justify-center shrink-0">
                        {patient.name.charAt(0)}
                      </div>
                      <span>{patient.name}</span>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-500">{patient.mrn}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {patient.age}y, {patient.gender}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300 max-w-xs truncate">
                      {patient.primaryCondition}
                    </td>
                    <td className="px-6 py-4">
                      {patient.consentStatus === 'Active' && <Badge variant="success" size="sm">ACTIVE</Badge>}
                      {patient.consentStatus === 'Expiring Soon' && <Badge variant="warning" size="sm">EXPIRING SOON</Badge>}
                      {patient.consentStatus === 'Pending Renewal' && <Badge variant="danger" size="sm">PENDING RENEWAL</Badge>}
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-400">{patient.consentExpiry}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="xs" onClick={() => setSelectedPatientDetails(patient)} title="Consent Details">
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="xs" onClick={() => handleViewRecords(patient)} title="Medical Records">
                          <FileText className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="xs" onClick={() => handleViewPrediction(patient)} title="AI Prediction">
                          <Brain className="w-3.5 h-3.5" />
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
        totalItems={filteredPatients.length}
        pageSize={pageSize}
      />

      {/* 5. PATIENT DETAILS PANEL MODAL */}
      {selectedPatientDetails && (
        <Dialog
          isOpen={!!selectedPatientDetails}
          onClose={() => setSelectedPatientDetails(null)}
          title={`Patient Clinical Profile: ${selectedPatientDetails.name}`}
          maxWidth="lg"
        >
          <div className="space-y-6 py-2 text-xs">
            {/* Header info card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary-100 dark:bg-primary-900/60 text-primary-700 dark:text-primary-300 font-black text-lg flex items-center justify-center">
                  {selectedPatientDetails.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">{selectedPatientDetails.name}</h4>
                  <p className="text-slate-500 font-mono">
                    MRN: {selectedPatientDetails.mrn} • {selectedPatientDetails.age}y, {selectedPatientDetails.gender}
                  </p>
                </div>
              </div>
              <Badge variant={selectedPatientDetails.consentStatus === 'Active' ? 'success' : 'warning'} size="sm">
                Consent {selectedPatientDetails.consentStatus}
              </Badge>
            </div>

            {/* Condition & AI Risk Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Primary Clinical Diagnosis</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white block">{selectedPatientDetails.primaryCondition}</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">AI Cardiovascular Risk Index</span>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-slate-900 dark:text-white font-mono">{selectedPatientDetails.aiRiskScore}%</span>
                  <Badge variant={selectedPatientDetails.aiRiskLevel === 'LOW' ? 'success' : selectedPatientDetails.aiRiskLevel === 'MODERATE' ? 'warning' : 'danger'} size="sm">
                    {selectedPatientDetails.aiRiskLevel} RISK
                  </Badge>
                </div>
              </div>
            </div>

            {/* Authorized Data Scopes */}
            <div className="space-y-2">
              <span className="font-bold text-slate-900 dark:text-white uppercase text-[10px] tracking-wider block">Authorized Data Scope</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedPatientDetails.dataScopes.map((scope, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-semibold">
                    <Key className="w-3 h-3 text-primary-600" /> {scope}
                  </span>
                ))}
              </div>
            </div>

            {/* Contact & Expiry Metadata */}
            <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 grid grid-cols-2 sm:grid-cols-3 gap-4 text-2xs text-slate-500">
              <div>
                <span className="block font-bold text-slate-400 uppercase">Email Contact</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{selectedPatientDetails.contactEmail}</span>
              </div>
              <div>
                <span className="block font-bold text-slate-400 uppercase">Phone</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{selectedPatientDetails.phone}</span>
              </div>
              <div>
                <span className="block font-bold text-slate-400 uppercase">Consent Expiry</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{selectedPatientDetails.consentExpiry}</span>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setSelectedPatientDetails(null)}>
                Close Panel
              </Button>
              <Button size="sm" onClick={() => handleViewRecords(selectedPatientDetails)} leftIcon={<FileText className="w-4 h-4" />}>
                View Medical Records
              </Button>
            </DialogFooter>
          </div>
        </Dialog>
      )}
    </div>
  );
};

export default AuthorizedPatientsPage;
