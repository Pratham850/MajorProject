import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { ShellPlaceholder } from './ShellPlaceholder';
import { cn } from '../../lib/utils';

export interface AppLayoutProps {
  children?: React.ReactNode;
  className?: string;
  simulatedRole?: string;
  onSimulateRoleChange?: (role: string) => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  className,
  simulatedRole,
  onSimulateRoleChange,
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div
      className={cn(
        'min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased transition-colors duration-200',
        className
      )}
    >
      {/* Fixed Desktop Sidebar & Mobile Slide-over Drawer */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
        simulatedRole={simulatedRole}
      />

      {/* Main Content Column Offset by Sidebar width on Desktop */}
      <div
        className={cn(
          'flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out',
          isSidebarCollapsed ? 'md:ml-18' : 'md:ml-64'
        )}
      >
        {/* Top Navbar */}
        <TopNav
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebarCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          simulatedRole={simulatedRole}
          onSimulateRoleChange={onSimulateRoleChange}
        />

        {/* Main Content Landmark (Scrolls independently) */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto animate-fade-in">
          {children || <ShellPlaceholder />}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
