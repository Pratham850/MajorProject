import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { Breadcrumbs } from './Breadcrumbs';
import { LayoutPlaceholder } from './LayoutPlaceholder';
import { cn } from '../../lib/utils';
import { NavigationProvider } from '../../context/NavigationContext';

export interface LayoutProps {
  children?: React.ReactNode;
  simulatedRole?: string;
  onSimulateRoleChange?: (role: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  simulatedRole: externalRole,
  onSimulateRoleChange: externalRoleChange,
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [internalRole, setInternalRole] = useState<string>('PATIENT');

  const simulatedRole = externalRole || internalRole;
  const setSimulatedRole = externalRoleChange || setInternalRole;

  return (
    <NavigationProvider simulatedRole={simulatedRole}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
        {/* Collapsible Desktop Sidebar & Mobile Slide-over Drawer */}
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={() => setIsMobileSidebarOpen(false)}
          simulatedRole={simulatedRole}
        />

        {/* Main Content Column */}
        <div
          className={cn(
            'flex-1 flex flex-col transition-all duration-300 ease-in-out',
            isSidebarCollapsed ? 'md:ml-18' : 'md:ml-64'
          )}
        >
          {/* Top Navigation Bar */}
          <TopNav
            isSidebarCollapsed={isSidebarCollapsed}
            onToggleSidebarCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
            simulatedRole={simulatedRole}
            onSimulateRoleChange={setSimulatedRole}
          />

          {/* Dynamic Breadcrumbs Navigation Bar */}
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xs border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-6 py-2.5">
            <Breadcrumbs />
          </div>

          {/* Main Content Area Landmark */}
          <main id="main-content" className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in">
            {children || <LayoutPlaceholder />}
          </main>
        </div>
      </div>
    </NavigationProvider>
  );
};

export const AppShell = Layout;
