import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Brain, ArrowRight, Activity, ShieldCheck } from 'lucide-react';
import { useToast } from '../ui/toast';

export const AiPredictionSummary: React.FC = () => {
  const { addToast } = useToast();

  const handleViewReport = () => {
    addToast({
      type: 'info',
      title: 'Opening AI Diagnostic Report',
      message: 'Loading full machine learning risk factors and eGFR trajectory...',
    });
  };

  return (
    <Card className="border-slate-200/80 dark:border-slate-800">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-bold">AI Health Risk Assessment</CardTitle>
            <Badge variant="primary" size="sm">HealthShare ML Engine</Badge>
          </div>
          <CardDescription className="text-xs">
            Automated multi-factor risk assessment models evaluated on patient lab history.
          </CardDescription>
        </div>
        <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 rounded-xl">
          <Brain className="w-5 h-5" />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Risk 1: Kidney Disease Risk */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-indigo-500/10 border border-emerald-200/60 dark:border-emerald-900/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Model 1: Renal Health</span>
              <Badge variant="success" size="sm">Low Risk (8.2%)</Badge>
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Kidney Disease Risk (CKD)</h4>
            <div className="flex items-center justify-between text-2xs text-slate-500 dark:text-slate-400 font-mono pt-1">
              <span>Confidence: 94.5%</span>
              <span>Evaluated: Jul 28, 2026</span>
            </div>
          </div>

          {/* Risk 2: Heart Disease Risk */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-500/10 to-indigo-500/10 border border-sky-200/60 dark:border-sky-900/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Model 2: Cardiovascular</span>
              <Badge variant="info" size="sm">Normal (5.4%)</Badge>
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Heart Disease Risk (CVD)</h4>
            <div className="flex items-center justify-between text-2xs text-slate-500 dark:text-slate-400 font-mono pt-1">
              <span>Confidence: 91.8%</span>
              <span>Evaluated: Jul 20, 2026</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-2xs text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> ML models validated against clinical guidelines.
          </span>
          <Button
            variant="ghost"
            size="xs"
            onClick={handleViewReport}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            View Full Report
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
