import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Bell, CalendarPlus, CalendarX, FileCheck, CalendarClock } from 'lucide-react';

export interface DoctorNotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'new_request' | 'cancelled' | 'records_shared' | 'rescheduled';
}

const defaultNotifications: DoctorNotificationItem[] = [
  {
    id: 'dn-1',
    title: 'New Appointment Request',
    message: 'Sarah Jenkins requested a Cardiology consultation for tomorrow at 10:30 AM.',
    time: '20 mins ago',
    type: 'new_request',
  },
  {
    id: 'dn-2',
    title: 'Patient Shared Medical Records',
    message: 'Jane Doe granted access to Comprehensive Metabolic Panel and EHR trends.',
    time: '1 hour ago',
    type: 'records_shared',
  },
  {
    id: 'dn-3',
    title: 'Appointment Rescheduled',
    message: 'Robert Taylor rescheduled Renal Health consultation to Aug 04 at 02:00 PM.',
    time: '3 hours ago',
    type: 'rescheduled',
  },
  {
    id: 'dn-4',
    title: 'Patient Cancelled Appointment',
    message: 'Michael Vance cancelled routine follow-up consultation.',
    time: '1 day ago',
    type: 'cancelled',
  },
];

export const DoctorNotificationWidget: React.FC<{ items?: DoctorNotificationItem[] }> = ({
  items = defaultNotifications,
}) => {
  const getIcon = (type: DoctorNotificationItem['type']) => {
    switch (type) {
      case 'new_request':
        return <CalendarPlus className="w-4 h-4 text-amber-500" />;
      case 'cancelled':
        return <CalendarX className="w-4 h-4 text-rose-500" />;
      case 'records_shared':
        return <FileCheck className="w-4 h-4 text-emerald-500" />;
      case 'rescheduled':
        return <CalendarClock className="w-4 h-4 text-sky-500" />;
    }
  };

  const getBadge = (type: DoctorNotificationItem['type']) => {
    switch (type) {
      case 'new_request':
        return <Badge variant="warning" size="sm">New Request</Badge>;
      case 'cancelled':
        return <Badge variant="danger" size="sm">Cancelled</Badge>;
      case 'records_shared':
        return <Badge variant="success" size="sm">Consent Shared</Badge>;
      case 'rescheduled':
        return <Badge variant="info" size="sm">Rescheduled</Badge>;
    }
  };

  return (
    <Card className="border-slate-200/80 dark:border-slate-800">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-base font-bold">Clinical Notifications</CardTitle>
          <CardDescription className="text-xs">
            Alerts for patient bookings, record permissions, and schedule changes.
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
                <div className="flex items-center gap-2 shrink-0">
                  {getBadge(n.type)}
                  <span className="text-[10px] text-slate-400 font-mono">{n.time}</span>
                </div>
              </div>
              <p className="text-2xs text-slate-500 dark:text-slate-400 leading-normal">{n.message}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
