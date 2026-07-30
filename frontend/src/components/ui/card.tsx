import React from 'react';
import { cn } from '../../lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, hoverable = false, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-card transition-all duration-200',
        hoverable && 'hover:shadow-elevated hover:-translate-y-0.5 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
Card.displayName = 'Card';

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-5 border-b border-slate-100 dark:border-slate-800/60', className)} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, children, ...props }, ref) => (
    <h3 ref={ref} className={cn('text-base font-semibold text-slate-900 dark:text-slate-100 tracking-tight', className)} {...props}>
      {children}
    </h3>
  )
);
CardTitle.displayName = 'CardTitle';

export const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, children, ...props }, ref) => (
    <p ref={ref} className={cn('text-xs text-slate-500 dark:text-slate-400 mt-1', className)} {...props}>
      {children}
    </p>
  )
);
CardDescription.displayName = 'CardDescription';

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('p-5', className)} {...props} />
);
CardContent.displayName = 'CardContent';

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-4 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800/60 rounded-b-xl flex items-center justify-between', className)} {...props} />
  )
);
CardFooter.displayName = 'CardFooter';

// --- Glass Card Variant ---
export const GlassCard: React.FC<CardProps> = ({ className, children, ...props }) => (
  <div
    className={cn(
      'glass-card rounded-2xl p-6 shadow-card transition-all duration-200 hover:shadow-elevated',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

// --- Health SaaS Metric / KPI Card ---
export interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  subtitle?: string;
  icon?: React.ReactNode;
  iconBg?: string;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  trend = 'up',
  subtitle,
  icon,
  iconBg = 'bg-primary-50 text-primary-700 dark:bg-primary-950/50 dark:text-primary-300',
  className,
}) => {
  return (
    <Card className={cn('p-5 flex flex-col justify-between relative overflow-hidden', className)}>
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</span>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1 font-sans">{value}</div>
        </div>
        {icon && <div className={cn('p-2.5 rounded-xl flex items-center justify-center shrink-0', iconBg)}>{icon}</div>}
      </div>

      {(change || subtitle) && (
        <div className="mt-4 flex items-center gap-2 text-xs">
          {change && (
            <span
              className={cn(
                'inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full',
                trend === 'up' && 'bg-healthSuccess/10 text-healthSuccess dark:bg-healthSuccess/20 dark:text-healthSuccess',
                trend === 'down' && 'bg-healthError/10 text-healthError dark:bg-healthError/20 dark:text-healthError',
                trend === 'neutral' && 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
              )}
            >
              {trend === 'up' && <TrendingUp className="w-3 h-3" />}
              {trend === 'down' && <TrendingDown className="w-3 h-3" />}
              {change}
            </span>
          )}
          {subtitle && <span className="text-slate-500 dark:text-slate-400">{subtitle}</span>}
        </div>
      )}
    </Card>
  );
};

// --- Health SaaS Information Card ---
export interface InfoCardProps {
  title: string;
  description: React.ReactNode;
  icon?: React.ReactNode;
  variant?: 'info' | 'warning' | 'success' | 'danger';
  action?: React.ReactNode;
  onDismiss?: () => void;
  className?: string;
}

export const InfoCard: React.FC<InfoCardProps> = ({
  title,
  description,
  icon,
  variant = 'info',
  action,
  onDismiss,
  className,
}) => {
  const variantStyles = {
    info: 'bg-healthInfo/5 border-healthInfo/20 text-slate-900 dark:text-slate-100',
    warning: 'bg-healthWarning/5 border-healthWarning/20 text-slate-900 dark:text-slate-100',
    success: 'bg-healthSuccess/5 border-healthSuccess/20 text-slate-900 dark:text-slate-100',
    danger: 'bg-healthError/5 border-healthError/20 text-slate-900 dark:text-slate-100',
  };

  return (
    <div className={cn('p-5 rounded-md border shadow-subtle flex items-start justify-between gap-4', variantStyles[variant], className)}>
      <div className="flex items-start gap-3">
        {icon && <div className="mt-0.5 shrink-0">{icon}</div>}
        <div>
          <h4 className="text-h4 font-semibold">{title}</h4>
          <div className="text-small text-slate-600 dark:text-slate-400 mt-1">{description}</div>
          {action && <div className="mt-3">{action}</div>}
        </div>
      </div>
      {onDismiss && (
        <button onClick={onDismiss} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
          ×
        </button>
      )}
    </div>
  );
};
