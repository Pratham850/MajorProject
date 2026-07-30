import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'outline' | 'default' | 'destructive';
  size?: 'sm' | 'md';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'primary',
  size = 'md',
  dot = false,
  children,
  ...props
}) => {
  const mapVariant = (v: string) => {
    if (v === 'default') return 'primary';
    if (v === 'destructive') return 'danger';
    return v;
  };

  const actualVariant = mapVariant(variant);

  const variantStyles: Record<string, string> = {
    primary: 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary border-primary/20',
    secondary: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    success: 'bg-healthSuccess/10 text-healthSuccess dark:bg-healthSuccess/20 dark:text-healthSuccess border-healthSuccess/20',
    warning: 'bg-healthWarning/10 text-healthWarning dark:bg-healthWarning/20 dark:text-healthWarning border-healthWarning/20',
    danger: 'bg-healthError/10 text-healthError dark:bg-healthError/20 dark:text-healthError border-healthError/20',
    info: 'bg-healthInfo/10 text-healthInfo dark:bg-healthInfo/20 dark:text-healthInfo border-healthInfo/20',
    outline: 'bg-transparent text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700',
  };

  const dotColors: Record<string, string> = {
    primary: 'bg-primary',
    secondary: 'bg-slate-400',
    success: 'bg-healthSuccess',
    warning: 'bg-healthWarning',
    danger: 'bg-healthError',
    info: 'bg-healthInfo',
    outline: 'bg-slate-400',
  };

  const sizeStyles = {
    sm: 'text-2xs px-2 py-0.5 gap-1 font-medium',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-semibold',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border transition-colors select-none tracking-wide',
        variantStyles[actualVariant] || variantStyles.primary,
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotColors[actualVariant] || dotColors.primary)} />}
      <span>{children}</span>
    </span>
  );
};
