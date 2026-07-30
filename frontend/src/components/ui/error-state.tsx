import React from 'react';
import { cn } from '../../lib/utils';
import { AlertOctagon, RefreshCw, XCircle } from 'lucide-react';
import { Button } from './button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Failed to load data',
  message = 'An unexpected error occurred while communicating with HealthShare services. Please check your network connection and try again.',
  onRetry,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 sm:p-12 border border-rose-200 dark:border-rose-900/40 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 my-4',
        className
      )}
    >
      <div className="p-3.5 bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 rounded-2xl mb-4 shrink-0">
        <AlertOctagon className="w-8 h-8" />
      </div>
      <h3 className="text-base font-semibold text-rose-950 dark:text-rose-200 max-w-md">{title}</h3>
      <p className="text-xs text-rose-700 dark:text-rose-300/80 mt-1.5 max-w-md">{message}</p>
      {onRetry && (
        <div className="mt-5">
          <Button
            variant="danger"
            size="sm"
            onClick={onRetry}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Retry Connection
          </Button>
        </div>
      )}
    </div>
  );
};

export interface ErrorBannerProps {
  title?: string;
  message: string;
  onDismiss?: () => void;
  className?: string;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ title, message, onDismiss, className }) => (
  <div
    className={cn(
      'p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-start gap-3 text-rose-800 dark:text-rose-200',
      className
    )}
  >
    <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
    <div className="flex-1 text-xs">
      {title && <h4 className="font-semibold text-sm text-rose-900 dark:text-rose-100">{title}</h4>}
      <p className={title ? 'mt-0.5' : ''}>{message}</p>
    </div>
    {onDismiss && (
      <button onClick={onDismiss} className="text-rose-400 hover:text-rose-600 p-1">
        ✕
      </button>
    )}
  </div>
);
