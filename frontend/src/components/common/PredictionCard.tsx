import React from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Activity, AlertTriangle, CheckCircle, Cpu, Info } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface PredictionCardProps {
  diseaseName: string;
  riskScore: number; // 0 - 100 percentage
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH';
  confidence: number; // percentage
  keyFeatures: string[];
  recommendation: string;
  className?: string;
}

export const PredictionCard: React.FC<PredictionCardProps> = ({
  diseaseName,
  riskScore,
  riskLevel,
  confidence,
  keyFeatures,
  recommendation,
  className,
}) => {
  const riskBadgeConfig: Record<string, { variant: any; icon: React.ReactNode; barColor: string }> = {
    LOW: { variant: 'success', icon: <CheckCircle className="w-4 h-4 text-emerald-500" />, barColor: 'bg-emerald-500' },
    MODERATE: { variant: 'warning', icon: <AlertTriangle className="w-4 h-4 text-amber-500" />, barColor: 'bg-amber-500' },
    HIGH: { variant: 'danger', icon: <AlertTriangle className="w-4 h-4 text-rose-500" />, barColor: 'bg-rose-500' },
  };

  const risk = riskBadgeConfig[riskLevel] || riskBadgeConfig.LOW;

  return (
    <Card className={cn('p-5 flex flex-col justify-between hover:shadow-elevated transition-all duration-200', className)}>
      <div>
        {/* Model Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <Badge variant={risk.variant} size="sm" dot>
            {riskLevel} RISK ({riskScore}%)
          </Badge>
          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
            <Cpu className="w-3 h-3 text-primary-600" /> {confidence}% Confidence
          </span>
        </div>

        {/* Title */}
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0">
            <Activity className="w-5 h-5 text-primary-700 dark:text-primary-400" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">{diseaseName}</h4>
            <p className="text-2xs text-slate-500 dark:text-slate-400 mt-0.5">Random Forest ML Predictor v2.1</p>
          </div>
        </div>

        {/* Risk Score Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-2xs font-semibold text-slate-500 mb-1">
            <span>Risk Meter</span>
            <span>{riskScore}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div className={cn('h-full transition-all duration-500 rounded-full', risk.barColor)} style={{ width: `${riskScore}%` }} />
          </div>
        </div>

        {/* Key Predictors / Features */}
        <div className="mt-4">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
            Primary Biomarkers / Predictors:
          </span>
          <div className="flex flex-wrap gap-1">
            {keyFeatures.map((feat, i) => (
              <span key={i} className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded">
                {feat}
              </span>
            ))}
          </div>
        </div>

        {/* Clinical Recommendation Callout */}
        <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
          <Info className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
          <p className="text-2xs leading-relaxed">
            <strong className="font-semibold text-slate-900 dark:text-white">Clinical Note: </strong>
            {recommendation}
          </p>
        </div>
      </div>
    </Card>
  );
};
