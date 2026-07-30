import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { ShieldCheck, Table } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface AnonymizedSampleRow {
  subjectId: string;
  ageGroup: string;
  gender: string;
  primaryBiomarker: string;
  vitalMetric: string;
  dateStamp: string;
}

export interface DatasetPreviewTableProps {
  datasetTitle: string;
  sampleRows?: AnonymizedSampleRow[];
  className?: string;
}

const DEFAULT_SAMPLE_ROWS: AnonymizedSampleRow[] = [
  {
    subjectId: 'ANON-SUBJ-8012',
    ageGroup: '55-60',
    gender: 'F',
    primaryBiomarker: 'Serum Creatinine 1.8 mg/dL',
    vitalMetric: 'BP 138/88 mmHg',
    dateStamp: '2026-07-28',
  },
  {
    subjectId: 'ANON-SUBJ-4419',
    ageGroup: '60-65',
    gender: 'M',
    primaryBiomarker: 'Serum Creatinine 0.9 mg/dL',
    vitalMetric: 'BP 120/80 mmHg',
    dateStamp: '2026-07-27',
  },
  {
    subjectId: 'ANON-SUBJ-9102',
    ageGroup: '40-45',
    gender: 'M',
    primaryBiomarker: 'Metabolic Panel Normal',
    vitalMetric: 'BP 118/76 mmHg',
    dateStamp: '2026-07-20',
  },
  {
    subjectId: 'ANON-SUBJ-3301',
    ageGroup: '30-35',
    gender: 'F',
    primaryBiomarker: 'Fasting Glucose 105 mg/dL',
    vitalMetric: 'BP 122/82 mmHg',
    dateStamp: '2026-07-15',
  },
];

export const DatasetPreviewTable: React.FC<DatasetPreviewTableProps> = ({
  datasetTitle,
  sampleRows = DEFAULT_SAMPLE_ROWS,
  className,
}) => {
  return (
    <Card className={cn('border-slate-200/80 dark:border-slate-800', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Table className="w-4 h-4 text-primary-600" />
            <CardTitle className="text-sm font-bold">Anonymized Sample Preview Payload</CardTitle>
          </div>
          <Badge variant="success" size="sm">
            <ShieldCheck className="w-3 h-3 mr-1" /> Safe Harbor Sanitized
          </Badge>
        </div>
        <CardDescription className="text-2xs">
          Showing 4 synthetic/anonymized sample records from "{datasetTitle}". Zero PII included.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-left text-2xs">
          <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 uppercase font-bold border-b border-slate-100 dark:border-slate-800">
            <tr>
              <th className="px-4 py-2.5">Subject Hash ID</th>
              <th className="px-4 py-2.5">Demographic Band</th>
              <th className="px-4 py-2.5">Gender</th>
              <th className="px-4 py-2.5">Primary Clinical Biomarker</th>
              <th className="px-4 py-2.5">Physiological Metric</th>
              <th className="px-4 py-2.5">Date Stamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:border-slate-800 font-mono">
            {sampleRows.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                <td className="px-4 py-2.5 font-bold text-primary-600 dark:text-primary-400">{row.subjectId}</td>
                <td className="px-4 py-2.5 text-slate-700 dark:text-slate-300">{row.ageGroup} yrs</td>
                <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400">{row.gender}</td>
                <td className="px-4 py-2.5 text-slate-900 dark:text-slate-100 font-sans font-medium">{row.primaryBiomarker}</td>
                <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400">{row.vitalMetric}</td>
                <td className="px-4 py-2.5 text-slate-400">{row.dateStamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
};
