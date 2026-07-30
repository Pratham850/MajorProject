import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ui/toast';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  AppointmentSummaryCard,
  AppointmentRequestCard,
  AppointmentCard,
  AppointmentDetailsModal,
  DoctorNotificationWidget,
  DoctorAppointmentRequest,
} from '../components/doctor';
import { CalendarCheck, Plus, Search } from 'lucide-react';

const initialAppointments: (DoctorAppointmentRequest & {
  diagnosis?: string;
  prescriptionUploaded?: boolean;
})[] = [
  {
    id: 'apt-101',
    patientId: 'p-1',
    patientName: 'Sarah Jenkins',
    patientAge: 42,
    patientGender: 'Female',
    date: 'Tomorrow, Jul 31',
    time: '10:30 AM',
    department: 'Cardiology',
    hospital: 'St. Jude Cardiology Center',
    reasonForVisit: 'Cardiology Quarterly Follow-up Consultation & Lipid Panel Review',
    status: 'PENDING',
    consentGranted: true,
    aiPredictionAvailable: true,
    notes: 'Patient reports mild dyspnea during exertion. Requested full EHR access.',
  },
  {
    id: 'apt-102',
    patientId: 'p-2',
    patientName: 'Jane Doe',
    patientAge: 38,
    patientGender: 'Female',
    date: 'Tomorrow, Jul 31',
    time: '02:00 PM',
    department: 'Renal Health',
    hospital: 'Metropolitan General Hospital',
    reasonForVisit: 'eGFR and Creatinine Biomarker Assessment',
    status: 'PENDING',
    consentGranted: true,
    aiPredictionAvailable: true,
    notes: 'Prior history of elevated blood pressure and Stage 1 CKD risk indicators.',
  },
  {
    id: 'apt-103',
    patientId: 'p-3',
    patientName: 'Robert Taylor',
    patientAge: 56,
    patientGender: 'Male',
    date: 'Aug 02, 2026',
    time: '11:15 AM',
    department: 'General Internal Medicine',
    hospital: 'St. Jude Health System',
    reasonForVisit: 'Annual General Medical Examination',
    status: 'PENDING',
    consentGranted: false,
    aiPredictionAvailable: false,
    notes: 'First time visit. Needs consent request for EHR access.',
  },
  {
    id: 'apt-104',
    patientId: 'p-4',
    patientName: 'Michael Vance',
    patientAge: 49,
    patientGender: 'Male',
    date: 'Today, Jul 30',
    time: '03:30 PM',
    department: 'Cardiology',
    hospital: 'St. Jude Cardiology Center',
    reasonForVisit: 'Post-Op Coronary Stent Follow-up',
    status: 'CONFIRMED',
    consentGranted: true,
    aiPredictionAvailable: true,
    notes: 'Confirmed telehealth video consultation.',
  },
  {
    id: 'apt-105',
    patientId: 'p-5',
    patientName: 'Emily Watson',
    patientAge: 34,
    patientGender: 'Female',
    date: 'Aug 03, 2026',
    time: '09:00 AM',
    department: 'Endocrinology',
    hospital: 'Metropolitan Health Center',
    reasonForVisit: 'Diabetic Nephropathy Screening',
    status: 'CONFIRMED',
    consentGranted: true,
    aiPredictionAvailable: true,
    notes: 'Routine HbA1c and renal profile review.',
  },
  {
    id: 'apt-106',
    patientId: 'p-6',
    patientName: 'David Miller',
    patientAge: 61,
    patientGender: 'Male',
    date: 'Jul 28, 2026',
    time: '10:00 AM',
    department: 'Nephrology',
    hospital: 'St. Jude Cardiology Center',
    reasonForVisit: 'Stage 2 Chronic Kidney Disease Consultation',
    status: 'COMPLETED',
    consentGranted: true,
    aiPredictionAvailable: true,
    diagnosis: 'Mild Renal Insufficiency (eGFR 78 mL/min)',
    prescriptionUploaded: true,
    notes: 'Prescribed Lisinopril 10mg. Advised low-sodium diet and repeat serum creatinine in 3 months.',
  },
];

