import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { TrendingDown, TrendingUp, Minus, Activity } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface PredictionComparisonItem {
  date: string;
  score: number;
  level: 'LOW' | 'MODERATE' | 'HIGH';
  confidence: number;
  sc: number;
  bu: number;
  hemo: number;
}

export interface PredictionComparisonProps {
  current: PredictionComparisonItem;
  previous: PredictionComparisonItem;
  className?: string;
}

export const PredictionComparison: React.FC<PredictionComparisonProps> = ({
  current,
  previous,
  className,
}) => {
  const scoreDiff = current.score - previous.score;
  const isImproved = scoreDiff < 0;
  const isSame = scoreDiff === 0;

  return (
    <Card className={cn('border-slate-200/80 dark:border-slate-800', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary-600" />
            <CardTitle className="text-sm font-bold">Prediction Trend & Biomarker Delta</CardTitle>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold">
            {isSame ? (
              <span className="text-slate-500 inline-flex items-center gap-1">
                <Minus className="w-4 h-4" /> Stable (0% change)
              </span>
            ) : isImproved ? (
              <span className="text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1">
                <TrendingDown className="w-4 h-4" /> Improved ({scoreDiff}%)
              </span>
            ) : (
              <span className="text-rose-600 dark:text-rose-400 inline-flex items-center gap-1">
                <TrendingUp className="w-4 h-4" /> Increased Risk (+{scoreDiff}%)
              </span>
            )}
          </div>
        </div>
        <CardDescription className="text-2xs">
          Comparing current assessment ({current.date}) against prior baseline ({previous.date}).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-xs">
        {/* Score comparison gauge cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Prior Baseline ({previous.date})</span>
            <div className="flex items-center justify-between">
              <span className="text-lg font-black text-slate-700 dark:text-slate-200">{previous.score}%</span>
              <Badge variant={previous.level === 'LOW' ? 'success' : previous.level === 'MODERATE' ? 'warning' : 'danger'} size="sm">
                {previous.level}
              </Badge>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-primary-50/50 dark:bg-primary-950/40 border border-primary-200/60 dark:border-primary-800 space-y-1">
            <span className="text-[10px] font-bold text-primary-700 dark:text-primary-300 uppercase block">Current Assessment ({current.date})</span>
            <div className="flex items-center justify-between">
              <span className="text-lg font-black text-primary-900 dark:text-white">{current.score}%</span>
              <Badge variant={current.level === 'LOW' ? 'success' : current.level === 'MODERATE' ? 'warning' : 'danger'} size="sm">
                {current.level}
              </Badge>
            </div>
          </div>
        </div>

        {/* Key Biomarker Delta Comparison Table */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <table className="w-full text-left text-2xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 uppercase font-bold">
              <tr>
                <th className="px-3 py-2">Biomarker Metric</th>
                <th className="px-3 py-2">Previous Value</th>
                <th className="px-3 py-2">Current Value</th>
                <th className="px-3 py-2 text-right">Delta Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-3 py-2 font-bold text-slate-900 dark:text-white">Serum Creatinine</td>
                <td className="px-3 py-2 font-mono">{previous.sc} mg/dL</td>
                <td className="px-3 py-2 font-mono font-bold">{current.sc} mg/dL</td>
                <td className="px-3 py-2 text-right font-mono font-bold">
                  {current.sc > previous.sc ? (
                    <span className="text-rose-500">+{ (current.sc - previous.sc).toFixed(1) }</span>
                  ) : (
                    <span className="text-emerald-500">{ (current.sc - previous.sc).toFixed(1) }</span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-bold text-slate-900 dark:text-white">Blood Urea</td>
                <td className="px-3 py-2 font-mono">{previous.bu} mg/dL</td>
                <td className="px-3 py-2 font-mono font-bold">{current.bu} mg/dL</td>
                <td className="px-3 py-2 text-right font-mono font-bold">
                  {current.bu > previous.bu ? (
                    <span className="text-rose-500">+{current.bu - previous.bu}</span>
                  ) : (
                    <span className="text-emerald-500">{current.bu - previous.bu}</span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-bold text-slate-900 dark:text-white">Hemoglobin</td>
                <td className="px-3 py-2 font-mono">{previous.hemo} g/dL</td>
                <td className="px-3 py-2 font-mono font-bold">{current.hemo} g/dL</td>
                <td className="px-3 py-2 text-right font-mono font-bold">
                  {current.hemo < previous.hemo ? (
                    <span className="text-rose-500">{(current.hemo - previous.hemo).toFixed(1)}</span>
                  ) : (
                    <span className="text-emerald-500">+{(current.hemo - previous.hemo).toFixed(1)}</span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
