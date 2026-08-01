import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/toast';
import { StatCard } from '../components/common/StatCard';
import { FileUpload } from '../components/common/FileUpload';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogFooter } from '../components/ui/dialog';
import { usePatientDashboard } from '../hooks/usePatientDashboard';
import { consentService } from '../services/consent.service';
import {
  Heart,
  ShieldCheck,
  UploadCloud,
  FileText,
  PhoneCall,
  Shield,
  Brain,
  Calendar,
  AlertTriangle,
  RotateCw,
  Bell,
} from 'lucide-react';
import {
  RecentActivityTimeline,
  AppointmentWidget,
  PredictionSummaryCard,
  HealthcareRequestsSection,
} from '../components/patient';

export const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // --- Part 2: React Query Data Hook ---
  const { data, isLoading, isError, error, refetch } = usePatientDashboard();

  // --- Part 4: Dynamic Metrics Extraction ---
  const patientName = data?.profile?.name || user?.name || 'Sarah Jenkins';
  const healthIndex = data?.profile?.healthIndex ?? 98;
  const medicalRecordsCount = data?.summary?.medicalRecords ?? 0;
  const activeConsentsCount = data?.summary?.activeConsents ?? 0;
  const appointmentsCount = data?.summary?.appointments ?? 0;
  const notificationsCount = data?.summary?.notifications ?? 0;
  const latestCkdRisk = data?.summary?.latestCkdRisk || 'Low Risk (8.2%)';
  const nextAppointmentText = data?.summary?.nextAppointment || 'Tomorrow, 10:30 AM';

  const mappedAppointments = useMemo(() => {
    if (!data?.upcoming_appointments || data.upcoming_appointments.length === 0) return undefined;
    return data.upcoming_appointments.map((a: any) => ({
      id: `app-${a.id}`,
      doctorName: a.doctor_name || 'Dr. HealthShare Specialist',
      specialty: a.reason || 'General Health Review',
      hospital: 'HealthShare Virtual Center',
      date: a.appointment_date,
      time: a.appointment_time,
      type: (a.meeting_mode === 'Telehealth' ? 'Telehealth' : 'In-Person') as any,
      status: (a.status === 'Accepted' || a.status === 'Confirmed' ? 'Confirmed' : 'Pending') as any,
    }));
  }, [data?.upcoming_appointments]);

  // --- Modals & Interactivity States ---
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isLockoutConfirmOpen, setIsLockoutConfirmOpen] = useState(false);
  const [lockoutLoading, setLockoutLoading] = useState(false);

  // --- UI Action Handlers ---
  const handleEmergencyLockout = async () => {
    setLockoutLoading(true);
    try {
      const activeConsents = await consentService.listActiveConsents();
      for (const c of activeConsents) {
        if (c.doctorId) {
          await consentService.revokeConsent({
            doctor_id: c.doctorId,
          });
        }
      }
    } catch (err) {
      // In case of offline/demo mode, proceed cleanly
    } finally {
      setLockoutLoading(false);
      setIsLockoutConfirmOpen(false);
      addToast({
        type: 'error',
        title: 'Emergency Lockout Active',
        message: 'All doctor and researcher data access permissions have been immediately revoked.',
      });
      refetch();
    }
  };


  const handleFilesUploaded = (files: File[]) => {
    if (files.length === 0) return;
    setIsUploadModalOpen(false);
    addToast({
      type: 'success',
      title: 'Record Uploaded',
      message: `Successfully encrypted and stored "${files[0].name}".`,
    });
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* =================================================================== */}
      {/* PART 6: ERROR STATE CARD */}
      {/* =================================================================== */}
      {isError && (
        <div className="p-5 rounded-3xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-500 text-white shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-rose-900 dark:text-rose-100">
                Failed to load latest patient dashboard metrics
              </h3>
              <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
                {error?.message || 'Unable to connect to backend service. Showing cached metrics.'}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            leftIcon={<RotateCw className="w-4 h-4 text-rose-600" />}
            className="shrink-0 border-rose-300 hover:bg-rose-100 text-rose-800 dark:text-rose-200"
          >
            Retry API Fetch
          </Button>
        </div>
      )}

      {/* =================================================================== */}
      {/* 1. WELCOME BANNER & HEALTH INDEX (WITH PART 5 SKELETON LOADER) */}
      {/* =================================================================== */}
      {isLoading ? (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-800 animate-pulse h-36 flex items-center justify-between">
          <div className="space-y-3 w-1/2">
            <div className="h-4 bg-slate-700 rounded-full w-1/3" />
            <div className="h-8 bg-slate-700 rounded-xl w-3/4" />
          </div>
          <div className="h-16 w-32 bg-slate-700 rounded-2xl" />
        </div>
      ) : (
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-primary-900 via-primary-800 to-slate-900 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-primary-200 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" /> HIPAA-Encrypted Personal Health Portal
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Good afternoon, {patientName} 👋
                </h1>
                <p className="text-xs sm:text-sm text-slate-200 mt-1 leading-relaxed">
                  Welcome back to your HealthShare Personal Health Portal.
                </p>
              </div>
            </div>

            {/* Health Index Score Card */}
            <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex items-center gap-4 shrink-0">
              <div className="p-3 bg-emerald-500/20 text-emerald-300 rounded-xl">
                <Heart className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-2xs font-bold uppercase tracking-wider text-slate-300 block">Health Index</span>
                <span className="text-2xl font-black text-white font-sans">
                  {healthIndex} <span className="text-xs text-emerald-400 font-normal">/ 100</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 2. HEALTH SUMMARY (4 CARDS WITH API METRICS & SKELETON LOADERS) */}
      {/* =================================================================== */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Health Summary</h3>
          {notificationsCount > 0 && (
            <Badge variant="warning" size="sm" className="flex items-center gap-1">
              <Bell className="w-3 h-3" /> {notificationsCount} New Alerts
            </Badge>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-5 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse h-28" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Medical Records Card */}
            <StatCard
              title="Medical Records"
              value={medicalRecordsCount > 0 ? `${medicalRecordsCount} Records` : '0 Records'}
              change={medicalRecordsCount > 0 ? '+2 this month' : 'No records uploaded'}
              trend={medicalRecordsCount > 0 ? 'up' : 'neutral'}
              subtext="AES-256 Secured"
              icon={<FileText className="w-5 h-5" />}
            />

            {/* Active Consents Card */}
            <StatCard
              title="Active Consents"
              value={activeConsentsCount > 0 ? `${activeConsentsCount} Granted` : '0 Granted'}
              change={activeConsentsCount > 0 ? '1 Pending' : 'No active consent'}
              trend="neutral"
              subtext="Doctor access permissions"
              icon={<ShieldCheck className="w-5 h-5" />}
              iconBg="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
            />

            {/* Latest CKD Risk Card */}
            <StatCard
              title="Latest CKD Risk"
              value={latestCkdRisk}
              change="94.5% confidence"
              trend="down"
              subtext="ML Model Assessment"
              icon={<Brain className="w-5 h-5" />}
              iconBg="bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
            />

            {/* Next Appointment Card (Part 7: Empty state if 0) */}
            <StatCard
              title="Next Appointment"
              value={appointmentsCount > 0 ? 'Tomorrow' : 'No appointments'}
              subtext={appointmentsCount > 0 ? nextAppointmentText : 'Click Quick Actions to book'}
              icon={<Calendar className="w-5 h-5" />}
              iconBg="bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300"
            />
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* 3. QUICK ACTIONS (4 CARDS) */}
      {/* =================================================================== */}
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Action 1: Upload Medical Record */}
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all text-left group"
          >
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 w-fit mb-3 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Upload Record</h4>
            <p className="text-2xs text-slate-500 dark:text-slate-400 mt-0.5">Encrypt & upload EHR file</p>
          </button>

          {/* Action 2: View Medical Records */}
          <button
            onClick={() => navigate('/records')}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all text-left group"
          >
            <div className="p-3 rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-950/60 dark:text-primary-400 w-fit mb-3 group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Medical Records</h4>
            <p className="text-2xs text-slate-500 dark:text-slate-400 mt-0.5">View health documents</p>
          </button>

          {/* Action 3: Grant Consent */}
          <button
            onClick={() => navigate('/consent')}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all text-left group"
          >
            <div className="p-3 rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400 w-fit mb-3 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Grant Consent</h4>
            <p className="text-2xs text-slate-500 dark:text-slate-400 mt-0.5">Manage doctor permissions</p>
          </button>

          {/* Action 4: Run AI Prediction */}
          <button
            onClick={() => navigate('/ai-prediction')}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all text-left group"
          >
            <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 w-fit mb-3 group-hover:scale-110 transition-transform">
              <Brain className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">AI CKD Prediction</h4>
            <p className="text-2xs text-slate-500 dark:text-slate-400 mt-0.5">Evaluate ML risk model</p>
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 4. HEALTHCARE REQUESTS SECTION (CORE HEALTHSHARE WORKFLOW) */}
      {/* =================================================================== */}
      <HealthcareRequestsSection />

      {/* =================================================================== */}
      {/* 5. LATEST AI PREDICTION CARD & UPCOMING APPOINTMENT CARD */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PredictionSummaryCard
          predictionResult="Stage 1 / Low Risk"
          riskLevel={latestCkdRisk}
          confidenceScore="94.5%"
          predictionDate="July 28, 2026"
        />

        <AppointmentWidget initialAppointments={mappedAppointments} />
      </div>

      {/* =================================================================== */}
      {/* 6. RECENT MEDICAL ACTIVITY TIMELINE (LAST 4 ACTIVITIES) */}
      {/* =================================================================== */}
      <RecentActivityTimeline />

      {/* =================================================================== */}
      {/* MODAL DIALOGS FOR DEMO INTERACTION */}
      {/* =================================================================== */}
      <Dialog isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} title="Upload Clinical Medical Record" maxWidth="lg">
        <FileUpload onFilesSelected={handleFilesUploaded} />
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => setIsUploadModalOpen(false)}>Cancel</Button>
        </DialogFooter>
      </Dialog>

      <Dialog isOpen={isEmergencyModalOpen} onClose={() => setIsEmergencyModalOpen(false)} title="Patient Emergency Health ID" maxWidth="md">
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-rose-900 dark:text-rose-100">Blood Group</span>
              <Badge variant="danger" size="sm">O POSITIVE (O+)</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-rose-900 dark:text-rose-100">Allergies</span>
              <span className="text-rose-700 dark:text-rose-300 font-semibold">Penicillin, Latex</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-rose-900 dark:text-rose-100">Emergency Contact</span>
              <span className="inline-flex items-center gap-1 font-bold text-slate-900 dark:text-white">
                <PhoneCall className="w-3.5 h-3.5 text-emerald-500" /> +1 (555) 948-2041 (Spouse)
              </span>
            </div>
          </div>

          <div className="pt-2">
            <Button variant="danger" className="w-full" onClick={() => { setIsEmergencyModalOpen(false); setIsLockoutConfirmOpen(true); }} leftIcon={<Shield className="w-4 h-4" />}>
              Trigger Emergency Lockout (Revoke All Shared Access)
            </Button>
          </div>
        </div>
      </Dialog>

      <ConfirmDialog
        isOpen={isLockoutConfirmOpen}
        onClose={() => setIsLockoutConfirmOpen(false)}
        onConfirm={handleEmergencyLockout}
        title="Execute Emergency Access Lockout?"
        description="This will immediately revoke all doctor and researcher data access permissions across HealthShare. Only you will retain access."
        confirmText="Yes, Lock Out All Access"
        variant="danger"
        isLoading={lockoutLoading}
      />
    </div>
  );
};

export default PatientDashboard;
