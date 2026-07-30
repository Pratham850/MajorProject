import React, { useState } from 'react';
import { Menu, Search, Sun, Moon, Bell, ChevronRight, ChevronDown, User, Settings, LogOut, Shield } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Badge } from '../ui/badge';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export interface TopNavProps {
  onOpenMobileSidebar?: () => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebarCollapse?: () => void;
  breadcrumb?: string;
  userName?: string;
  userRole?: string;
  userAvatar?: string;
  onThemeToggle?: () => void;
  className?: string;
  simulatedRole?: string;
  onSimulateRoleChange?: (role: string) => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  onOpenMobileSidebar,
  breadcrumb = 'Dashboard',
  userName: propUserName,
  userRole: propUserRole,
  userAvatar,
  onThemeToggle,
  className,
  simulatedRole,
  onSimulateRoleChange,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return document.documentElement.classList.contains('dark');
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const userName = propUserName || user?.name || 'Sarah Jenkins';
  const displayRole = simulatedRole || propUserRole || user?.role || 'PATIENT';
  const isPatient = displayRole.toUpperCase() === 'PATIENT';

  const handleThemeToggle = () => {
    if (onThemeToggle) {
      onThemeToggle();
    } else {
      const newMode = !darkMode;
      setDarkMode(newMode);
      if (newMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header
      className={cn(
        'h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 transition-colors duration-200',
        className
      )}
    >
      {/* 1. Left Section: Mobile Menu Button & Breadcrumb */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onOpenMobileSidebar}
          className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          aria-label="Open mobile navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <nav aria-label="Breadcrumb" className="flex items-center text-xs font-medium text-slate-500 dark:text-slate-400">
          <span className="text-slate-400 dark:text-slate-500 hidden sm:inline">HealthShare</span>
          <ChevronRight className="w-3.5 h-3.5 mx-1 text-slate-300 dark:text-slate-600 hidden sm:inline" />
          <span className="font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {breadcrumb}
          </span>
        </nav>
      </div>

      {/* 2. Center Section: Search Bar */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search health records, predictions, consents..."
            className="w-full bg-slate-100 dark:bg-slate-800/70 text-slate-900 dark:text-slate-100 text-xs rounded-xl pl-9 pr-12 py-2 border border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all placeholder:text-slate-400"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 bg-white dark:bg-slate-700 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600 shadow-2xs">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* 3. Right Section: Role Badge, Theme Toggle, Profile */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* Patient Workspace Badge (or Dev Role Switcher for non-patients) */}
        {isPatient ? (
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 border border-primary-200/60 dark:border-primary-800 text-2xs font-bold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Patient Workspace</span>
          </div>
        ) : (
          onSimulateRoleChange && (
            <div className="hidden lg:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
              <span className="text-2xs font-bold text-slate-400 uppercase px-2">Role:</span>
              {['PATIENT', 'DOCTOR', 'RESEARCHER', 'ADMIN'].map((role) => (
                <button
                  key={role}
                  onClick={() => onSimulateRoleChange(role)}
                  className={cn(
                    'px-2 py-0.5 rounded-lg text-2xs font-bold transition-all',
                    displayRole.toUpperCase() === role
                      ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  )}
                >
                  {role}
                </button>
              ))}
            </div>
          )
        )}

        {/* Theme Toggle */}
        <button
          onClick={handleThemeToggle}
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle theme"
        >
          {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-3 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-4 animate-scale-in">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Notifications</h4>
                <Badge variant="danger" size="sm">3 New</Badge>
              </div>
              <div className="py-3 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                  <p className="font-semibold text-slate-900 dark:text-white">Consent Expiration</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Cardiology access expires tomorrow.</p>
                </div>
                <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                  <p className="font-semibold text-slate-900 dark:text-white">Record Viewed</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Dr. Sarah Jenkins accessed Lipid Panel.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Vertical Divider */}
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {userAvatar ? (
              <img src={userAvatar} alt={userName} className="w-8 h-8 rounded-full object-cover shrink-0" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="text-left hidden md:block">
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">{userName}</p>
              <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                {displayRole}
              </p>
            </div>

            <ChevronDown className="w-4 h-4 text-slate-400 hidden md:block shrink-0" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-2 animate-scale-in">
              <div className="p-2.5 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-900 dark:text-white">{userName}</p>
                <p className="text-[10px] text-slate-400 uppercase font-semibold mt-0.5">{displayRole} ACCOUNT</p>
              </div>
              <div className="py-1 space-y-0.5 text-xs">
                <button
                  onClick={() => { setIsProfileOpen(false); navigate('/profile'); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-medium"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Profile Settings</span>
                </button>
                <button
                  onClick={() => { setIsProfileOpen(false); navigate('/settings'); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-medium"
                >
                  <Shield className="w-4 h-4 text-slate-400" />
                  <span>Security</span>
                </button>
                <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg font-semibold"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopNav;
