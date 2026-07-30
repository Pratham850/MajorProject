import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { FileText, Save, RotateCcw } from 'lucide-react';
import { useToast } from '../ui/toast';
import { cn } from '../../lib/utils';

export interface ClinicalNotesProps {
  initialNotes?: string;
  patientName?: string;
  onSave?: (notes: string) => void;
  className?: string;
}

export const ClinicalNotes: React.FC<ClinicalNotesProps> = ({
  initialNotes = '',
  patientName = 'Patient',
  onSave,
  className,
}) => {
  const { addToast } = useToast();
  const [notes, setNotes] = useState(initialNotes);

  const handleSave = () => {
    addToast({
      type: 'success',
      title: 'Clinical Notes Saved',
      message: `Updated diagnostic notes for ${patientName}.`,
    });
    if (onSave) onSave(notes);
  };

  const handleClear = () => {
    setNotes('');
    addToast({
      type: 'info',
      title: 'Notes Cleared',
      message: 'Clinical notes editor cleared.',
    });
  };

  return (
    <Card className={cn('border-slate-200/80 dark:border-slate-800', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary-600" />
          <CardTitle className="text-sm font-bold">Physician Clinical Impression & Notes</CardTitle>
        </div>
        <CardDescription className="text-2xs">
          Document diagnostic observations, prescription adjustments, and follow-up recommendations.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={`Enter clinical notes and treatment recommendations for ${patientName}...`}
          rows={4}
          className="w-full bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 text-xs rounded-xl p-3.5 border border-slate-200 dark:border-slate-700 focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all placeholder:text-slate-400"
        />

        <div className="flex items-center justify-between gap-2 pt-1">
          <Button
            variant="outline"
            size="xs"
            onClick={handleClear}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Clear Notes
          </Button>

          <Button
            variant="primary"
            size="xs"
            onClick={handleSave}
            leftIcon={<Save className="w-3.5 h-3.5" />}
          >
            Save Clinical Notes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
