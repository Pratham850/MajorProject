import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Server, Database, Cpu, Bell, HardDrive } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ServiceStatusItem {
  name: string;
  key: 'api' | 'db' | 'ml' | 'notify' | 'storage';
  uptime: string;
  latency: string;
  status: 'Operational' | 'Degraded' | 'Maintenance';
}

export interface ServiceStatusPanelProps {
  services: ServiceStatusItem[];
  className?: string;
}

export const ServiceStatusPanel: React.FC<ServiceStatusPanelProps> = ({
  services,
  className,
}) => {
  const iconMap = {
    api: <Server className="w-4 h-4 text-emerald-500" />,
    db: <Database className="w-4 h-4 text-sky-500" />,
    ml: <Cpu className="w-4 h-4 text-indigo-500" />,
    notify: <Bell className="w-4 h-4 text-amber-500" />,
    storage: <HardDrive className="w-4 h-4 text-rose-500" />,
  };

  return (
    <Card className={cn('border-slate-200/80 dark:border-slate-800', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Server className="w-4 h-4 text-primary-600" /> Microservices Health Status Panel
          </CardTitle>
          <Badge variant="success" size="sm" dot>
            All Systems Healthy
          </Badge>
        </div>
        <CardDescription className="text-2xs">
          Real-time status, SLA uptime percentages, and latency metrics across core infrastructure.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-left text-2xs">
          <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 uppercase font-bold border-b border-slate-100 dark:border-slate-800">
            <tr>
              <th className="px-4 py-2.5">Service Name</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5">SLA Uptime</th>
              <th className="px-4 py-2.5">Avg Latency</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {services.map((svc) => (
              <tr key={svc.key} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                <td className="px-4 py-2.5 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  {iconMap[svc.key]}
                  <span>{svc.name}</span>
                </td>
                <td className="px-4 py-2.5">
                  <Badge variant={svc.status === 'Operational' ? 'success' : 'warning'} size="sm" dot>
                    {svc.status}
                  </Badge>
                </td>
                <td className="px-4 py-2.5 font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{svc.uptime}</td>
                <td className="px-4 py-2.5 font-mono text-slate-500">{svc.latency}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
};
