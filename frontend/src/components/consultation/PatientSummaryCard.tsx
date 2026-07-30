import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { User, Heart, ShieldAlert, PhoneCall, Activity, Droplets } from 'lucide-react';

export interface PatientSummaryData {
  name: string;
  age: number;
  gender: string;
  bloodGroup: string;
  allergies: string[];
  chronicDiseases: string[];
  emergencyContact: string;
  healthScore: number;
}

const defaultPatientData: PatientSummaryData = {
  name: 'Sarah Jenkins',
  age: 42,
  gender: 'Female',
  bloodGroup: 'O Positive (O+)',
  allergies: ['Penicillin', 'Latex', 'Sulfa Drugs'],
  chronicDiseases: ['Essential Hypertension', 'Stage 1 CKD Risk'],
  emergencyContact: '+1 (555) 948-2041 (Spouse)',
  healthScore: 98,
};

export const PatientSummaryCard: React.FC<{ data?: PatientSummaryData }> = ({
  data = defaultPatientData,
}) => {
  return (
    <Card className="border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow-xs">
            {data.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <span>{data.name}</span>
              <Badge variant="info" size="sm">
                {data.age} yrs • {data.gender}
              </Badge>
            </CardTitle>
            <p className="text-2xs text-slate-500 dark:text-slate-400">HIPAA Encrypted Patient Record</p>
          </div>
        </div>

        {/* Health Score */}
        <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl border border-emerald-200/60 dark:border-emerald-900/60 flex items-center gap-3">
          <div className="p-1.5 bg-emerald-500 text-white rounded-lg">
            <Heart className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase block">Health Score</span>
            <span className="text-sm font-black text-slate-900 dark:text-slate-100 font-sans">
              {data.healthScore} <span className="text-2xs font-normal text-slate-400">/ 100</span>
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        {/* Blood Group */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
          <span className="text-slate-400 font-bold uppercase text-[10px] flex items-center gap-1">
            <Droplets className="w-3 h-3 text-rose-500" /> Blood Group
          </span>
          <span className="text-slate-900 dark:text-slate-100 font-bold">{data.bloodGroup}</span>
        </div>

        {/* Allergies */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
          <span className="text-slate-400 font-bold uppercase text-[10px] flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-amber-500" /> Known Allergies
          </span>
          <div className="flex flex-wrap gap-1">
            {data.allergies.map((allergy, i) => (
              <Badge key={i} variant="warning" size="sm">
                {allergy}
              </Badge>
            ))}
          </div>
        </div>

        {/* Chronic Diseases */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
          <span className="text-slate-400 font-bold uppercase text-[10px] flex items-center gap-1">
            <Activity className="w-3 h-3 text-indigo-500" /> Chronic Diseases
          </span>
          <div className="flex flex-wrap gap-1">
            {data.chronicDiseases.map((disease, i) => (
              <Badge key={i} variant="secondary" size="sm">
                {disease}
              </Badge>
            ))}
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
          <span className="text-slate-400 font-bold uppercase text-[10px] flex items-center gap-1">
            <PhoneCall className="w-3 h-3 text-emerald-500" /> Emergency Contact
          </span>
          <span className="text-slate-900 dark:text-slate-100 font-semibold">{data.emergencyContact}</span>
        </div>
      </CardContent>
    </Card>
  );
};
