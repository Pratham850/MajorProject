import React, { createContext, useContext } from 'react';
import { useAuth } from './AuthContext';
import { NavGroup, getNavConfigForRole } from '../config/navigation';

export interface NavigationContextType {
  navGroups: NavGroup[];
  currentRole: string;
  getNavForRole: (role?: string) => NavGroup[];
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export interface NavigationProviderProps {
  children: React.ReactNode;
  simulatedRole?: string;
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({
  children,
  simulatedRole,
}) => {
  const { user } = useAuth();
  const activeRole = simulatedRole || user?.role || 'PATIENT';
  const navGroups = getNavConfigForRole(activeRole);

  return (
    <NavigationContext.Provider
      value={{
        navGroups,
        currentRole: activeRole,
        getNavForRole: getNavConfigForRole,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = (): NavigationContextType => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    // Graceful fallback if used outside NavigationProvider
    return {
      navGroups: getNavConfigForRole('PATIENT'),
      currentRole: 'PATIENT',
      getNavForRole: getNavConfigForRole,
    };
  }
  return context;
};
