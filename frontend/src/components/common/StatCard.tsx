import React from 'react';
import { Card } from '../ui/card';
import { cn } from '../../lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: string | number;
  trend?: 'up' | 'down' | 'neutral';
  subtext?: string;
  icon?: React.ReactNode;
  iconBg?: string;
  className?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  trend = 'neutral',
  subtext,
  icon,
  iconBg = 'bg-primary-50 text-primary-700 dark:bg-primary-950/60 dark:text-primary-300',
  className,
  onClick,
}) => {
  return (
    <Card
      hoverable={Boolean(onClick)}
      onClick={onClick}
      className={cn('p-5 flex flex-col justify-between relative overflow-hidden', className)}
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {title}
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-1 font-sans">
            {value}
          </div>
        </div>
        {icon && <div className={cn('p-3 rounded-xl flex items-center justify-center shrink-0 shadow-subtle', iconBg)}>{icon}</div>}
      </div>

      {(change !== undefined || subtext) && (
        <div className="mt-4 flex items-center gap-2 text-xs">
          {change !== undefined && (
            <span
              className={cn(
                'inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full text-2xs',
                trend === 'up' && 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/50',
                trend === 'down' && 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200/50',
                trend === 'neutral' && 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
              )}
            >
              {trend === 'up' && <TrendingUp className="w-3 h-3" />}
              {trend === 'down' && <TrendingDown className="w-3 h-3" />}
              {trend === 'neutral' && <Minus className="w-3 h-3" />}
              {change}
            </span>
          )}
          {subtext && <span className="text-slate-500 dark:text-slate-400 truncate">{subtext}</span>}
        </div>
      )}
    </Card>
  );
};
