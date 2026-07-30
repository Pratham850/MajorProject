import React, { useState } from 'react';
import { Dialog, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { Save, Bell } from 'lucide-react';
import { useToast } from '../ui/toast';

export interface ScheduleExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess?: (newSchedule: any) => void;
}

export const ScheduleExportModal: React.FC<ScheduleExportModalProps> = ({
  isOpen,
  onClose,
  onSaveSuccess,
}) => {
  const { addToast } = useToast();

  const [reportName, setReportName] = useState('');
  const [datasetName, setDatasetName] = useState('De-identified Cardiology Telemetry Cohort (2026)');
  const [format, setFormat] = useState<'PDF' | 'CSV' | 'Parquet' | 'JSON'>('PDF');
  const [frequency, setFrequency] = useState('Weekly');
  const [startDate, setStartDate] = useState('2026-08-01');
  const [emailNotify, setEmailNotify] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportName) {
      addToast({
        type: 'error',
        title: 'Missing Field',
        message: 'Please provide a report title for scheduling.',
      });
      return;
    }

    const newSched = {
      id: `sched-${Date.now()}`,
      reportName,
      datasetName,
      format,
      frequency,
      startDate,
      emailNotify,
    };

    addToast({
      type: 'success',
      title: 'Export Schedule Saved',
      message: `Scheduled ${frequency} export for "${reportName}".`,
    });

    if (onSaveSuccess) onSaveSuccess(newSched);
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Schedule Automated Dataset Export"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 py-2 text-xs">
        <div>
          <label className="block text-2xs font-bold text-slate-500 uppercase mb-1">Report / Export Title</label>
          <Input
            placeholder="e.g. Weekly Cardiology Cohort Telemetry Summary..."
            value={reportName}
            onChange={(e) => setReportName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-2xs font-bold text-slate-500 uppercase mb-1">Target Anonymized Dataset</label>
          <Select value={datasetName} onChange={(e) => setDatasetName(e.target.value)}>
            <option value="De-identified Cardiology Telemetry Cohort (2026)">De-identified Cardiology Telemetry Cohort (2026)</option>
            <option value="Pediatric Oncology Biomarkers & Genomic Variants">Pediatric Oncology Biomarkers & Genomic Variants</option>
            <option value="Type-2 Diabetes Glucose & HbA1c Longitudinal Set">Type-2 Diabetes Glucose & HbA1c Longitudinal Set</option>
            <option value="Alzheimers Early Neuroimaging & PET Scans">Alzheimers Early Neuroimaging & PET Scans</option>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-2xs font-bold text-slate-500 uppercase mb-1">Export Format</label>
            <Select value={format} onChange={(e: any) => setFormat(e.target.value)}>
              <option value="PDF">PDF Report Document</option>
              <option value="CSV">CSV Raw Dataset</option>
              <option value="Parquet">Parquet Binary</option>
              <option value="JSON">FHIR JSON Payload</option>
            </Select>
          </div>

          <div>
            <label className="block text-2xs font-bold text-slate-500 uppercase mb-1">Schedule Frequency</label>
            <Select value={frequency} onChange={(e) => setFrequency(e.target.value)}>
              <option value="One-Time">One-Time Immediate</option>
              <option value="Weekly">Weekly (Every Monday)</option>
              <option value="Monthly">Monthly (1st of Month)</option>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-2xs font-bold text-slate-500 uppercase mb-1">Start Date</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              id="emailNotify"
              checked={emailNotify}
              onChange={(e) => setEmailNotify(e.target.checked)}
              className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 border-slate-300"
            />
            <label htmlFor="emailNotify" className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Bell className="w-3.5 h-3.5 text-primary-600" /> Email notification when ready
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" leftIcon={<Save className="w-4 h-4" />}>
            Save Export Schedule
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
};
