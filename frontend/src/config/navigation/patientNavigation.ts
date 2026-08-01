import {
  LayoutDashboard,
  User,
  FileText,
  Brain,
  ShieldCheck,
  Bell,
  Settings,
  LogOut,
} from 'lucide-react';
import { NavGroup } from './types';

export const PATIENT_NAV_GROUPS: NavGroup[] = [
  {
    groupTitle: 'Patient Navigation',
    items: [
      {
        label: 'Dashboard',
        path: '/patient-dashboard',
        icon: LayoutDashboard,
      },
      {
        label: 'My Profile',
        path: '/profile',
        icon: User,
      },
      {
        label: 'My Medical Records',
        path: '/records',
        icon: FileText,
        badge: 'HIPAA Secured',
        badgeVariant: 'success',
      },
      {
        label: 'AI CKD Prediction',
        path: '/ai-prediction',
        icon: Brain,
        badge: 'ML Model',
        badgeVariant: 'primary',
      },
      {
        label: 'Consent Management',
        path: '/consent',
        icon: ShieldCheck,
      },
      {
        label: 'Notifications',
        path: '/notifications',
        icon: Bell,
        badge: '3 New',
        badgeVariant: 'info',
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
