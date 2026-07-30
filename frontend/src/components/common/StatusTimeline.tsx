import React from 'react';
import { CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface TimelineStep {
  label: string;
  timestamp?: string;
  status: 'COMPLETED' | 'CURRENT' | 'PENDING' | 'DENIED' | 'WITHDRAWN';
  description?: string;
}

export interface StatusTimelineProps {
  steps: TimelineStep[];
  className?: string;
}

export const StatusTimeline: React.FC<StatusTimelineProps> = ({ steps, className }) => {
  return (
    <div className={cn('space-y-4 text-xs', className)}>
      <h4 className="font-bold text-slate-900 dark:text-white uppercase text-[10px] tracking-wider">
        IRB Approval Lifecycle Timeline
      </h4>
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
        {steps.map((step, idx) => {
          const icon =
            step.status === 'COMPLETED' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500 bg-white dark:bg-slate-900 rounded-full" />
            ) : step.status === 'CURRENT' ? (
              <Clock className="w-5 h-5 text-amber-500 bg-white dark:bg-slate-900 rounded-full animate-pulse" />
            ) : step.status === 'DENIED' || step.status === 'WITHDRAWN' ? (
              <XCircle className="w-5 h-5 text-rose-500 bg-white dark:bg-slate-900 rounded-full" />
            ) : (
              <AlertCircle className="w-5 h-5 text-slate-300 dark:text-slate-700 bg-white dark:bg-slate-900 rounded-full" />
            );

          return (
            <div key={idx} className="relative flex items-start justify-between gap-4">
              <div className="absolute -left-6 top-0">{icon}</div>
              <div>
                <h5 className={cn('font-bold', step.status === 'COMPLETED' ? 'text-slate-900 dark:text-white' : step.status === 'CURRENT' ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400')}>
                  {step.label}
                </h5>
                {step.description && <p className="text-2xs text-slate-500 dark:text-slate-400 mt-0.5">{step.description}</p>}
              </div>
              {step.timestamp && (
                <span className="text-[10px] font-mono text-slate-400 shrink-0">{step.timestamp}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
