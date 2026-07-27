import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, error, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(
                    "flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-semibold ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:bg-white transition-all disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-900/40 dark:border-slate-800/80 dark:ring-offset-slate-950 dark:placeholder:text-slate-500 dark:focus-visible:bg-slate-900 dark:text-slate-100",
                    error 
                        ? "border-rose-300 focus-visible:border-rose-500 focus-visible:ring-rose-50 dark:border-rose-900/50 dark:focus-visible:border-rose-500 dark:focus-visible:ring-rose-950/30" 
                        : "border-transparent hover:border-slate-200 focus-visible:border-primary-500 focus-visible:ring-primary-50 dark:hover:border-slate-800 dark:focus-visible:border-primary-500 dark:focus-visible:ring-primary-950/30",
                    className
                )}
                ref={ref}
                {...props}
            />
        );
    }
);
Input.displayName = "Input";

export { Input };
