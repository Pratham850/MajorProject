import React from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Mail, Shield, Building, Calendar, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ProfileCardProps {
  name: string;
  email: string;
  role: 'PATIENT' | 'DOCTOR' | 'RESEARCHER' | 'ADMIN';
  organization?: string;
  joinedDate?: string;
  isVerified?: boolean;
  stats?: { label: string; value: string | number }[];
  onEditProfile?: () => void;
  className?: string;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  name,
  email,
  role,
  organization = 'HealthShare Network Provider',
  joinedDate = 'Jan 2026',
  isVerified = true,
  stats,
  onEditProfile,
  className,
}) => {
  const roleBadges: Record<string, { variant: any; label: string }> = {
    PATIENT: { variant: 'success', label: 'PATIENT CLEARANCE' },
    DOCTOR: { variant: 'primary', label: 'DOCTOR LICENSED' },
    RESEARCHER: { variant: 'info', label: 'RESEARCHER ACCREDITED' },
    ADMIN: { variant: 'danger', label: 'SYSTEM ADMINISTRATOR' },
  };

  const badgeInfo = roleBadges[role] || roleBadges.PATIENT;

  return (
    <Card className={cn('p-6 overflow-hidden relative', className)}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary-700 to-indigo-600 text-white font-extrabold text-xl flex items-center justify-center shadow-teal-glow shrink-0">
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100">{name}</h3>
              {isVerified && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
              <span className="inline-flex items-center gap-1">
                <Mail className="w-3 h-3 text-slate-400" /> {email}
              </span>
              <span className="inline-flex items-center gap-1">
                <Building className="w-3 h-3 text-slate-400" /> {organization}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={badgeInfo.variant} size="md" dot>
            {badgeInfo.label}
          </Badge>
        </div>
      </div>

      {/* Stats Bar */}
      {stats && stats.length > 0 && (
        <div className="py-4 grid grid-cols-2 sm:grid-cols-3 gap-4 border-b border-slate-100 dark:border-slate-800">
          {stats.map((s, i) => (
            <div key={i} className="text-center sm:text-left">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                {s.label}
              </span>
              <span className="text-lg font-bold text-slate-900 dark:text-slate-100 font-sans mt-0.5 block">
                {s.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Footer Info & Action */}
      <div className="pt-4 flex items-center justify-between text-2xs text-slate-400">
        <span className="inline-flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-slate-400" /> Member since {joinedDate}
        </span>
        {onEditProfile && (
          <Button variant="soft" size="xs" onClick={onEditProfile} leftIcon={<Shield className="w-3.5 h-3.5" />}>
            Edit Preferences
          </Button>
        )}
      </div>
    </Card>
  );
};
