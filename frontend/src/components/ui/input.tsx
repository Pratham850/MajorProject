import React from 'react';
import { cn } from '../../lib/utils';

// --- Label Primitive ---
export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export const Label: React.FC<LabelProps> = ({ className, required, children, ...props }) => (
  <label
    className={cn('block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5', className)}
    {...props}
  >
    {children}
    {required && <span className="text-healthError ml-1">*</span>}
  </label>
);

// --- Helper, Success & Error Text ---
export const HelperText: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <p className={cn('text-xs text-slate-500 dark:text-slate-400 mt-1.5', className)}>{children}</p>
);

export const SuccessMessage: React.FC<{ children?: React.ReactNode; className?: string }> = ({ children, className }) => {
  if (!children) return null;
  return <p className={cn('text-xs text-healthSuccess dark:text-healthSuccess font-medium mt-1.5', className)}>{children}</p>;
};

export const ErrorMessage: React.FC<{ children?: React.ReactNode; className?: string }> = ({ children, className }) => {
  if (!children) return null;
  return <p className={cn('text-xs text-healthError dark:text-healthError font-medium mt-1.5', className)}>{children}</p>;
};

// --- Text Input Primitive ---
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string | boolean | any;
  success?: string | boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  required?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, helperText, error, success, leftIcon, rightIcon, required, id, disabled, ...props }, ref) => {
    const inputId = id || React.useId();
    const hasError = Boolean(error);
    const hasSuccess = Boolean(success) && !hasError;
    const errorText = typeof error === 'string' ? error : undefined;
    const successText = typeof success === 'string' ? success : undefined;

    return (
      <div className="w-full">
        {label && <Label htmlFor={inputId} required={required}>{label}</Label>}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-slate-400 pointer-events-none flex items-center justify-center">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            className={cn(
              'w-full min-h-[40px] bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-small rounded-md border transition-all duration-150 placeholder:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary disabled:opacity-50 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:cursor-not-allowed',
              leftIcon ? 'pl-10' : 'pl-3.5',
              rightIcon ? 'pr-10' : 'pr-3.5',
              hasError
                ? 'border-healthError focus-visible:ring-healthError focus-visible:border-healthError'
                : hasSuccess
                ? 'border-healthSuccess focus-visible:ring-healthSuccess focus-visible:border-healthSuccess'
                : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600',
              'py-2',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 text-slate-400 flex items-center justify-center">
              {rightIcon}
            </div>
          )}
        </div>
        {errorText ? (
          <ErrorMessage>{errorText}</ErrorMessage>
        ) : successText ? (
          <SuccessMessage>{successText}</SuccessMessage>
        ) : helperText ? (
          <HelperText>{helperText}</HelperText>
        ) : null}
      </div>
    );
  }
);
Input.displayName = 'Input';

// --- Textarea Primitive ---
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string | boolean | any;
  required?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, helperText, error, required, id, ...props }, ref) => {
    const inputId = id || React.useId();
    const hasError = Boolean(error);
    const errorText = typeof error === 'string' ? error : undefined;

    return (
      <div className="w-full">
        {label && <Label htmlFor={inputId} required={required}>{label}</Label>}
        <textarea
          id={inputId}
          ref={ref}
          className={cn(
            'w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-small rounded-md border p-3 transition-all duration-150 placeholder:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary min-h-[100px] resize-y',
            hasError
              ? 'border-healthError focus-visible:ring-healthError'
              : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600',
            className
          )}
          {...props}
        />
        {errorText ? <ErrorMessage>{errorText}</ErrorMessage> : helperText ? <HelperText>{helperText}</HelperText> : null}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

// --- Checkbox Primitive ---
export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, id, ...props }, ref) => {
    const checkId = id || React.useId();
    return (
      <div className="flex items-start gap-3 select-none cursor-pointer">
        <input
          id={checkId}
          type="checkbox"
          ref={ref}
          className={cn(
            'w-4.5 h-4.5 rounded border-slate-300 dark:border-slate-700 text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer mt-0.5',
            className
          )}
          {...props}
        />
        {(label || description) && (
          <label htmlFor={checkId} className="cursor-pointer text-small">
            {label && <span className="font-medium text-slate-800 dark:text-slate-200">{label}</span>}
            {description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>}
          </label>
        )}
      </div>
    );
  }
);
Checkbox.displayName = 'Checkbox';

// --- Radio Primitive ---
export interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, description, id, ...props }, ref) => {
    const radioId = id || React.useId();
    return (
      <div className="flex items-start gap-3 select-none cursor-pointer">
        <input
          id={radioId}
          type="radio"
          ref={ref}
          className={cn(
            'w-4.5 h-4.5 rounded-full border-slate-300 dark:border-slate-700 text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer mt-0.5',
            className
          )}
          {...props}
        />
        {(label || description) && (
          <label htmlFor={radioId} className="cursor-pointer text-small">
            {label && <span className="font-medium text-slate-800 dark:text-slate-200">{label}</span>}
            {description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>}
          </label>
        )}
      </div>
    );
  }
);
Radio.displayName = 'Radio';

// --- Switch / Toggle Primitive ---
export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({ checked, onChange, label, disabled = false, className }) => {
  return (
    <label className={cn('inline-flex items-center gap-3 cursor-pointer select-none', disabled && 'opacity-50 cursor-not-allowed', className)}>
      <div
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          'w-11 h-6 rounded-full p-1 transition-colors duration-150 ease-in-out relative',
          checked ? 'bg-primary dark:bg-primary' : 'bg-slate-300 dark:bg-slate-700'
        )}
      >
        <div
          className={cn(
            'w-4 h-4 rounded-full bg-white shadow-subtle transform transition-transform duration-150 ease-in-out',
            checked ? 'translate-x-5' : 'translate-x-0'
          )}
        />
      </div>
      {label && <span className="text-small font-medium text-slate-800 dark:text-slate-200">{label}</span>}
    </label>
  );
};
