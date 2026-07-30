import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Bell, ShieldAlert, Eye, Brain, FileCheck } from 'lucide-react';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'consent' | 'doctor' | 'ai' | 'report';
  badgeVariant?: 'warning' | 'info' | 'success' | 'primary';
}

const defaultNotifications: NotificationItem[] = [
  {
    id: 'n1',
    title: 'Consent Expires Tomorrow',
    message: 'Cardiology data access for Dr. Sarah Jenkins is scheduled to expire on Jul 31, 2026.',
    time: '1 hour ago',
    type: 'consent',
    badgeVariant: 'warning',
  },
  {
    id: 'n2',
    title: 'Doctor Viewed Your Records',
    message: 'Dr. Sarah Jenkins accessed your Lipid Panel and Comprehensive Metabolic Report.',
    time: '3 hours ago',
    type: 'doctor',
    badgeVariant: 'info',
  },
  {
    id: 'n3',
    title: 'AI Prediction Completed',
    message: 'Your latest CKD Risk Model evaluation finished with 94.5% confidence.',
    time: '5 hours ago',
    type: 'ai',
    badgeVariant: 'success',
  },
  {
    id: 'n4',
    title: 'New Report Uploaded',
    message: 'Annual Electrocardiogram (ECG) Report was encrypted and appended to your EHR.',
    time: '1 day ago',
    type: 'report',
    badgeVariant: 'primary',
  },
];

export const PatientNotificationWidget: React.FC<{ items?: NotificationItem[] }> = ({
  items = defaultNotifications,
}) => {
  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'consent':
        return <ShieldAlert className="w-4 h-4 text-amber-500" />;
      case 'doctor':
        return <Eye className="w-4 h-4 text-sky-500" />;
      case 'ai':
        return <Brain className="w-4 h-4 text-emerald-500" />;
      case 'report':
        return <FileCheck className="w-4 h-4 text-indigo-500" />;
    }
  };

  return (
    <Card className="border-slate-200/80 dark:border-slate-800">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-base font-bold">Notifications & Alerts</CardTitle>
          <CardDescription className="text-xs">
            Recent security, consent, and clinical updates.
          </CardDescription>
        </div>
        <div className="p-2 bg-amber-50 dark:bg-amber-950/60 text-amber-600 rounded-xl">
          <Bell className="w-5 h-5" />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {items.map((n) => (
          <div
            key={n.id}
            className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-start gap-3 hover:bg-white dark:hover:bg-slate-800 transition-all"
          >
            <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shrink-0 mt-0.5">
              {getIcon(n.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{n.title}</h4>
                <span className="text-[10px] text-slate-400 font-mono shrink-0">{n.time}</span>
              </div>
              <p className="text-2xs text-slate-500 dark:text-slate-400 leading-normal">{n.message}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
