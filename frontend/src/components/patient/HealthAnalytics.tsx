import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Activity, Heart, Droplet, Scale, Brain } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

const bloodPressureData = [
  { date: 'Jan', systolic: 128, diastolic: 82 },
  { date: 'Feb', systolic: 125, diastolic: 80 },
  { date: 'Mar', systolic: 122, diastolic: 78 },
  { date: 'Apr', systolic: 120, diastolic: 76 },
  { date: 'May', systolic: 118, diastolic: 75 },
  { date: 'Jun', systolic: 121, diastolic: 77 },
  { date: 'Jul', systolic: 119, diastolic: 76 },
];

const bloodSugarData = [
  { date: 'Jan', glucose: 104 },
  { date: 'Feb', glucose: 99 },
  { date: 'Mar', glucose: 95 },
  { date: 'Apr', glucose: 98 },
  { date: 'May', glucose: 92 },
  { date: 'Jun', glucose: 94 },
  { date: 'Jul', glucose: 91 },
];

const creatinineData = [
  { date: 'Jan', level: 1.1 },
  { date: 'Feb', level: 1.0 },
  { date: 'Mar', level: 0.95 },
  { date: 'Apr', level: 0.92 },
  { date: 'May', level: 0.9 },
  { date: 'Jun', level: 0.88 },
  { date: 'Jul', level: 0.89 },
];

const weightData = [
  { date: 'Jan', weight: 74.2 },
  { date: 'Feb', weight: 73.8 },
  { date: 'Mar', weight: 73.0 },
  { date: 'Apr', weight: 72.5 },
  { date: 'May', weight: 72.1 },
  { date: 'Jun', weight: 71.8 },
  { date: 'Jul', weight: 71.5 },
];

const ckdRiskData = [
  { date: 'Jan', risk: 14.5 },
  { date: 'Feb', risk: 12.8 },
  { date: 'Mar', risk: 11.2 },
  { date: 'Apr', risk: 9.8 },
  { date: 'May', risk: 8.9 },
  { date: 'Jun', risk: 8.4 },
  { date: 'Jul', risk: 8.2 },
];

export const HealthAnalytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'bp' | 'sugar' | 'creatinine' | 'weight' | 'ckd'>('bp');

  return (
    <Card className="border-slate-200/80 dark:border-slate-800">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-bold">Health Analytics & Trends</CardTitle>
            <Badge variant="primary" size="sm">Real-time Biometrics</Badge>
          </div>
          <CardDescription className="text-xs">
            Historical diagnostic measurements and AI risk trajectory.
          </CardDescription>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs">
          <Button
            variant={activeTab === 'bp' ? 'primary' : 'ghost'}
            size="xs"
            onClick={() => setActiveTab('bp')}
            leftIcon={<Heart className="w-3.5 h-3.5 text-rose-500" />}
          >
            Blood Pressure
          </Button>
          <Button
            variant={activeTab === 'sugar' ? 'primary' : 'ghost'}
            size="xs"
            onClick={() => setActiveTab('sugar')}
            leftIcon={<Droplet className="w-3.5 h-3.5 text-amber-500" />}
          >
            Blood Sugar
          </Button>
          <Button
            variant={activeTab === 'creatinine' ? 'primary' : 'ghost'}
            size="xs"
            onClick={() => setActiveTab('creatinine')}
            leftIcon={<Activity className="w-3.5 h-3.5 text-emerald-500" />}
          >
            Creatinine
          </Button>
          <Button
            variant={activeTab === 'weight' ? 'primary' : 'ghost'}
            size="xs"
            onClick={() => setActiveTab('weight')}
            leftIcon={<Scale className="w-3.5 h-3.5 text-sky-500" />}
          >
            Weight
          </Button>
          <Button
            variant={activeTab === 'ckd' ? 'primary' : 'ghost'}
            size="xs"
            onClick={() => setActiveTab('ckd')}
            leftIcon={<Brain className="w-3.5 h-3.5 text-indigo-500" />}
          >
            AI CKD Risk
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            {activeTab === 'bp' ? (
              <AreaChart data={bloodPressureData}>
                <defs>
                  <linearGradient id="sysColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="date" tickLine={false} style={{ fontSize: 11 }} />
                <YAxis domain={[60, 150]} tickLine={false} style={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="systolic" name="Systolic (mmHg)" stroke="#3b82f6" fillOpacity={1} fill="url(#sysColor)" strokeWidth={2} />
                <Area type="monotone" dataKey="diastolic" name="Diastolic (mmHg)" stroke="#10b981" fillOpacity={0} strokeWidth={2} />
              </AreaChart>
            ) : activeTab === 'sugar' ? (
              <AreaChart data={bloodSugarData}>
                <defs>
                  <linearGradient id="sugarColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="date" tickLine={false} style={{ fontSize: 11 }} />
                <YAxis domain={[70, 130]} tickLine={false} style={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="glucose" name="Fasting Glucose (mg/dL)" stroke="#f59e0b" fillOpacity={1} fill="url(#sugarColor)" strokeWidth={2} />
              </AreaChart>
            ) : activeTab === 'creatinine' ? (
              <AreaChart data={creatinineData}>
                <defs>
                  <linearGradient id="creatColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="date" tickLine={false} style={{ fontSize: 11 }} />
                <YAxis domain={[0.5, 1.5]} tickLine={false} style={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="level" name="Serum Creatinine (mg/dL)" stroke="#10b981" fillOpacity={1} fill="url(#creatColor)" strokeWidth={2} />
              </AreaChart>
            ) : activeTab === 'weight' ? (
              <AreaChart data={weightData}>
                <defs>
                  <linearGradient id="weightColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="date" tickLine={false} style={{ fontSize: 11 }} />
                <YAxis domain={[65, 80]} tickLine={false} style={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="weight" name="Body Weight (kg)" stroke="#0284c7" fillOpacity={1} fill="url(#weightColor)" strokeWidth={2} />
              </AreaChart>
            ) : (
              <AreaChart data={ckdRiskData}>
                <defs>
                  <linearGradient id="ckdColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="date" tickLine={false} style={{ fontSize: 11 }} />
                <YAxis domain={[0, 25]} tickLine={false} style={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="risk" name="AI CKD Probability (%)" stroke="#6366f1" fillOpacity={1} fill="url(#ckdColor)" strokeWidth={2} />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
