import React, { useState } from 'react';
import { Dialog, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { Send } from 'lucide-react';
import { useToast } from '../ui/toast';

export interface CreateRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess?: (newReq: any) => void;
}

export const CreateRequestModal: React.FC<CreateRequestModalProps> = ({
  isOpen,
  onClose,
  onSubmitSuccess,
}) => {
  const { addToast } = useToast();

  const [datasetName, setDatasetName] = useState('De-identified Cardiology Telemetry Cohort (2026)');
  const [projectTitle, setProjectTitle] = useState('');
  const [objective, setObjective] = useState('');
  const [institution, setInstitution] = useState('BioGen Epidemiological Institute');
  const [piName, setPiName] = useState('Dr. Alex Rivera');
  const [duration, setDuration] = useState('12 Months');
  const [ethicsRef, setEthicsRef] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectTitle || !objective) {
      addToast({
        type: 'error',
        title: 'Missing Required Fields',
        message: 'Please provide project title and research objectives.',
      });
      return;
    }

    const newReq = {
      id: `REQ-2026-${Math.floor(100 + Math.random() * 900)}`,
      datasetName,
      projectTitle,
      institution,
      piName,
      submittedDate: new Date().toISOString().split('T')[0],
      status: 'Pending' as const,
      lastUpdated: 'Just now',
      reviewerComments: 'Awaiting initial triage by IRB Ethics Board.',
      decisionDate: undefined,
    };

    addToast({
      type: 'success',
      title: 'Research Proposal Submitted',
      message: `Submitted request "${projectTitle}" for IRB review.`,
    });

    if (onSubmitSuccess) onSubmitSuccess(newReq);
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Research Dataset Request"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 py-2 text-xs">
        <div>
          <label className="block text-2xs font-bold text-slate-500 uppercase mb-1">Target Anonymized Dataset</label>
          <Select value={datasetName} onChange={(e) => setDatasetName(e.target.value)}>
            <option value="De-identified Cardiology Telemetry Cohort (2026)">De-identified Cardiology Telemetry Cohort (2026)</option>
            <option value="Pediatric Oncology Biomarkers & Genomic Variants">Pediatric Oncology Biomarkers & Genomic Variants</option>
            <option value="Type-2 Diabetes Glucose & HbA1c Longitudinal Set">Type-2 Diabetes Glucose & HbA1c Longitudinal Set</option>
            <option value="Alzheimers Early Neuroimaging & PET Scans">Alzheimers Early Neuroimaging & PET Scans</option>
          </Select>
        </div>

        <div>
          <label className="block text-2xs font-bold text-slate-500 uppercase mb-1">Research Project Title</label>
          <Input
            placeholder="e.g. Predictive ML Factors in Heart Failure Readmission..."
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-2xs font-bold text-slate-500 uppercase mb-1">Scientific Objective & Hypotheses</label>
          <textarea
            placeholder="Describe cohort criteria, statistical methodology, and data sanitization protocol..."
            rows={3}
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 text-xs rounded-xl p-3 border border-slate-200 dark:border-slate-700 focus:border-primary-500 focus:outline-none transition-all"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-2xs font-bold text-slate-500 uppercase mb-1">Principal Investigator (PI)</label>
            <Input value={piName} onChange={(e) => setPiName(e.target.value)} />
          </div>

          <div>
            <label className="block text-2xs font-bold text-slate-500 uppercase mb-1">Affiliated Institution</label>
            <Input value={institution} onChange={(e) => setInstitution(e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-2xs font-bold text-slate-500 uppercase mb-1">Expected Study Duration</label>
            <Select value={duration} onChange={(e) => setDuration(e.target.value)}>
              <option value="6 Months">6 Months</option>
              <option value="12 Months">12 Months</option>
              <option value="24 Months">24 Months</option>
              <option value="Multi-Year Trial">Multi-Year Trial</option>
            </Select>
          </div>

          <div>
            <label className="block text-2xs font-bold text-slate-500 uppercase mb-1">Ethics Approval Reference (Optional)</label>
            <Input placeholder="e.g. IRB-2026-089" value={ethicsRef} onChange={(e) => setEthicsRef(e.target.value)} />
          </div>
        </div>

        <div>
          <label className="block text-2xs font-bold text-slate-500 uppercase mb-1">Additional Compliance Notes</label>
          <Input placeholder="Specify Safe Harbor encryption compliance..." value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" leftIcon={<Send className="w-4 h-4" />}>
            Submit Research Proposal
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
};