export const DoctorAppointmentsPage: React.FC = () => {
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState(initialAppointments);
  const [filterTab, setFilterTab] = useState<'ALL' | 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'RESCHEDULED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<DoctorAppointmentRequest | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // --- Handlers ---
  const handleAccept = (id: string, name: string) => {
    setAppointments((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: 'CONFIRMED' } : app))
    );
    addToast({
      type: 'success',
      title: 'Appointment Confirmed',
      message: `Accepted appointment request from ${name}.`,
    });
  };

  const handleReject = (id: string, name: string) => {
    setAppointments((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: 'CANCELLED' } : app))
    );
    addToast({
      type: 'warning',
      title: 'Appointment Declined',
      message: `Declined appointment request from ${name}.`,
    });
  };

  const handleReschedule = (id: string, name: string) => {
    setAppointments((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: 'RESCHEDULED' } : app))
    );
    addToast({
      type: 'info',
      title: 'Reschedule Requested',
      message: `Sent reschedule options to ${name}.`,
    });
  };

  const handleRequestConsent = (patientId: string, name: string) => {
    addToast({
      type: 'info',
      title: 'Consent Request Sent',
      message: `Requested medical record access permission from ${name}.`,
    });
  };

  const handleStartConsultation = (id: string, name: string) => {
    addToast({
      type: 'success',
      title: 'Opening Consultation Workspace',
      message: `Launching live workspace for ${name}...`,
    });
    navigate('/doctor/consultation');
  };

  const handleViewDetails = (app: DoctorAppointmentRequest) => {
    setSelectedAppointment(app);
    setIsDetailsModalOpen(true);
  };

  // --- Filtering ---
  const filteredAppointments = appointments.filter((app) => {
    const matchesTab = filterTab === 'ALL' || app.status === filterTab;
    const matchesSearch =
      app.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.reasonForVisit.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const pendingRequests = appointments.filter((a) => a.status === 'PENDING');
  const confirmedAppointments = appointments.filter((a) => a.status === 'CONFIRMED');
  const completedAppointments = appointments.filter((a) => a.status === 'COMPLETED');

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              Doctor Appointment Management
            </h1>
            <Badge variant="info" size="sm">Clinical Schedule</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Review patient booking requests, manage clinical schedules, and prepare for upcoming telehealth consultations.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => addToast({ type: 'info', title: 'Schedule Slot', message: 'Creating open consultation slot...' })}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add Open Slot
        </Button>
      </div>

      {/* 2. Summary Statistics Cards */}
      <AppointmentSummaryCard
        todaysCount={1}
        pendingCount={pendingRequests.length}
        confirmedCount={confirmedAppointments.length}
        completedCount={completedAppointments.length}
      />

      {/* 3. Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patient, department, or reason..."
            className="w-full bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 text-xs rounded-xl pl-9 pr-4 py-2 border border-transparent focus:border-primary-500 focus:outline-none transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs w-full sm:w-auto">
          {(['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'RESCHEDULED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-2xs font-bold transition-all ${
                filterTab === tab
                  ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              {tab === 'ALL' ? 'All Appointments' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Section: Pending Appointment Requests */}
      {(filterTab === 'ALL' || filterTab === 'PENDING') && pendingRequests.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-amber-500" />
              <span>Pending Appointment Requests</span>
              <Badge variant="warning" size="sm">{pendingRequests.length} Requiring Action</Badge>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingRequests.map((req) => (
              <AppointmentRequestCard
                key={req.id}
                request={req}
                onAccept={handleAccept}
                onReject={handleReject}
                onReschedule={handleReschedule}
                onViewDetails={handleViewDetails}
                onRequestConsent={handleRequestConsent}
              />
            ))}
          </div>
        </div>
      )}

      {/* 5. Section: Confirmed Appointments */}
      {(filterTab === 'ALL' || filterTab === 'CONFIRMED') && confirmedAppointments.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-sky-500" />
              <span>Confirmed Upcoming Consultations</span>
              <Badge variant="info" size="sm">{confirmedAppointments.length} Confirmed</Badge>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {confirmedAppointments.map((app) => (
              <AppointmentCard
                key={app.id}
                appointment={app}
                onStartConsultation={handleStartConsultation}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        </div>
      )}

      {/* 6. Section: Completed Consultations */}
      {(filterTab === 'ALL' || filterTab === 'COMPLETED') && completedAppointments.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-emerald-500" />
              <span>Completed Consultations History</span>
              <Badge variant="success" size="sm">{completedAppointments.length} Finished</Badge>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedAppointments.map((app) => (
              <AppointmentCard
                key={app.id}
                appointment={app}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        </div>
      )}

      {/* 7. Clinical Notifications Widget */}
      <DoctorNotificationWidget />

      {/* 8. Appointment Details Modal */}
      <AppointmentDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        appointment={selectedAppointment}
        onAccept={handleAccept}
        onReject={handleReject}
        onReschedule={handleReschedule}
      />
    </div>
  );
};

export default DoctorAppointmentsPage;
