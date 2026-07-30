import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  FolderCheck,
  Activity,
  ClipboardList,
  Settings,
  User,
  LogOut,
} from 'lucide-react';
import { NavGroup } from './types';

export const ADMIN_NAV_GROUPS: NavGroup[] = [
  {
    groupTitle: 'System Admin',
    items: [
      {
        label: 'Dashboard',
        path: '/admin-dashboard',
        icon: LayoutDashboard,
      },
      {
        label: 'User Management',
        path: '/admin/users',
        icon: Users,
      },
      {
        label: 'Consent & Access Management',
        path: '/admin/consents',
        icon: ShieldCheck,
      },
      {
        label: 'Research Approvals',
        path: '/admin/research',
        icon: FolderCheck,
        badge: '2 Pending',
        badgeVariant: 'warning',
      },
      {
        label: 'System Monitoring',
        path: '/admin/system',
        icon: Activity,
        badge: 'Healthy',
        badgeVariant: 'success',
      },
      {
        label: 'Audit Logs',
        path: '/audit-logs',
        icon: ClipboardList,
      },
      {
        label: 'Platform Settings',
        path: '/admin/settings',
        icon: Settings,
      },
      {
        label: 'Profile',
        path: '/profile',
        icon: User,
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
