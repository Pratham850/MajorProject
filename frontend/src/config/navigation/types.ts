import React from 'react';

export type UserRole =
  | 'PATIENT'
  | 'DOCTOR'
  | 'RESEARCHER'
  | 'ADMIN'
  | 'patient'
  | 'doctor'
  | 'researcher'
  | 'admin';

export interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeVariant?: 'primary' | 'success' | 'warning' | 'info' | 'danger' | 'secondary';
  isLogout?: boolean;
}

export interface NavGroup {
  groupTitle?: string;
  items: NavItem[];
}
