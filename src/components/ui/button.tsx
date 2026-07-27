import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'default', size = 'default', ...props }, ref) => {
        return (
            <button
                className={cn(
                    "inline-flex items-center justify-center rounded-xl text-xs font-bold ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
                    {
                        // Variants
                        "bg-primary-600 text-white hover:bg-primary-500 shadow-sm shadow-primary-100 dark:shadow-none": variant === 'default',
                        "bg-rose-600 text-white hover:bg-rose-500 shadow-sm shadow-rose-100 dark:shadow-none": variant === 'destructive',
                        "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100": variant === 'outline',
                        "bg-slate-100 text-slate-900 hover:bg-slate-100/80 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700/80": variant === 'secondary',
                        "text-slate-900 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-100 dark:hover:bg-slate-800": variant === 'ghost',
                        "text-primary-600 underline-offset-4 hover:underline dark:text-primary-400": variant === 'link',
                        
                        // Sizes
                        "h-10 px-4 py-2": size === 'default',
                        "h-8 rounded-lg px-3 text-[10px]": size === 'sm',
                        "h-12 rounded-2xl px-8": size === 'lg',
                        "h-9 w-9 rounded-lg": size === 'icon'
                    },
                    className
                )}
                ref={ref}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";

export { Button };
