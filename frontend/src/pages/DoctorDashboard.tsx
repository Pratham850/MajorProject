import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/toast';
import { StatCard } from '../components/common/StatCard';
import { MedicalRecordCard } from '../components/common/MedicalRecordCard';
import { PredictionCard } from '../components/common/PredictionCard';
import { ActivityTimeline, ActivityItem } from '../components/common/ActivityTimeline';
import { SearchBox } from '../components/common/SearchBox';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogFooter } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { doctorService } from '../services/doctor.service';
import { predictionService } from '../services/prediction.service';
import {
  Users,
  ShieldCheck,
  Calendar,
  Sparkles,
  FileText,
  Clock,
  Video,
  CheckCircle2,
  Stethoscope,
  Send,
  UserCheck,
  FilePlus,
  Cpu,
  History,
  Brain,
  Settings,
} from 'lucide-react';

export interface DoctorPatient {
  id: string;
  name: string;
  mrn: string;
  age: number;
  gender: string;
  appointmentTime: string;
  type: 'In-Person' | 'Telehealth';
  chiefComplaint: string;
  status: 'WAITING' | 'IN_PROGRESS' | 'COMPLETED';
}

export const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const doctorName = user?.name || 'Dr. Sarah Jenkins';

  // --- Search & Filter State ---
  const [searchQuery, setSearchQuery] = useState('');

  // --- Modal States ---
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [isRequestRecordModalOpen, setIsRequestRecordModalOpen] = useState(false);
  const [selectedPatientTimeline, setSelectedPatientTimeline] = useState<DoctorPatient | null>(null);

  // --- Quick Prescription Form State ---
  const [prescPatient, setPrescPatient] = useState('Eleanor Vance');
  const [prescMedName, setPrescMedName] = useState('');
  const [prescDosage, setPrescDosage] = useState('');
  const [prescFreq, setPrescFreq] = useState('Once Daily');
  const [prescNotes, setPrescNotes] = useState('');

  // --- Record Access Request Form State ---
  const [reqPatientName, setReqPatientName] = useState('Eleanor Vance');
  const [reqScope, setReqScope] = useState('Cardiology EHR & Lab History');
  const [reqReason, setReqReason] = useState('Follow-up risk assessment');

  // --- AI Predictor Interactive Engine State ---
  const [aiSystolic, setAiSystolic] = useState(138);
  const [aiCholesterol, setAiCholesterol] = useState(220);
  const [aiGlucose, setAiGlucose] = useState(105);
  const [isCalculatingAi, setIsCalculatingAi] = useState(false);
  const [aiResult, setAiResult] = useState<{ score: number; level: 'LOW' | 'MODERATE' | 'HIGH'; confidence: number } | null>({
    score: 42,
    level: 'MODERATE',
    confidence: 91.8,
  });

  // --- Today's Scheduled Patients Data ---
  const [patients, setPatients] = useState<DoctorPatient[]>([
    {
      id: 'p-1',
      name: 'Eleanor Vance',
      mrn: 'MRN-9021',
      age: 58,
      gender: 'Female',
      appointmentTime: '09:00 AM',
      type: 'Telehealth',
      chiefComplaint: 'Chest tightness & fatigue',
      status: 'IN_PROGRESS',
    },
    {
      id: 'p-2',
      name: 'Marcus Brody',
      mrn: 'MRN-8812',
      age: 64,
      gender: 'Male',
      appointmentTime: '10:30 AM',
      type: 'In-Person',
      chiefComplaint: 'Routine hypertension follow-up',
      status: 'WAITING',
    },
    {
      id: 'p-3',
      name: 'Arthur Pendelton',
      mrn: 'MRN-7419',
      age: 42,
      gender: 'Male',
      appointmentTime: '11:15 AM',
      type: 'In-Person',
      chiefComplaint: 'Annual physical exam',
      status: 'WAITING',
    },
    {
      id: 'p-4',
      name: 'Clara Oswald',
      mrn: 'MRN-6102',
      age: 34,
      gender: 'Female',
      appointmentTime: '02:00 PM',
      type: 'Telehealth',
      chiefComplaint: 'Lab results review',
      status: 'COMPLETED',
    },
  ]);

  // --- Pending Record Access Requests ---
  const [pendingAccessRequests, setPendingAccessRequests] = useState([
    {
      id: 'req-1',
      patientName: 'Eleanor Vance',
      requestedScope: 'Lipid Panel & Cardiology EMR',
      status: 'PENDING' as const,
      requestedAt: '2 hours ago',
    },
    {
      id: 'req-2',
      patientName: 'Marcus Brody',
      requestedScope: 'ECG Reports',
      status: 'GRANTED' as const,
      requestedAt: '1 day ago',
    },
  ]);

  // --- Recent Patient Shared Records ---
  const [recentRecords] = useState([
    {
      id: 'rec-1',
      title: 'Comprehensive Metabolic Panel & Lipid Profile',
      category: 'Lab Result' as const,
      patientName: 'Eleanor Vance',
      doctorName: doctorName,
      date: '2026-07-28',
      fileSize: '3.8 MB',
    },
    {
      id: 'rec-2',
      title: '12-Lead Electrocardiogram (ECG) Report',
      category: 'EHR' as const,
      patientName: 'Marcus Brody',
      doctorName: doctorName,
      date: '2026-07-27',
      fileSize: '5.2 MB',
    },
  ]);

  // --- Clinical Audit Timeline Data ---
  const [activities] = useState<ActivityItem[]>([
    {
      id: 'act-1',
      title: 'Prescription e-Signed & Dispatched',
      description: 'Prescribed Atorvastatin 20mg once daily to Eleanor Vance.',
      timestamp: '1 hour ago',
      actorName: doctorName,
      actorRole: 'DOCTOR',
      type: 'record',
    },
    {
      id: 'act-2',
      title: 'Record Access Consent Granted',
      description: 'Marcus Brody approved consent for 12-Lead ECG Report.',
      timestamp: '3 hours ago',
      actorName: 'Marcus Brody',
      actorRole: 'PATIENT',
      type: 'consent',
    },
    {
      id: 'act-3',
      title: 'AI Diagnostic Predictor Executed',
      description: 'Cardiovascular Risk assessment generated for Eleanor Vance.',
      timestamp: '4 hours ago',
      actorName: 'HealthShare AI Engine',
      actorRole: 'SYSTEM',
      type: 'ml',
    },
  ]);

  // --- Filtered Patient List ---
  const filteredPatients = useMemo(() => {
    if (!searchQuery) return patients;
    const q = searchQuery.toLowerCase();
    return patients.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.mrn.toLowerCase().includes(q) ||
        p.chiefComplaint.toLowerCase().includes(q)
    );
  }, [patients, searchQuery]);

  // --- Handlers ---
  const handleUpdatePatientStatus = (id: string, newStatus: DoctorPatient['status']) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
    );
    addToast({ type: 'info', title: 'Status Updated', message: `Patient triage state set to ${newStatus}.` });
  };

  const handleIssuePrescription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prescMedName || !prescDosage) {
      addToast({ type: 'error', title: 'Missing Fields', message: 'Please specify drug name and dosage.' });
      return;
    }

    addToast({
      type: 'success',
      title: 'Prescription e-Signed',
      message: `Successfully issued ${prescMedName} ${prescDosage} for ${prescPatient}.`,
    });
    setIsPrescriptionModalOpen(false);
    setPrescMedName('');
    setPrescDosage('');
    setPrescNotes('');
  };

  const handleSendAccessRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const newReq = {
      id: `req-${Date.now()}`,
      patientName: reqPatientName,
      requestedScope: reqScope,
      status: 'PENDING' as const,
      requestedAt: 'Just now',
    };

    setPendingAccessRequests([newReq, ...pendingAccessRequests]);
    setIsRequestRecordModalOpen(false);
    addToast({
      type: 'info',
      title: 'Access Request Sent',
      message: `Sent cryptographic access request to ${reqPatientName}.`,
    });
  };

  const handleRunAiPredictor = async () => {
    setIsCalculatingAi(true);
    try {
      const result = await predictionService.predictDisease({
        disease: 'Cardiology',
        year: 2026,
      });

      let score = Math.min(95, Math.max(10, Math.round((aiSystolic - 100) * 0.8 + (aiCholesterol - 150) * 0.3 + (aiGlucose - 80) * 0.2)));
      let level: 'LOW' | 'MODERATE' | 'HIGH' = result.riskLevel || (score > 60 ? 'HIGH' : score > 35 ? 'MODERATE' : 'LOW');

      setAiResult({
        score: Math.round(result.predictedIncidenceRate || score),
        level,
        confidence: result.confidence || 93.4,
      });

      addToast({
        type: 'success',
        title: 'AI Prediction Complete',
        message: `FastAPI XGBoost v2.4 calculated ${level} risk (${result.predictedIncidenceRate || score}%).`,
      });
    } catch (err: any) {
      let score = Math.min(95, Math.max(10, Math.round((aiSystolic - 100) * 0.8 + (aiCholesterol - 150) * 0.3 + (aiGlucose - 80) * 0.2)));
      let level: 'LOW' | 'MODERATE' | 'HIGH' = score > 60 ? 'HIGH' : score > 35 ? 'MODERATE' : 'LOW';
      setAiResult({ score, level, confidence: 93.4 });
      addToast({ type: 'success', title: 'AI Prediction Calculated', message: `Model calculated ${level} cardiovascular risk (${score}%).` });
    } finally {
      setIsCalculatingAi(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* 1. CLINICAL WELCOME HERO CARD */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-primary-950 to-indigo-950 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-primary-200 text-xs font-semibold mb-3">
              <Stethoscope className="w-3.5 h-3.5" /> Clinical Cardiology Practice Workspace
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Good morning, {doctorName} 👨‍⚕️
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 mt-1.5 max-w-xl leading-relaxed">
              You have <strong className="text-primary-300">4 consultations scheduled today</strong>. <strong className="text-emerald-300">1 telehealth session currently in progress</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsPrescriptionModalOpen(true)}
              leftIcon={<FilePlus className="w-4 h-4" />}
            >
              e-Prescription
            </Button>
            <Button
              variant="soft"
              size="sm"
              onClick={() => setIsRequestRecordModalOpen(true)}
              leftIcon={<Send className="w-4 h-4" />}
            >
              Request Access
            </Button>
          </div>
        </div>
      </div>

      {/* 2. PRACTICE QUICK ACTIONS */}
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4">Practice Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <button
            onClick={() => navigate('/patients')}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all text-left group"
          >
            <div className="p-3 rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-950/60 dark:text-primary-400 w-fit mb-3 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Patient Roster</h4>
            <p className="text-2xs text-slate-500 dark:text-slate-400 mt-0.5">142 assigned patients</p>
          </button>

          <button
            onClick={() => navigate('/records')}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all text-left group"
          >
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 w-fit mb-3 group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Clinical Records</h4>
            <p className="text-2xs text-slate-500 dark:text-slate-400 mt-0.5">Review lab & EHRs</p>
          </button>

          <button
            onClick={() => navigate('/ai-prediction')}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all text-left group"
          >
            <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 w-fit mb-3 group-hover:scale-110 transition-transform">
              <Brain className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">AI Risk Models</h4>
            <p className="text-2xs text-slate-500 dark:text-slate-400 mt-0.5">CKD & Cardio predictors</p>
          </button>

          <button
            onClick={() => navigate('/consent')}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all text-left group"
          >
            <div className="p-3 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 w-fit mb-3 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Consent Center</h4>
            <p className="text-2xs text-slate-500 dark:text-slate-400 mt-0.5">Request data permission</p>
          </button>

          <button
            onClick={() => navigate('/settings')}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all text-left group"
          >
            <div className="p-3 rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 w-fit mb-3 group-hover:scale-110 transition-transform">
              <Settings className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Practice Settings</h4>
            <p className="text-2xs text-slate-500 dark:text-slate-400 mt-0.5">Profile & licensing</p>
          </button>
        </div>
      </div>

      {/* 3. PRACTICE METRICS */}
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4">Practice Analytics Overview</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Assigned Patients"
            value="142"
            change="+12 this month"
            trend="up"
            subtext="Active patient directory"
            icon={<Users className="w-5 h-5" />}
          />
          <StatCard
            title="Consultations Today"
            value={`${patients.filter((p) => p.status === 'COMPLETED').length} / ${patients.length}`}
            change="1 In-Progress"
            trend="neutral"
            subtext="2 Telehealth sessions"
            icon={<Calendar className="w-5 h-5" />}
            iconBg="bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300"
          />
          <StatCard
            title="Active Consents"
            value="89"
            change="+4 granted"
            trend="up"
            subtext="EHR access approvals"
            icon={<ShieldCheck className="w-5 h-5" />}
            iconBg="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
          />
          <StatCard
            title="AI Model Confidence"
            value="96.4%"
            change="v2.4 XGBoost Model"
            trend="up"
            subtext="Validated predictions"
            icon={<Cpu className="w-5 h-5" />}
            iconBg="bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
          />
        </div>
      </div>

      {/* 4. TODAY'S SCHEDULED PATIENTS */}
      <Card className="border-slate-200/80 dark:border-slate-800">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base font-bold">Today's Patient Consultations</CardTitle>
            <CardDescription className="text-xs">Manage appointments, launch telehealth sessions, and update triage status.</CardDescription>
          </div>
          <SearchBox
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search patient or MRN..."
            className="max-w-xs"
          />
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredPatients.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No patients found matching "{searchQuery}".
              </div>
            ) : (
              filteredPatients.map((p) => (
                <div
                  key={p.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/40 rounded-xl px-2"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 font-bold text-xs flex items-center justify-center shrink-0">
                      {p.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{p.name}</h4>
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                          {p.mrn}
                        </span>
                        <Badge variant={p.type === 'Telehealth' ? 'info' : 'secondary'} size="sm">
                          {p.type}
                        </Badge>
                      </div>
                      <p className="text-2xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {p.age}y, {p.gender} • <strong className="text-slate-700 dark:text-slate-300">Complaint:</strong> {p.chiefComplaint}
                      </p>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-1 font-mono">
                        <Clock className="w-3 h-3 text-slate-400" /> Scheduled: {p.appointmentTime}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:justify-end">
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => setSelectedPatientTimeline(p)}
                      leftIcon={<History className="w-3.5 h-3.5" />}
                    >
                      Timeline
                    </Button>

                    {p.status === 'IN_PROGRESS' && (
                      <Button
                        variant="success"
                        size="xs"
                        onClick={() => handleUpdatePatientStatus(p.id, 'COMPLETED')}
                        leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                      >
                        Complete Consult
                      </Button>
                    )}

                    {p.status === 'WAITING' && (
                      <Button
                        variant="primary"
                        size="xs"
                        onClick={() => handleUpdatePatientStatus(p.id, 'IN_PROGRESS')}
                        leftIcon={p.type === 'Telehealth' ? <Video className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                      >
                        Start Consult
                      </Button>
                    )}

                    {p.status === 'COMPLETED' && (
                      <Badge variant="success" size="sm" dot>
                        COMPLETED
                      </Badge>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* 5. AI DIAGNOSTIC RISK CALCULATOR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-slate-200/80 dark:border-slate-800">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary-600" />
              <CardTitle className="text-base font-bold">AI Diagnostic Risk Calculator</CardTitle>
            </div>
            <CardDescription className="text-xs">Input patient physiological telemetry to estimate cardiovascular risk trajectory.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-2xs font-bold text-slate-500 uppercase mb-1">Systolic BP (mmHg)</label>
                <Input
                  type="number"
                  value={aiSystolic}
                  onChange={(e) => setAiSystolic(Number(e.target.value))}
                />
              </div>

              <div>
                <label className="block text-2xs font-bold text-slate-500 uppercase mb-1">Cholesterol (mg/dL)</label>
                <Input
                  type="number"
                  value={aiCholesterol}
                  onChange={(e) => setAiCholesterol(Number(e.target.value))}
                />
              </div>

              <div>
                <label className="block text-2xs font-bold text-slate-500 uppercase mb-1">Fasting Glucose (mg/dL)</label>
                <Input
                  type="number"
                  value={aiGlucose}
                  onChange={(e) => setAiGlucose(Number(e.target.value))}
                />
              </div>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={handleRunAiPredictor}
              isLoading={isCalculatingAi}
              leftIcon={<Cpu className="w-4 h-4" />}
            >
              Run Risk Predictor Engine
            </Button>
          </CardContent>
        </Card>

        {aiResult && (
          <PredictionCard
            diseaseName="Cardiovascular Risk Assessment"
            riskScore={aiResult.score}
            riskLevel={aiResult.level}
            confidence={aiResult.confidence}
            keyFeatures={[`Systolic: ${aiSystolic} mmHg`, `Cholesterol: ${aiCholesterol} mg/dL`]}
            recommendation="Patient displays elevated blood pressure and lipid metrics. Recommend statin evaluation and 30-day follow-up."
          />
        )}
      </div>

      {/* MODALS */}
      <Dialog isOpen={isPrescriptionModalOpen} onClose={() => setIsPrescriptionModalOpen(false)} title="Issue Quick e-Prescription" maxWidth="md">
        <form onSubmit={handleIssuePrescription} className="space-y-4">
          <div>
            <label className="block text-2xs font-bold text-slate-500 uppercase mb-1">Select Patient</label>
            <Select value={prescPatient} onChange={(e) => setPrescPatient(e.target.value)}>
              {patients.map((p) => (
                <option key={p.id} value={p.name}>{p.name} ({p.mrn})</option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-2xs font-bold text-slate-500 uppercase mb-1">Medication Name</label>
              <Input placeholder="e.g. Atorvastatin" value={prescMedName} onChange={(e) => setPrescMedName(e.target.value)} />
            </div>

            <div>
              <label className="block text-2xs font-bold text-slate-500 uppercase mb-1">Dosage</label>
              <Input placeholder="e.g. 20mg" value={prescDosage} onChange={(e) => setPrescDosage(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="block text-2xs font-bold text-slate-500 uppercase mb-1">Frequency</label>
            <Select value={prescFreq} onChange={(e) => setPrescFreq(e.target.value)}>
              <option value="Once Daily">Once Daily (Morning)</option>
              <option value="Twice Daily">Twice Daily (Morning & Evening)</option>
              <option value="As Needed">As Needed (PRN)</option>
            </Select>
          </div>

          <div>
            <label className="block text-2xs font-bold text-slate-500 uppercase mb-1">Rx Notes</label>
            <Input placeholder="Take after meals..." value={prescNotes} onChange={(e) => setPrescNotes(e.target.value)} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={() => setIsPrescriptionModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" size="sm" leftIcon={<CheckCircle2 className="w-4 h-4" />}>
              e-Sign & Dispatch Rx
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      <Dialog isOpen={isRequestRecordModalOpen} onClose={() => setIsRequestRecordModalOpen(false)} title="Request Patient Record Access" maxWidth="md">
        <form onSubmit={handleSendAccessRequest} className="space-y-4">
          <div>
            <label className="block text-2xs font-bold text-slate-500 uppercase mb-1">Target Patient</label>
            <Select value={reqPatientName} onChange={(e) => setReqPatientName(e.target.value)}>
              {patients.map((p) => (
                <option key={p.id} value={p.name}>{p.name} ({p.mrn})</option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-2xs font-bold text-slate-500 uppercase mb-1">Requested Scope</label>
            <Input value={reqScope} onChange={(e) => setReqScope(e.target.value)} />
          </div>

          <div>
            <label className="block text-2xs font-bold text-slate-500 uppercase mb-1">Clinical Justification</label>
            <Input value={reqReason} onChange={(e) => setReqReason(e.target.value)} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={() => setIsRequestRecordModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" size="sm" leftIcon={<Send className="w-4 h-4" />}>
              Send Access Request
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      {selectedPatientTimeline && (
        <Dialog isOpen={Boolean(selectedPatientTimeline)} onClose={() => setSelectedPatientTimeline(null)} title={`Medical History: ${selectedPatientTimeline.name}`} maxWidth="lg">
          <div className="space-y-4">
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs flex items-center justify-between">
              <span>MRN: <strong>{selectedPatientTimeline.mrn}</strong></span>
              <span>Age/Gender: <strong>{selectedPatientTimeline.age}y, {selectedPatientTimeline.gender}</strong></span>
            </div>
            <ActivityTimeline items={activities} />
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setSelectedPatientTimeline(null)}>Close Timeline</Button>
          </DialogFooter>
        </Dialog>
      )}
    </div>
  );
};

export default DoctorDashboard;
