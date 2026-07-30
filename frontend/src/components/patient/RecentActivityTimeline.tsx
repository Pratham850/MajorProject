import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { FileUp, Brain, ShieldCheck, Eye, CheckCircle } from 'lucide-react';

export interface PatientActivityEvent {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: 'upload' | 'prediction' | 'consent' | 'doctor_view' | 'appointment';
  statusBadge?: string;
  statusVariant?: 'success' | 'info' | 'warning' | 'primary' | 'secondary';
}

const defaultEvents: PatientActivityEvent[] = [
  {
    id: 'e1',
    title: 'Medical Record Uploaded',
    description: 'Comprehensive Metabolic Panel & Lipid Profile uploaded and encrypted with AES-256.',
    timestamp: '2 hours ago',
    type: 'upload',
    statusBadge: 'Encrypted',
    statusVariant: 'success',
  },
  {
    id: 'e2',
    title: 'AI Prediction Completed',
    description: 'CKD ML Risk Assessment executed. Probability evaluated at 8.2% (Low Risk).',
    timestamp: '5 hours ago',
    type: 'prediction',
    statusBadge: 'Completed',
    statusVariant: 'primary',
  },
  {
    id: 'e3',
    title: 'Consent Granted',
    description: 'Granted cardiology EHR access to Dr. Sarah Jenkins at St. Jude Cardiology Center.',
    timestamp: '1 day ago',
    type: 'consent',
    statusBadge: 'Active',
    statusVariant: 'info',
  },
  {
    id: 'e4',
    title: 'Doctor Viewed Record',
    description: 'Dr. Sarah Jenkins reviewed recent lab results and lipid profile.',
    timestamp: '2 days ago',
    type: 'doctor_view',
    statusBadge: 'Audit Logged',
    statusVariant: 'secondary',
  },
];

export const RecentActivityTimeline: React.FC<{ events?: PatientActivityEvent[] }> = ({
  events = defaultEvents,
}) => {
  const displayEvents = events.slice(0, 4);

  const getIcon = (type: PatientActivityEvent['type']) => {
    switch (type) {
      case 'upload':
        return <FileUp className="w-4 h-4 text-emerald-500" />;
      case 'prediction':
        return <Brain className="w-4 h-4 text-indigo-500" />;
      case 'consent':
        return <ShieldCheck className="w-4 h-4 text-sky-500" />;
      case 'doctor_view':
        return <Eye className="w-4 h-4 text-amber-500" />;
      case 'appointment':
        return <CheckCircle className="w-4 h-4 text-teal-500" />;
    }
  };

  return (
    <Card className="border-slate-200/80 dark:border-slate-800">
      <CardHeader>
        <CardTitle className="text-base font-bold">Recent Medical Activity</CardTitle>
        <CardDescription className="text-xs">
          Recent log of uploads, prediction evaluations, and clinician accesses.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
          {displayEvents.map((event) => (
            <div key={event.id} className="relative group">
              {/* Timeline Bullet Node */}
              <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 flex items-center justify-center shadow-2xs group-hover:border-primary-500 transition-colors">
                {getIcon(event.type)}
              </div>

              <div className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 transition-all">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{event.title}</h4>
                  <div className="flex items-center gap-2">
                    {event.statusBadge && (
                      <Badge variant={event.statusVariant || 'secondary'} size="sm">
                        {event.statusBadge}
                      </Badge>
                    )}
                    <span className="text-[10px] text-slate-400 font-mono">{event.timestamp}</span>
                  </div>
                </div>
                <p className="text-2xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {event.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
