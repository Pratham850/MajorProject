import React from 'react';
import { cn } from '@/lib/utils';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    error?: boolean;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, error, children, ...props }, ref) => {
        return (
            <select
                className={cn(
                    "flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-semibold ring-offset-white focus-visible:outline-none focus-visible:ring-4 focus-visible:bg-white transition-all disabled:cursor-not-allowed disabled:opacity-50 appearance-none cursor-pointer dark:bg-slate-900/40 dark:border-slate-800/80 dark:ring-offset-slate-950 dark:focus-visible:bg-slate-900 dark:text-slate-100",
                    error 
                        ? "border-rose-300 focus-visible:border-rose-500 focus-visible:ring-rose-50 dark:border-rose-900/50 dark:focus-visible:border-rose-500 dark:focus-visible:ring-rose-950/30" 
                        : "border-transparent hover:border-slate-200 focus-visible:border-primary-500 focus-visible:ring-primary-50 dark:hover:border-slate-800 dark:focus-visible:border-primary-500 dark:focus-visible:ring-primary-950/30",
                    className
                )}
                ref={ref}
                {...props}
            >
                {children}
            </select>
        );
    }
);
Select.displayName = "Select";

export { Select };
