import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { ShieldCheck, Laptop } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface AccessLogItem {
  id: string;
  timestamp: string;
  user: string;
  userRole: string;
  action: string;
  ipAddress: string;
  device: string;
}

export interface AccessLogTableProps {
  logs: AccessLogItem[];
  className?: string;
}

export const AccessLogTable: React.FC<AccessLogTableProps> = ({
  logs,
  className,
}) => {
  return (
    <Card className={cn('border-slate-200/80 dark:border-slate-800', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <CardTitle className="text-sm font-bold">Access Telemetry & Audit Log Events</CardTitle>
          </div>
          <Badge variant="outline" size="sm">
            {logs.length} Logged Events
          </Badge>
        </div>
        <CardDescription className="text-2xs">
          Immutable audit record of all cryptographic access requests, record views, and token authorizations.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-left text-2xs">
          <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 uppercase font-bold border-b border-slate-100 dark:border-slate-800">
            <tr>
              <th className="px-4 py-2.5">Timestamp</th>
              <th className="px-4 py-2.5">Actor / User</th>
              <th className="px-4 py-2.5">Role</th>
              <th className="px-4 py-2.5">Action Event</th>
              <th className="px-4 py-2.5">IP Address</th>
              <th className="px-4 py-2.5">Device & Browser</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                <td className="px-4 py-2.5 font-mono text-slate-400">{log.timestamp}</td>
                <td className="px-4 py-2.5 font-bold text-slate-900 dark:text-white">{log.user}</td>
                <td className="px-4 py-2.5">
                  <Badge variant="secondary" size="sm">{log.userRole}</Badge>
                </td>
                <td className="px-4 py-2.5">
                  <span className="font-mono text-2xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-primary-700 dark:text-primary-300 font-bold">
                    {log.action}
                  </span>
                </td>
                <td className="px-4 py-2.5 font-mono text-slate-500">{log.ipAddress}</td>
                <td className="px-4 py-2.5 text-slate-500 flex items-center gap-1.5">
                  <Laptop className="w-3.5 h-3.5 text-slate-400" />
                  <span>{log.device}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
};
