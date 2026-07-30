import React from 'react';
import { cn } from '../../lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'text',
  ...props
}) => {
  const variantStyles = {
    text: 'h-4 w-full rounded',
    circular: 'rounded-full aspect-square',
    rectangular: 'rounded-lg w-full',
    card: 'rounded-xl w-full h-32',
  };

  return (
    <div
      className={cn(
        'bg-slate-200 dark:bg-slate-800 animate-pulse relative overflow-hidden',
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
};

export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({ lines = 3, className }) => (
  <div className={cn('space-y-2.5 w-full', className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton key={i} variant="text" className={i === lines - 1 ? 'w-4/6' : 'w-full'} />
    ))}
  </div>
);

export const SkeletonTableRows: React.FC<{ rows?: number }> = ({ rows = 4 }) => (
  <div className="space-y-3 w-full p-4">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-4">
        <Skeleton variant="circular" className="w-8 h-8" />
        <Skeleton variant="text" className="w-1/3 h-4" />
        <Skeleton variant="text" className="w-1/4 h-4" />
        <Skeleton variant="text" className="w-1/5 h-4 ml-auto" />
      </div>
    ))}
  </div>
);
