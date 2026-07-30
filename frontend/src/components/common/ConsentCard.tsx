import React from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ShieldCheck, ShieldAlert, ShieldX, Calendar, Key, Check, Eye, Clock, Building } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ConsentCardProps {
  id: string | number;
  granteeName: string;
  granteeRole: 'DOCTOR' | 'RESEARCHER' | 'ADMIN';
  granteeOrganization?: string;
  purpose?: string;
  scope: string[];
  status: 'ACTIVE' | 'PENDING' | 'REVOKED' | 'EXPIRED';
  validUntil: string;
  createdAt: string;
  requestedDuration?: string;
  onRevoke?: () => void;
  onGrant?: () => void;
  onViewDetails?: () => void;
  className?: string;
}

export const ConsentCard: React.FC<ConsentCardProps> = ({
  granteeName,
  granteeRole,
  granteeOrganization = 'St. Jude Health Network',
  purpose,
  scope,
  status,
  validUntil,
  createdAt,
  requestedDuration,
  onRevoke,
  onGrant,
  onViewDetails,
  className,
}) => {
  const statusConfig: Record<string, { variant: any; icon: React.ReactNode }> = {
    ACTIVE: { variant: 'success', icon: <ShieldCheck className="w-4 h-4 text-emerald-500" /> },
    PENDING: { variant: 'warning', icon: <ShieldAlert className="w-4 h-4 text-amber-500" /> },
    REVOKED: { variant: 'danger', icon: <ShieldX className="w-4 h-4 text-rose-500" /> },
    EXPIRED: { variant: 'secondary', icon: <ShieldX className="w-4 h-4 text-slate-400" /> },
  };

  const st = statusConfig[status] || statusConfig.ACTIVE;

  return (
    <Card className={cn('p-5 flex flex-col justify-between hover:shadow-md transition-all duration-200 border-slate-200/80 dark:border-slate-800', className)}>
      <div>
        {/* Header Status & Role */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <Badge variant={st.variant} size="sm" dot>
            {status}
          </Badge>
          <Badge variant="outline" size="sm">
            {granteeRole}
          </Badge>
        </div>

        {/* Grantee Identity */}
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0">
            {st.icon}
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{granteeName}</h4>
            <p className="text-2xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
              <Building className="w-3 h-3 text-slate-400" /> {granteeOrganization}
            </p>
          </div>
        </div>

        {/* Purpose */}
        {purpose && (
          <div className="mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-2xs text-slate-600 dark:text-slate-300">
            <strong className="font-semibold text-slate-900 dark:text-white">Purpose: </strong>
            {purpose}
          </div>
        )}

        {/* Scopes / Shared Records */}
        <div className="mt-4">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1.5">
            Authorized Data Scope:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {scope.map((s, i) => (
              <span key={i} className="inline-flex items-center gap-1 text-2xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md font-mono">
                <Key className="w-2.5 h-2.5 text-primary-600" /> {s}
              </span>
            ))}
          </div>
        </div>

        {/* Validity & Dates */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-2xs text-slate-400">
          <span>Requested: {createdAt}</span>
          <span className="inline-flex items-center gap-1 font-semibold text-slate-600 dark:text-slate-300">
            <Calendar className="w-3 h-3 text-slate-400" /> {status === 'PENDING' ? `Duration: ${requestedDuration || '60 Days'}` : `Expires: ${validUntil}`}
          </span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
        {onViewDetails ? (
          <Button variant="ghost" size="xs" onClick={onViewDetails} leftIcon={<Eye className="w-3.5 h-3.5" />}>
            Details
          </Button>
        ) : <div />}

        <div className="flex items-center gap-2">
          {status === 'PENDING' && onGrant && (
            <Button variant="success" size="xs" onClick={onGrant} leftIcon={<Check className="w-3.5 h-3.5" />}>
              Approve
            </Button>
          )}
          {(status === 'ACTIVE' || status === 'PENDING') && onRevoke && (
            <Button variant="danger" size="xs" onClick={onRevoke}>
              {status === 'PENDING' ? 'Deny' : 'Revoke'}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
