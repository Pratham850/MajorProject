import {
  LayoutDashboard,
  CalendarCheck,
  Users,
  FileText,
  Brain,
  ShieldCheck,
  Bell,
  User,
  Settings,
  LogOut,
} from 'lucide-react';
import { NavGroup } from './types';

export const DOCTOR_NAV_GROUPS: NavGroup[] = [
  {
    groupTitle: 'Clinical Workspace',
    items: [
      {
        label: 'Dashboard',
        path: '/doctor-dashboard',
        icon: LayoutDashboard,
      },
      {
        label: 'Appointments',
        path: '/doctor/appointments',
        icon: CalendarCheck,
        badge: '3 New',
        badgeVariant: 'warning',
      },
      {
        label: 'Authorized Patients',
        path: '/patients',
        icon: Users,
        badge: '12 Active',
        badgeVariant: 'info',
      },
      {
        label: 'Patient Records',
        path: '/doctor/records',
        icon: FileText,
      },
      {
        label: 'AI Prediction Review',
        path: '/doctor/ai-review',
        icon: Brain,
        badge: 'Pending',
        badgeVariant: 'warning',
      },
      {
        label: 'Consent Status',
        path: '/consent',
        icon: ShieldCheck,
      },
      {
        label: 'Notifications',
        path: '/notifications',
        icon: Bell,
      },
      {
        label: 'Profile',
        path: '/profile',
        icon: User,
      },
      {
        label: 'Settings',
        path: '/settings',
        icon: Settings,
      },
      {
        label: 'Logout',
        path: '/login',
        icon: LogOut,
        isLogout: true,
      },
    ],
  },
];
