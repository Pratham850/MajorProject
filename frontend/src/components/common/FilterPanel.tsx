import React, { useState, useRef, useEffect } from 'react';
import { Filter, RotateCcw, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';

export interface FilterOption {
  id: string;
  label: string;
}

export interface FilterGroup {
  id: string;
  title: string;
  options: FilterOption[];
}

export interface FilterPanelProps {
  groups: FilterGroup[];
  selectedFilters: Record<string, string[]>;
  onChange: (selected: Record<string, string[]>) => void;
  className?: string;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  groups,
  selectedFilters,
  onChange,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const activeCount = Object.values(selectedFilters).reduce((acc, curr) => acc + curr.length, 0);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const toggleOption = (groupId: string, optionId: string) => {
    const currentGroup = selectedFilters[groupId] || [];
    const isSelected = currentGroup.includes(optionId);
    const updatedGroup = isSelected
      ? currentGroup.filter((id) => id !== optionId)
      : [...currentGroup, optionId];

    onChange({
      ...selectedFilters,
      [groupId]: updatedGroup,
    });
  };

  const clearAll = () => {
    const resetState: Record<string, string[]> = {};
    groups.forEach((g) => (resetState[g.id] = []));
    onChange(resetState);
  };

  return (
    <div className={cn('relative', className)} ref={panelRef}>
      {/* Filter Toggle Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        leftIcon={<Filter className="w-4 h-4 text-slate-500" />}
        rightIcon={
          activeCount > 0 ? (
            <Badge variant="primary" size="sm" className="ml-1 px-1.5 py-0 text-[10px]">
              {activeCount}
            </Badge>
          ) : undefined
        }
      >
        Filter
      </Button>

      {/* Popover Panel */}
      {isOpen && (
        <div className="absolute right-0 sm:right-auto sm:left-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-dialog z-50 animate-scale-in p-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Filter Results</h4>
            <div className="flex items-center gap-2">
              {activeCount > 0 && (
                <button
                  onClick={clearAll}
                  className="text-2xs font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              )}
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
            {groups.map((group) => {
              const selectedInGroup = selectedFilters[group.id] || [];
              return (
                <div key={group.id}>
                  <span className="text-2xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2">
                    {group.title}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {group.options.map((opt) => {
                      const isSelected = selectedInGroup.includes(opt.id);
                      return (
                        <button
                          key={opt.id}
                          onClick={() => toggleOption(group.id, opt.id)}
                          className={cn(
                            'text-xs px-2.5 py-1 rounded-lg border font-medium transition-all select-none',
                            isSelected
                              ? 'bg-primary-50 dark:bg-primary-950/60 border-primary-500 text-primary-700 dark:text-primary-300 font-semibold shadow-2xs'
                              : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                          )}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
