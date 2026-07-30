import React from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface InsightCardProps {
  title: string;
  category: string;
  type?: 'positive' | 'warning' | 'info';
  impactScore?: string;
  description: string;
  metric?: string;
  className?: string;
}

export const InsightCard: React.FC<InsightCardProps> = ({
  title,
  category,
  type = 'info',
  impactScore,
  description,
  metric,
  className,
}) => {
  const typeConfig = {
    positive: {
      badgeVariant: 'success' as const,
      icon: <TrendingUp className="w-4 h-4 text-emerald-500" />,
      bg: 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900',
    },
    warning: {
      badgeVariant: 'warning' as const,
      icon: <AlertTriangle className="w-4 h-4 text-amber-500" />,
      bg: 'bg-amber-50/50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900',
    },
    info: {
      badgeVariant: 'primary' as const,
      icon: <Lightbulb className="w-4 h-4 text-primary-500" />,
      bg: 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800',
    },
  };

  const tc = typeConfig[type];

  return (
    <Card className={cn('p-4 border transition-all hover:shadow-xs space-y-3', tc.bg, className)}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {tc.icon}
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {category}
          </span>
        </div>
        {impactScore && (
          <Badge variant={tc.badgeVariant} size="sm">
            {impactScore}
          </Badge>
        )}
      </div>

      <div>
        <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
          <span>{title}</span>
          {metric && <span className="font-mono text-primary-600 dark:text-primary-400">{metric}</span>}
        </h4>
        <p className="text-2xs text-slate-600 dark:text-slate-300 leading-relaxed mt-1">
          {description}
        </p>
      </div>
    </Card>
  );
};
