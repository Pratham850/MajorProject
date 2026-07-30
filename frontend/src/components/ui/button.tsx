import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger' | 'destructive' | 'soft' | 'link' | 'success';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const actualVariant = variant === 'destructive' ? 'danger' : variant;

    const baseStyles =
      'inline-flex items-center justify-center font-semibold rounded-md transition-all duration-150 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

    const variantStyles = {
      primary:
        'bg-primary text-white hover:brightness-95 shadow-subtle hover:shadow-card dark:bg-primary dark:text-slate-950 dark:hover:brightness-110 dark:hover:shadow-teal-glow',
      secondary:
        'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-subtle',
      accent:
        'bg-accent text-white hover:brightness-95 shadow-subtle dark:bg-accent dark:text-slate-950 dark:hover:brightness-110',
      outline:
        'border border-primary text-primary bg-transparent hover:bg-primary/10 dark:border-primary dark:text-primary dark:hover:bg-primary/20',
      ghost:
        'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 focus-visible:ring-slate-400',
      danger:
        'bg-healthError text-white hover:brightness-95 shadow-subtle dark:bg-healthError dark:text-slate-950 dark:hover:brightness-110',
      destructive:
        'bg-healthError text-white hover:brightness-95 shadow-subtle dark:bg-healthError dark:text-slate-950 dark:hover:brightness-110',
      soft:
        'bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/20 dark:text-primary',
      success:
        'bg-healthSuccess text-white hover:brightness-95 shadow-subtle dark:bg-healthSuccess dark:text-slate-950 dark:hover:brightness-110',
      link:
        'bg-transparent text-primary hover:underline p-0 focus-visible:ring-0 active:scale-100',
    };

    const sizeStyles = {
      xs: 'text-xs px-2.5 py-1 gap-1.5 min-h-[28px]',
      sm: 'text-xs px-3 py-1.5 gap-1.5 min-h-[32px]',
      md: 'text-btn px-4 py-2 gap-2 min-h-[40px]',
      lg: 'text-body font-semibold px-6 py-3 gap-2.5 min-h-[48px]',
      icon: 'p-2 aspect-square min-w-[36px] min-h-[36px] justify-center',
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cn(
          baseStyles,
          variantStyles[actualVariant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {!isLoading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
        {children && <span>{children}</span>}
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
