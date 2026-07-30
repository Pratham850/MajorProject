import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { TestTube2, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface LabRecommendationCardProps {
  selectedTests: string[];
  onChange: (selected: string[]) => void;
}

const availableTests = [
  { id: 'kft', name: 'Kidney Function Test (KFT / Serum Creatinine & eGFR)', category: 'Renal' },
  { id: 'cbc', name: 'Complete Blood Count (CBC & Lipid Profile)', category: 'Hematology' },
  { id: 'ecg', name: 'Annual Electrocardiogram (ECG / EKG)', category: 'Cardiology' },
  { id: 'lft', name: 'Liver Function Test (LFT)', category: 'Hepatic' },
  { id: 'mri', name: 'Abdominal & Renal MRI Imaging', category: 'Radiology' },
  { id: 'ct', name: 'Non-Contrast Computed Tomography (CT Scan)', category: 'Radiology' },
];

export const LabRecommendationCard: React.FC<LabRecommendationCardProps> = ({
  selectedTests,
  onChange,
}) => {
  const toggleTest = (name: string) => {
    if (selectedTests.includes(name)) {
      onChange(selectedTests.filter((t) => t !== name));
    } else {
      onChange([...selectedTests, name]);
    }
  };

  return (
    <Card className="border-slate-200/80 dark:border-slate-800">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div>
          <CardTitle className="text-base font-bold">Lab Test & Diagnostic Recommendations</CardTitle>
          <CardDescription className="text-xs">
            Select recommended diagnostic investigations and lab orders.
          </CardDescription>
        </div>
        <div className="p-2 bg-teal-50 dark:bg-teal-950/60 text-teal-600 rounded-xl">
          <TestTube2 className="w-5 h-5" />
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {availableTests.map((test) => {
            const isSelected = selectedTests.includes(test.name);
            return (
              <div
                key={test.id}
                onClick={() => toggleTest(test.name)}
                className={cn(
                  'p-3.5 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition-all select-none text-xs',
                  isSelected
                    ? 'bg-primary-50/70 dark:bg-primary-950/40 border-primary-300 dark:border-primary-800 text-primary-900 dark:text-primary-100 font-bold shadow-xs'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300 font-medium'
                )}
              >
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">{test.category}</span>
                  <span>{test.name}</span>
                </div>
                <div
                  className={cn(
                    'w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-colors',
                    isSelected
                      ? 'bg-primary-600 border-primary-600 text-white'
                      : 'border-slate-300 dark:border-slate-700'
                  )}
                >
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
