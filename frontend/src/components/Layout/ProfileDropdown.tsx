import React, { useState, useRef, useEffect } from 'react';
import { User, Settings, LogOut, ChevronDown, Shield } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Badge } from '../ui/badge';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../ui/toast';

export const ProfileDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const userRole = (user?.role || 'PATIENT').toUpperCase();
  const userName = user?.name || 'Dr. Sarah Jenkins';
  const userEmail = user?.email || 'sarah.jenkins@healthshare.org';

  const roleBadges: Record<string, { variant: any; label: string }> = {
    PATIENT: { variant: 'success', label: 'PATIENT' },
    DOCTOR: { variant: 'primary', label: 'DOCTOR' },
    RESEARCHER: { variant: 'info', label: 'RESEARCHER' },
    ADMIN: { variant: 'danger', label: 'ADMINISTRATOR' },
  };

  const badgeInfo = roleBadges[userRole] || roleBadges.PATIENT;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = () => {
    logout();
    toast.info('Secure session terminated successfully.', 'Logged Out');
    navigate('/login');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 select-none"
      >
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-subtle shrink-0">
          {userName.charAt(0).toUpperCase()}
        </div>
        <div className="text-left hidden md:block">
          <div className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">{userName}</div>
          <div className="text-2xs text-slate-400 dark:text-slate-500 font-medium">{userRole}</div>
        </div>
        <ChevronDown className="w-4 h-4 text-slate-400 hidden md:block shrink-0" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-dialog z-50 animate-scale-in overflow-hidden p-2">
          {/* User Details Header */}
          <div className="p-3 border-b border-slate-100 dark:border-slate-800">
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{userName}</p>
            <p className="text-2xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{userEmail}</p>
            <div className="mt-2">
              <Badge variant={badgeInfo.variant} size="sm" dot>
                {badgeInfo.label}
              </Badge>
            </div>
          </div>

          {/* Links */}
          <div className="py-2 space-y-1">
            <Link
              to="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <User className="w-4 h-4 text-slate-400" />
              <span>Profile Settings</span>
            </Link>

            <Link
              to="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Shield className="w-4 h-4 text-slate-400" />
              <span>Security & Passwords</span>
            </Link>
          </div>

          {/* Sign Out Button */}
          <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
