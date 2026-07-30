import { NavGroup, UserRole } from './types';
import { PATIENT_NAV_GROUPS } from './patientNavigation';
import { DOCTOR_NAV_GROUPS } from './doctorNavigation';
import { RESEARCHER_NAV_GROUPS } from './researcherNavigation';
import { ADMIN_NAV_GROUPS } from './adminNavigation';

export * from './types';
export { PATIENT_NAV_GROUPS } from './patientNavigation';
export { DOCTOR_NAV_GROUPS } from './doctorNavigation';
export { RESEARCHER_NAV_GROUPS } from './researcherNavigation';
export { ADMIN_NAV_GROUPS } from './adminNavigation';

export const ROLE_NAVIGATION_MAP: Record<string, NavGroup[]> = {
  PATIENT: PATIENT_NAV_GROUPS,
  DOCTOR: DOCTOR_NAV_GROUPS,
  RESEARCHER: RESEARCHER_NAV_GROUPS,
  ADMIN: ADMIN_NAV_GROUPS,
};

export const getNavConfigForRole = (role?: string): NavGroup[] => {
  if (!role) return PATIENT_NAV_GROUPS;
  const normalized = role.toUpperCase();
  return ROLE_NAVIGATION_MAP[normalized] || PATIENT_NAV_GROUPS;
};
