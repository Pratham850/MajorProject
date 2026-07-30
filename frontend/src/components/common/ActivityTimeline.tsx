import React from 'react';
import { cn } from '../../lib/utils';
import { Badge } from '../ui/badge';
import { Activity, ShieldCheck, FileText, User, Lock, Database } from 'lucide-react';

export interface ActivityItem {
  id: string | number;
  title: string;
  description: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
  type: 'audit' | 'consent' | 'record' | 'ml' | 'auth';
}

export interface ActivityTimelineProps {
  items: ActivityItem[];
  className?: string;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ items, className }) => {
  const getIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'consent':
        return <ShieldCheck className="w-4 h-4 text-emerald-500" />;
      case 'record':
        return <FileText className="w-4 h-4 text-sky-500" />;
      case 'ml':
        return <Activity className="w-4 h-4 text-amber-500" />;
      case 'auth':
        return <Lock className="w-4 h-4 text-indigo-500" />;
      default:
        return <Database className="w-4 h-4 text-primary-500" />;
    }
  };

  return (
    <div className={cn('space-y-6 relative before:absolute before:inset-0 before:left-4 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800', className)}>
      {items.map((item) => (
        <div key={item.id} className="relative flex items-start gap-4 pl-1 group">
          {/* Timeline Node Icon */}
          <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-subtle flex items-center justify-center shrink-0 z-10 group-hover:border-primary-500 transition-colors">
            {getIcon(item.type)}
          </div>

          {/* Event Content Container */}
          <div className="flex-1 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-subtle hover:shadow-card transition-all">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{item.title}</h4>
              <span className="text-[10px] font-mono text-slate-400">{item.timestamp}</span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">{item.description}</p>

            {/* Actor Badge Footer */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/60 text-2xs text-slate-400">
              <User className="w-3 h-3 text-slate-400" />
              <span>Actor: <strong className="text-slate-700 dark:text-slate-300 font-semibold">{item.actorName}</strong></span>
              <Badge variant="secondary" size="sm">{item.actorRole}</Badge>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
