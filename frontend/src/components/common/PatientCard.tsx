import React from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ShieldCheck, Clock, FileText, Brain, Calendar } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface PatientCardProps {
  id: string;
  name: string;
  mrn: string;
  age: number;
  gender: string;
  consentStatus: 'Active' | 'Expiring Soon' | 'Pending Renewal';
  consentExpiry: string;
  lastUpdated: string;
  dataScopes: string[];
  aiRiskLevel?: 'LOW' | 'MODERATE' | 'HIGH';
  onViewRecords?: () => void;
  onViewPrediction?: () => void;
  onViewConsent?: () => void;
  className?: string;
}

export const PatientCard: React.FC<PatientCardProps> = ({
  name,
  mrn,
  age,
  gender,
  consentStatus,
  consentExpiry,
  lastUpdated,
  dataScopes,
  aiRiskLevel = 'LOW',
  onViewRecords,
  onViewPrediction,
  onViewConsent,
  className,
}) => {
  const statusConfig = {
    'Active': { variant: 'success' as const, icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> },
    'Expiring Soon': { variant: 'warning' as const, icon: <Clock className="w-3.5 h-3.5 text-amber-500" /> },
    'Pending Renewal': { variant: 'danger' as const, icon: <Clock className="w-3.5 h-3.5 text-rose-500" /> },
  };

  const st = statusConfig[consentStatus] || statusConfig['Active'];

  return (
    <Card className={cn('p-5 flex flex-col justify-between hover:shadow-md transition-all duration-200 border-slate-200/80 dark:border-slate-800', className)}>
      <div>
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <Badge variant={st.variant} size="sm" dot>
            {consentStatus}
          </Badge>
          <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
            {mrn}
          </span>
        </div>

        {/* Patient Profile */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 font-bold text-sm flex items-center justify-center shrink-0">
            {name.charAt(0)}
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{name}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {age} years old • {gender}
            </p>
          </div>
        </div>

        {/* Data Scopes */}
        <div className="mt-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Authorized Records ({dataScopes.length}):
          </span>
          <div className="flex flex-wrap gap-1">
            {dataScopes.map((scope, idx) => (
              <span key={idx} className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded font-mono">
                {scope}
              </span>
            ))}
          </div>
        </div>

        {/* Expiry & Last Updated */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-2xs text-slate-400">
          <span>Updated: {lastUpdated}</span>
          <span className="inline-flex items-center gap-1 font-semibold text-slate-600 dark:text-slate-300">
            <Calendar className="w-3 h-3 text-slate-400" /> Expires: {consentExpiry}
          </span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-1">
        <Button variant="ghost" size="xs" onClick={onViewConsent} title="View Consent">
          Consent Details
        </Button>
        <div className="flex items-center gap-1.5">
          <Button variant="soft" size="xs" onClick={onViewRecords} leftIcon={<FileText className="w-3.5 h-3.5" />}>
            Records
          </Button>
          <Button variant="outline" size="xs" onClick={onViewPrediction} leftIcon={<Brain className="w-3.5 h-3.5" />}>
            AI Risk
          </Button>
        </div>
      </div>
    </Card>
  );
};
