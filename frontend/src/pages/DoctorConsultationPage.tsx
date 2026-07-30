import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ui/toast';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import {
  PatientSummaryCard,
  MedicalRecordPreview,
  AiPredictionSummary,
  PrescriptionBuilder,
  LabRecommendationCard,
  ConsultationSummaryModal,
  MedicineItem,
} from '../components/consultation';
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  Eye,
  FileText,
  Calendar,
  Stethoscope,
  Clock,
  Sparkles,
} from 'lucide-react';

export const DoctorConsultationPage: React.FC = () => {
  const { addToast } = useToast();
  const navigate = useNavigate();

  // --- Form States ---
  const [chiefComplaint, setChiefComplaint] = useState('Patient reports intermittent dyspnea during moderate exertion and mild leg edema over the past 2 weeks.');
  const [symptoms, setSymptoms] = useState('Shortness of breath, mild peripheral edema, fatigue, morning blood pressure spikes (138/88 mmHg).');
  const [diagnosis, setDiagnosis] = useState('Essential Hypertension with Early Renal Stress (Stage 1 CKD Risk)');
  const [observations, setObservations] = useState('Chest clear on auscultation. Heart rate 74 bpm, regular. Serum creatinine 0.9 mg/dL, eGFR 92 mL/min/1.73m².');
  const [treatmentPlan, setTreatmentPlan] = useState('Initiate Lisinopril 10mg once daily. Dietary sodium restriction (< 2000mg/day). Daily home blood pressure monitoring.');
  const [followUpDate, setFollowUpDate] = useState('2026-08-30');
  const [followUpReason, setFollowUpReason] = useState('1-Month Renal Function & Blood Pressure Follow-up Evaluation');
  const [doctorNotes, setDoctorNotes] = useState('Patient educated on lifestyle modifications. Patient consented to share EHR trends for clinical monitoring.');

  // --- Prescription State ---
  const [medicines, setMedicines] = useState<MedicineItem[]>([
    {
      id: 'med-1',
      name: 'Lisinopril',
      dosage: '10mg',
      frequency: 'Once Daily (0-0-1)',
      duration: '30 Days',
      instructions: 'Take after breakfast in the morning with a full glass of water.',
    },
    {
      id: 'med-2',
      name: 'Atorvastatin',
      dosage: '20mg',
      frequency: 'Once Daily (0-0-1)',
      duration: '30 Days',
      instructions: 'Take at bedtime in the evening.',
    },
  ]);

  // --- Recommended Lab Tests State ---
  const [selectedLabTests, setSelectedLabTests] = useState<string[]>([
    'Kidney Function Test (KFT / Serum Creatinine & eGFR)',
    'Complete Blood Count (CBC & Lipid Profile)',
  ]);

  // --- Modal State ---
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // --- Handlers ---
  const handleSaveDraft = () => {
    addToast({
      type: 'info',
      title: 'Consultation Draft Saved',
      message: 'Draft progress stored in encrypted clinical workspace.',
    });
  };

  const handleCompleteConsultation = () => {
    addToast({
      type: 'success',
      title: 'Consultation Completed',
      message: 'Consultation finalized. Patient medical records and prescriptions updated automatically.',
    });

    // Patient Notifications Alert (Feature 11)
    setTimeout(() => {
      addToast({
        type: 'info',
        title: 'Patient Notification Dispatched',
        message: 'Notification sent to Sarah Jenkins: "Your consultation has been completed and a new prescription has been added."',
      });
      navigate('/doctor/appointments');
    }, 1200);
  };

  const patientData = {
    name: 'Sarah Jenkins',
    age: 42,
    gender: 'Female',
    bloodGroup: 'O Positive (O+)',
    allergies: ['Penicillin', 'Latex', 'Sulfa Drugs'],
    chronicDiseases: ['Essential Hypertension', 'Stage 1 CKD Risk'],
    emergencyContact: '+1 (555) 948-2041 (Spouse)',
    healthScore: 98,
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* 1. Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="xs"
            onClick={() => navigate('/doctor/appointments')}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Back to Appointments
          </Button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                Doctor Consultation Workspace
              </h1>
              <Badge variant="success" size="sm">Active Telehealth Session</Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live consultation session with Sarah Jenkins (ID: apt-101)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPreviewOpen(true)}
            leftIcon={<Eye className="w-4 h-4" />}
          >
            Preview Summary
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleSaveDraft}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Draft
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleCompleteConsultation}
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            Complete Consultation
          </Button>
        </div>
      </div>

      {/* 2. Feature 2: Patient Summary Card */}
      <PatientSummaryCard data={patientData} />

      {/* 3. Feature 3 & Feature 4: Side-by-side Medical Records & AI Assessment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MedicalRecordPreview />
        <AiPredictionSummary />
      </div>

      {/* 4. Feature 5: Consultation Form */}
      <Card className="border-slate-200/80 dark:border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-primary-600" />
              <span>Clinical Consultation Notes & Diagnosis</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Record chief complaints, clinical observations, diagnosis, and treatment recommendations.
            </CardDescription>
          </div>
          <Badge variant="info" size="sm">Clinical Record</Badge>
        </CardHeader>

        <CardContent className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Chief Complaint */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                Chief Complaint
              </label>
              <textarea
                rows={2}
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-slate-100 text-xs focus:border-primary-500 focus:outline-none"
              />
            </div>

            {/* Reported Symptoms */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                Reported Symptoms
              </label>
              <textarea
                rows={2}
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-slate-100 text-xs focus:border-primary-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Primary Diagnosis */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Primary Clinical Diagnosis
            </label>
            <input
              type="text"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 font-bold text-xs focus:border-primary-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Clinical Observations */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                Clinical Examination & Observations
              </label>
              <textarea
                rows={3}
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-slate-100 text-xs focus:border-primary-500 focus:outline-none"
              />
            </div>

            {/* Treatment Plan */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                Treatment Plan & Advice
              </label>
              <textarea
                rows={3}
                value={treatmentPlan}
                onChange={(e) => setTreatmentPlan(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-slate-100 text-xs focus:border-primary-500 focus:outline-none"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 5. Feature 6: Digital Prescription Builder */}
      <PrescriptionBuilder medicines={medicines} onChange={setMedicines} />

      {/* 6. Feature 7 & Feature 8: Lab Recommendations & Follow-up Appointment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LabRecommendationCard selectedTests={selectedLabTests} onChange={setSelectedLabTests} />

        {/* Feature 8: Follow-up Appointment */}
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-base font-bold">Follow-up Consultation Recommendation</CardTitle>
              <CardDescription className="text-xs">
                Schedule a recommended follow-up review for the patient.
              </CardDescription>
            </div>
            <div className="p-2 bg-sky-50 dark:bg-sky-950/60 text-sky-600 rounded-xl">
              <Calendar className="w-5 h-5" />
            </div>
          </CardHeader>

          <CardContent className="space-y-3 text-xs">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                Recommended Follow-up Date
              </label>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 font-mono text-xs focus:border-primary-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                Reason for Follow-up
              </label>
              <input
                type="text"
                value={followUpReason}
                onChange={(e) => setFollowUpReason(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 text-xs focus:border-primary-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                Doctor Notes & Instructions
              </label>
              <textarea
                rows={2}
                value={doctorNotes}
                onChange={(e) => setDoctorNotes(e.target.value)}
                placeholder="Enter confidential notes for care team or patient..."
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-slate-100 text-xs focus:border-primary-500 focus:outline-none"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 7. Action Bar at Bottom */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Sparkles className="w-4 h-4 text-primary-500" />
          <span>Completing consultation updates patient medical records and dispatches prescription notifications.</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={() => setIsPreviewOpen(true)} leftIcon={<Eye className="w-4 h-4" />}>
            Preview Summary
          </Button>
          <Button variant="secondary" size="sm" onClick={handleSaveDraft} leftIcon={<Save className="w-4 h-4" />}>
            Save Draft
          </Button>
          <Button variant="primary" size="sm" onClick={handleCompleteConsultation} leftIcon={<CheckCircle2 className="w-4 h-4" />}>
            Complete Consultation
          </Button>
        </div>
      </div>

      {/* 8. Feature 9: Consultation Summary Modal */}
      <ConsultationSummaryModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        patientData={patientData}
        diagnosis={diagnosis}
        treatmentPlan={treatmentPlan}
        medicines={medicines}
        labTests={selectedLabTests}
        followUpDate={followUpDate}
        doctorNotes={doctorNotes}
      />
    </div>
  );
};

export default DoctorConsultationPage;
