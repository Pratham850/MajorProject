import React from 'react';
import { StatCard } from '../common/StatCard';
import { Calendar, Clock, CheckCircle2, CheckSquare } from 'lucide-react';

export interface DoctorAppointmentSummaryProps {
  todaysCount?: number;
  pendingCount?: number;
  confirmedCount?: number;
  completedCount?: number;
}

export const AppointmentSummaryCard: React.FC<DoctorAppointmentSummaryProps> = ({
  todaysCount = 4,
  pendingCount = 3,
  confirmedCount = 8,
  completedCount = 14,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Today's Appointments"
        value={`${todaysCount} Scheduled`}
        change="2 Telehealth"
        trend="up"
        subtext="Active today"
        icon={<Calendar className="w-5 h-5" />}
      />

      <StatCard
        title="Pending Requests"
        value={`${pendingCount} Pending`}
        change="Requires Action"
        trend="neutral"
        subtext="Awaiting your approval"
        icon={<Clock className="w-5 h-5" />}
        iconBg="bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
      />

      <StatCard
        title="Confirmed Appointments"
        value={`${confirmedCount} Confirmed`}
        change="Upcoming this week"
        trend="up"
        subtext="Patient slots booked"
        icon={<CheckCircle2 className="w-5 h-5" />}
        iconBg="bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300"
      />

      <StatCard
        title="Completed Consultations"
        value={`${completedCount} Completed`}
        change="+6 this month"
        trend="up"
        subtext="Finished consultations"
        icon={<CheckSquare className="w-5 h-5" />}
        iconBg="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
      />
    </div>
  );
};
