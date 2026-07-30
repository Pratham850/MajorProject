import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { MedicineCard, MedicineItem } from './MedicineCard';
import { Plus, Pill } from 'lucide-react';

export interface PrescriptionBuilderProps {
  medicines: MedicineItem[];
  onChange: (medicines: MedicineItem[]) => void;
}

export const PrescriptionBuilder: React.FC<PrescriptionBuilderProps> = ({
  medicines,
  onChange,
}) => {
  const handleAddMedicine = () => {
    const newMed: MedicineItem = {
      id: `med-${Date.now()}`,
      name: '',
      dosage: '',
      frequency: 'Once Daily (0-0-1)',
      duration: '30 Days',
      instructions: 'Take after meals.',
    };
    onChange([...medicines, newMed]);
  };

  const handleUpdateMedicine = (id: string, updated: Partial<MedicineItem>) => {
    onChange(medicines.map((m) => (m.id === id ? { ...m, ...updated } : m)));
  };

  const handleRemoveMedicine = (id: string) => {
    onChange(medicines.filter((m) => m.id !== id));
  };

  return (
    <Card className="border-slate-200/80 dark:border-slate-800">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <span>Digital Prescription Builder</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Add prescribed medications, dosages, frequency, and instructions.
          </CardDescription>
        </div>
        <div className="p-2 bg-amber-50 dark:bg-amber-950/60 text-amber-600 rounded-xl">
          <Pill className="w-5 h-5" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {medicines.length === 0 ? (
          <div className="p-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 text-xs">
            No medications added yet. Click "Add Medicine" to prescribe drugs.
          </div>
        ) : (
          medicines.map((med, index) => (
            <MedicineCard
              key={med.id}
              medicine={med}
              index={index}
              onChange={handleUpdateMedicine}
              onRemove={handleRemoveMedicine}
            />
          ))
        )}

        <Button
          variant="outline"
          size="xs"
          onClick={handleAddMedicine}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          className="w-full sm:w-auto"
        >
          Add Medicine
        </Button>
      </CardContent>
    </Card>
  );
};
