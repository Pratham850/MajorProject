import React from 'react';
import { StatCard } from '../common/StatCard';
import { FileText, ShieldCheck, Brain, Calendar, Pill, Bell } from 'lucide-react';

export interface MedicalStatisticsProps {
  recordsCount?: number;
  activeConsentsCount?: number;
  latestPrediction?: string;
  nextAppointment?: string;
  medicationsTaken?: number;
  totalMedications?: number;
  notificationsCount?: number;
}

export const MedicalStatisticsCard: React.FC<MedicalStatisticsProps> = ({
  recordsCount = 5,
  activeConsentsCount = 3,
  latestPrediction = 'Low Risk (8.2%)',
  nextAppointment = 'Tomorrow 10:30 AM',
  medicationsTaken = 1,
  totalMedications = 3,
  notificationsCount = 3,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {/* 1. Medical Records */}
      <StatCard
        title="Medical Records"
        value={recordsCount}
        change="+2 this month"
        trend="up"
        subtext="AES-256 Secured"
        icon={<FileText className="w-5 h-5" />}
      />

      {/* 2. Active Consents */}
      <StatCard
        title="Active Consents"
        value={activeConsentsCount}
        change="1 Pending"
        trend="neutral"
        subtext="Doctor access permissions"
        icon={<ShieldCheck className="w-5 h-5" />}
        iconBg="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
      />

      {/* 3. Latest CKD Prediction */}
      <StatCard
        title="Latest CKD Risk"
        value={latestPrediction}
        change="94.5% confidence"
        trend="down"
        subtext="Low Risk Assessment"
        icon={<Brain className="w-5 h-5" />}
        iconBg="bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
      />

      {/* 4. Upcoming Appointment */}
      <StatCard
        title="Upcoming Appointment"
        value="Tomorrow"
        subtext={nextAppointment}
        icon={<Calendar className="w-5 h-5" />}
        iconBg="bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300"
      />

      {/* 5. Active Medications */}
      <StatCard
        title="Active Medications"
        value={`${medicationsTaken} / ${totalMedications}`}
        subtext="doses taken today"
        icon={<Pill className="w-5 h-5" />}
        iconBg="bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
      />

      {/* 6. Pending Notifications */}
      <StatCard
        title="Notifications"
        value={`${notificationsCount} New`}
        subtext="Unread system alerts"
        icon={<Bell className="w-5 h-5" />}
        iconBg="bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
      />
    </div>
  );
};
