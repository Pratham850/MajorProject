export * from '../../config/navigation';
import { PATIENT_NAV_GROUPS, ROLE_NAVIGATION_MAP, getNavConfigForRole } from '../../config/navigation';

export const DEFAULT_NAV_ITEMS = PATIENT_NAV_GROUPS[0].items;
export const ROLE_NAVIGATION = ROLE_NAVIGATION_MAP;
export { getNavConfigForRole };
