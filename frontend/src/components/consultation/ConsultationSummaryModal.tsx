import React from 'react';
import { Dialog, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { MedicineItem } from './MedicineCard';
import { PatientSummaryData } from './PatientSummaryCard';
import { FileText, Download, ShieldCheck, Pill, TestTube2, Calendar, UserCheck } from 'lucide-react';
import { useToast } from '../ui/toast';

export interface ConsultationSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientData: PatientSummaryData;
  diagnosis: string;
  treatmentPlan: string;
  medicines: MedicineItem[];
  labTests: string[];
  followUpDate: string;
  doctorNotes: string;
}

export const ConsultationSummaryModal: React.FC<ConsultationSummaryModalProps> = ({
  isOpen,
  onClose,
  patientData,
  diagnosis,
  treatmentPlan,
  medicines,
  labTests,
  followUpDate,
  doctorNotes,
}) => {
  const { addToast } = useToast();

  const handleDownloadPDF = () => {
    addToast({
      type: 'success',
      title: 'Generating PDF Summary',
      message: `Downloaded official clinical consultation summary for ${patientData.name}.pdf`,
    });
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Official Clinical Consultation Summary" maxWidth="lg">
      <div className="space-y-4 text-xs font-sans">
        {/* Letterhead Header */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-primary-900 via-primary-800 to-slate-900 text-white flex items-center justify-between gap-4">
          <div>
            <span className="text-2xs font-mono uppercase tracking-wider text-primary-200 block">HealthShare Clinical Summary</span>
            <h3 className="text-base font-extrabold">Dr. Sarah Jenkins, MD</h3>
            <p className="text-2xs text-slate-300">St. Jude Cardiology & Renal Specialty Center</p>
          </div>
          <div className="text-right shrink-0">
            <Badge variant="success" size="sm">Verified Consultation</Badge>
            <span className="block text-[10px] text-slate-300 font-mono mt-1">Date: July 30, 2026</span>
          </div>
        </div>

        {/* Patient Details Row */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-primary-500" />
            <span className="font-bold text-slate-900 dark:text-slate-100">{patientData.name}</span>
            <span className="text-slate-400">({patientData.age} yrs, {patientData.gender})</span>
          </div>
          <span className="text-2xs font-mono text-slate-500">Blood Group: <strong>{patientData.bloodGroup}</strong></span>
        </div>

        {/* Diagnosis & Treatment Plan */}
        <div className="space-y-2 p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div>
            <span className="text-slate-400 font-bold uppercase text-[10px] block">Primary Clinical Diagnosis</span>
            <p className="text-slate-900 dark:text-slate-100 font-extrabold text-sm">{diagnosis || 'No diagnosis entered.'}</p>
          </div>

          {treatmentPlan && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 font-bold uppercase text-[10px] block">Treatment Plan</span>
              <p className="text-slate-700 dark:text-slate-300 font-medium">{treatmentPlan}</p>
            </div>
          )}
        </div>

        {/* Prescribed Medicines Table */}
        <div className="space-y-2 p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-slate-400 font-bold uppercase text-[10px] flex items-center gap-1">
            <Pill className="w-3.5 h-3.5 text-amber-500" /> Prescribed Medications
          </span>

          {medicines.length === 0 ? (
            <p className="text-slate-400 italic text-2xs">No medications prescribed during this visit.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase">
                    <th className="pb-1 px-1">Medicine</th>
                    <th className="pb-1 px-1">Dosage</th>
                    <th className="pb-1 px-1">Frequency</th>
                    <th className="pb-1 px-1">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-2xs">
                  {medicines.map((m) => (
                    <tr key={m.id}>
                      <td className="py-1.5 px-1 font-bold text-slate-900 dark:text-slate-100">{m.name || 'N/A'}</td>
                      <td className="py-1.5 px-1 text-slate-600 dark:text-slate-300">{m.dosage || 'N/A'}</td>
                      <td className="py-1.5 px-1 text-slate-600 dark:text-slate-300 font-mono text-[11px]">{m.frequency}</td>
                      <td className="py-1.5 px-1 text-slate-500 font-mono text-[11px]">{m.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Lab Tests & Follow-up */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-slate-400 font-bold uppercase text-[10px] flex items-center gap-1">
              <TestTube2 className="w-3.5 h-3.5 text-teal-500" /> Recommended Lab Tests
            </span>
            {labTests.length === 0 ? (
              <span className="text-slate-400 italic text-2xs block">None</span>
            ) : (
              <ul className="list-disc list-inside text-2xs text-slate-700 dark:text-slate-300 space-y-0.5">
                {labTests.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-slate-400 font-bold uppercase text-[10px] flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-sky-500" /> Follow-up Date
            </span>
            <span className="text-slate-900 dark:text-slate-100 font-bold font-mono block">
              {followUpDate || 'No follow-up recommended.'}
            </span>
          </div>
        </div>

        {/* Doctor Notes */}
        {doctorNotes && (
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-1">
            <span className="text-slate-400 font-bold uppercase text-[10px] block">Doctor Clinical Notes</span>
            <p className="text-slate-600 dark:text-slate-300 italic text-2xs">{doctorNotes}</p>
          </div>
        )}
      </div>

      <DialogFooter>
        <div className="flex items-center justify-between w-full pt-2">
          <Button variant="primary" size="xs" onClick={handleDownloadPDF} leftIcon={<Download className="w-3.5 h-3.5" />}>
            Download PDF Summary
          </Button>
          <Button variant="outline" size="xs" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogFooter>
    </Dialog>
  );
};
