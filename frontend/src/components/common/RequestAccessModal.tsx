import React, { useState } from 'react';
import { Dialog, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { Send } from 'lucide-react';
import { useToast } from '../ui/toast';

export interface RequestAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  datasetTitle: string;
  onSubmitSuccess?: () => void;
}

export const RequestAccessModal: React.FC<RequestAccessModalProps> = ({
  isOpen,
  onClose,
  datasetTitle,
  onSubmitSuccess,
}) => {
  const { addToast } = useToast();

  const [projectTitle, setProjectTitle] = useState('');
  const [purpose, setPurpose] = useState('');
  const [institution, setInstitution] = useState('BioGen Epidemiological Institute');
  const [duration, setDuration] = useState('12 Months');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectTitle || !purpose) {
      addToast({
        type: 'error',
        title: 'Missing Fields',
        message: 'Please provide project title and research purpose.',
      });
      return;
    }

    addToast({
      type: 'success',
      title: 'IRB Request Submitted',
      message: `Submitted dataset access request for "${datasetTitle}".`,
    });

    if (onSubmitSuccess) onSubmitSuccess();
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Request IRB Access: ${datasetTitle}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 py-2 text-xs">
        <div>
          <label className="block text-2xs font-bold text-slate-500 uppercase mb-1">Research Project Title</label>
          <Input
            placeholder="e.g. Cardiovascular Risk Telemetry Study..."
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-2xs font-bold text-slate-500 uppercase mb-1">Research Purpose / Objectives</label>
          <textarea
            placeholder="Describe epidemiological hypotheses and data sanitization protocol..."
            rows={3}
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 text-xs rounded-xl p-3 border border-slate-200 dark:border-slate-700 focus:border-primary-500 focus:outline-none transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-2xs font-bold text-slate-500 uppercase mb-1">Affiliated Institution</label>
            <Input
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-2xs font-bold text-slate-500 uppercase mb-1">Expected Study Duration</label>
            <Select value={duration} onChange={(e) => setDuration(e.target.value)}>
              <option value="6 Months">6 Months</option>
              <option value="12 Months">12 Months</option>
              <option value="24 Months">24 Months</option>
              <option value="Multi-Year Trial">Multi-Year Trial</option>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" leftIcon={<Send className="w-4 h-4" />}>
            Submit IRB Request
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
};
