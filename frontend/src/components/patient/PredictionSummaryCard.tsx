import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Brain, ArrowRight, Activity } from 'lucide-react';

export interface PredictionSummaryProps {
  predictionResult?: string;
  riskLevel?: string;
  confidenceScore?: string;
  predictionDate?: string;
  eGFR?: string;
  creatinine?: string;
}

export const PredictionSummaryCard: React.FC<PredictionSummaryProps> = ({
  predictionResult = 'Stage 1 / Low Risk',
  riskLevel = 'Low (8.2%)',
  confidenceScore = '94.5%',
  predictionDate = 'July 28, 2026',
  eGFR = '92 mL/min/1.73m²',
  creatinine = '0.9 mg/dL',
}) => {
  const navigate = useNavigate();

  return (
    <Card className="border-slate-200/80 dark:border-slate-800">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-bold">Latest AI CKD Prediction</CardTitle>
            <Badge variant="primary" size="sm">Machine Learning Model</Badge>
          </div>
          <CardDescription className="text-xs">
            Automated Chronic Kidney Disease risk prediction evaluated by HealthShare ML Engine.
          </CardDescription>
        </div>
        <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 rounded-xl">
          <Brain className="w-5 h-5" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-primary-500/10 to-indigo-500/10 border border-emerald-200/60 dark:border-emerald-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-2xs font-bold uppercase tracking-wider text-slate-400">Diagnosis Assessment</span>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>{predictionResult}</span>
              <Badge variant="success" size="sm">Low Risk</Badge>
            </h3>
            <p className="text-2xs text-slate-500 dark:text-slate-400">
              Evaluated on {predictionDate} • eGFR: <strong className="text-slate-700 dark:text-slate-300 font-mono">{eGFR}</strong> • Creatinine: <strong className="text-slate-700 dark:text-slate-300 font-mono">{creatinine}</strong>
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/ai-prediction')}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="shrink-0"
          >
            View Details
          </Button>
        </div>

        {/* Breakdown Key Metrics */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Risk Level</span>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{riskLevel}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Confidence</span>
            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{confidenceScore}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Model Status</span>
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1">
              <Activity className="w-3.5 h-3.5 text-emerald-500" /> Active
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
