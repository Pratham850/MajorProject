import React from 'react';
import { Button } from '../ui/button';
import { Trash2, Pill } from 'lucide-react';

export interface MedicineItem {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface MedicineCardProps {
  medicine: MedicineItem;
  onChange: (id: string, updated: Partial<MedicineItem>) => void;
  onRemove: (id: string) => void;
  index: number;
}

export const MedicineCard: React.FC<MedicineCardProps> = ({
  medicine,
  onChange,
  onRemove,
  index,
}) => {
  return (
    <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600">
            <Pill className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
            Medication #{index + 1}
          </span>
        </div>

        <Button
          variant="ghost"
          size="xs"
          onClick={() => onRemove(medicine.id)}
          leftIcon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
          className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
        >
          Remove
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* Medicine Name */}
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
            Medicine Name
          </label>
          <input
            type="text"
            value={medicine.name}
            onChange={(e) => onChange(medicine.id, { name: e.target.value })}
            placeholder="e.g. Lisinopril"
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-slate-900 dark:text-slate-100 text-xs focus:border-primary-500 focus:outline-none"
          />
        </div>

        {/* Dosage */}
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
            Dosage
          </label>
          <input
            type="text"
            value={medicine.dosage}
            onChange={(e) => onChange(medicine.id, { dosage: e.target.value })}
            placeholder="e.g. 10mg"
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-slate-900 dark:text-slate-100 text-xs focus:border-primary-500 focus:outline-none"
          />
        </div>

        {/* Frequency */}
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
            Frequency
          </label>
          <select
            value={medicine.frequency}
            onChange={(e) => onChange(medicine.id, { frequency: e.target.value })}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-slate-900 dark:text-slate-100 text-xs focus:border-primary-500 focus:outline-none"
          >
            <option value="Once Daily (0-0-1)">Once Daily (QD)</option>
            <option value="Twice Daily (1-0-1)">Twice Daily (BID)</option>
            <option value="Three Times Daily (1-1-1)">Three Times Daily (TID)</option>
            <option value="Four Times Daily (1-1-1-1)">Four Times Daily (QID)</option>
            <option value="As Needed (PRN)">As Needed (PRN)</option>
          </select>
        </div>

        {/* Duration */}
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
            Duration
          </label>
          <input
            type="text"
            value={medicine.duration}
            onChange={(e) => onChange(medicine.id, { duration: e.target.value })}
            placeholder="e.g. 30 Days"
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-slate-900 dark:text-slate-100 text-xs focus:border-primary-500 focus:outline-none"
          />
        </div>

        {/* Special Instructions */}
        <div className="sm:col-span-2 lg:col-span-4">
          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
            Special Instructions
          </label>
          <input
            type="text"
            value={medicine.instructions}
            onChange={(e) => onChange(medicine.id, { instructions: e.target.value })}
            placeholder="e.g. Take after meals in the morning. Drink plenty of water."
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-slate-900 dark:text-slate-100 text-xs focus:border-primary-500 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
};
