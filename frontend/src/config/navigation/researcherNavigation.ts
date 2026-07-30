import {
  LayoutDashboard,
  Database,
  FolderKanban,
  CheckSquare,
  BarChart3,
  FileSpreadsheet,
  User,
  Settings,
  LogOut,
} from 'lucide-react';
import { NavGroup } from './types';

export const RESEARCHER_NAV_GROUPS: NavGroup[] = [
  {
    groupTitle: 'Research Workspace',
    items: [
      {
        label: 'Dashboard',
        path: '/researcher-dashboard',
        icon: LayoutDashboard,
      },
      {
        label: 'Dataset Browser',
        path: '/datasets',
        icon: Database,
        badge: 'De-identified',
        badgeVariant: 'success',
      },
      {
        label: 'My Research Requests',
        path: '/studies',
        icon: FolderKanban,
      },
      {
        label: 'Approved Datasets',
        path: '/approved-datasets',
        icon: CheckSquare,
      },
      {
        label: 'Analytics',
        path: '/analytics',
        icon: BarChart3,
        badge: 'Real-time',
        badgeVariant: 'primary',
      },
      {
        label: 'Reports & Exports',
        path: '/reports',
        icon: FileSpreadsheet,
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
