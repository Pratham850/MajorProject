import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'destructive' | 'info';
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
    ({ className, variant = 'default', ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:focus:ring-slate-300 dark:ring-offset-slate-950",
                    {
                        "border-transparent bg-slate-900 text-slate-50 hover:bg-slate-900/80 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-800/80": variant === 'default',
                        "border-transparent bg-slate-100 text-slate-900 hover:bg-slate-100/80 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:bg-slate-800/70": variant === 'secondary',
                        "border-slate-200 text-slate-950 bg-white dark:border-slate-800 dark:text-slate-300 dark:bg-slate-900": variant === 'outline',
                        "border-transparent bg-emerald-50 text-emerald-800 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/30": variant === 'success',
                        "border-transparent bg-amber-50 text-amber-800 border-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/30": variant === 'warning',
                        "border-transparent bg-rose-50 text-rose-800 border-rose-100 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/30": variant === 'destructive',
                        "border-transparent bg-blue-50 text-blue-800 border-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/30": variant === 'info'
                    },
                    className
                )}
                {...props}
            />
        );
    }
);
Badge.displayName = "Badge";

export { Badge };
