import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Activity, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { NavItem } from './navigationConfig';
import { Badge } from '../ui/badge';
import { useNavigation } from '../../context/NavigationContext';
import { useAuth } from '../../context/AuthContext';

export interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  items?: NavItem[];
  role?: string;
  activePath?: string;
  className?: string;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
  simulatedRole?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed: externalIsCollapsed,
  onToggleCollapse: externalOnToggleCollapse,
  items: customItems,
  role: propRole,
  activePath,
  className,
  isMobileOpen = false,
  onMobileClose,
  simulatedRole,
}) => {
  const [internalIsCollapsed, setInternalIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { navGroups: contextNavGroups, currentRole: contextRole, getNavForRole } = useNavigation();

  const isCollapsed = externalIsCollapsed !== undefined ? externalIsCollapsed : internalIsCollapsed;
  const toggleCollapse = externalOnToggleCollapse || (() => setInternalIsCollapsed((prev) => !prev));

  const effectiveRole = propRole || simulatedRole || contextRole || 'PATIENT';
  
  const navGroups = customItems
    ? [{ groupTitle: 'Navigation', items: customItems }]
    : (propRole || simulatedRole)
    ? getNavForRole(effectiveRole)
    : contextNavGroups;

  const currentPath = activePath || location.pathname;

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onMobileClose) onMobileClose();
    logout();
    navigate('/login');
  };

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300">
      {/* Brand Header */}
      <div>
        <div
          className={cn(
            'h-16 px-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800',
            isCollapsed && 'justify-center px-2'
          )}
        >
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-primary-500/20 shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <div>
                <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white font-sans">
                  Health<span className="text-primary-600 dark:text-primary-400">Share</span>
                </span>
                <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-semibold tracking-wider uppercase">
                  {effectiveRole} WORKSPACE
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Collapse / Expand Toggle Button */}
          <button
            onClick={toggleCollapse}
            className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Mobile Close Button */}
          {onMobileClose && (
            <button
              onClick={onMobileClose}
              className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="p-3 space-y-6 overflow-y-auto max-h-[calc(100vh-8rem)]">
          {navGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1">
              {!isCollapsed && group.groupTitle && (
                <h4 className="px-3 text-2xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                  {group.groupTitle}
                </h4>
              )}

              {group.items.map((item) => {
                const isActive =
                  currentPath === item.path ||
                  (item.path !== '/' && item.path !== '/dashboard' && currentPath.startsWith(item.path));
                const Icon = item.icon;

                if (item.isLogout || item.path === '/logout') {
                  return (
                    <button
                      key={item.label}
                      onClick={handleLogout}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs transition-all duration-200 group relative w-full text-left',
                        'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-semibold',
                        isCollapsed && 'justify-center px-0'
                      )}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <Icon
                        className={cn(
                          'w-4.5 h-4.5 shrink-0 transition-transform group-hover:scale-110 text-rose-500 dark:text-rose-400'
                        )}
                      />
                      {!isCollapsed && <span className="flex-1 truncate">{item.label}</span>}
                    </button>
                  );
                }

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onMobileClose}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs transition-all duration-200 group relative',
                      isActive
                        ? 'bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 font-bold shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100',
                      isCollapsed && 'justify-center px-0'
                    )}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon
                      className={cn(
                        'w-4.5 h-4.5 shrink-0 transition-transform group-hover:scale-110',
                        isActive ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 dark:text-slate-500'
                      )}
                    />
                    {!isCollapsed && <span className="flex-1 truncate">{item.label}</span>}
                    {!isCollapsed && item.badge && (
                      <Badge variant={item.badgeVariant || 'secondary'} size="sm">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Sidebar Footer */}
      {!isCollapsed && (
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-[10px] text-slate-400 flex items-center justify-between">
          <span>HealthShare v1.0</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500" title="System Operational" />
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Fixed Desktop Sidebar (Hidden on mobile) */}
      <aside
        className={cn(
          'hidden md:flex flex-col fixed top-0 left-0 bottom-0 z-30 transition-all duration-300 ease-in-out',
          isCollapsed ? 'w-18' : 'w-64',
          className
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Hidden on mobile by default) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in"
            onClick={onMobileClose}
          />
          <div className="relative w-64 bg-white dark:bg-slate-900 h-full shadow-2xl animate-slide-up z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
