import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { ShieldCheck, Lock } from 'lucide-react';

export interface DataSharingRecord {
  id: string;
  doctorName: string;
  hospital: string;
  recordsAccessed: string;
  purpose: string;
  accessDate: string;
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED' | 'PENDING';
}

const defaultSharingHistory: DataSharingRecord[] = [
  {
    id: 'ds-1',
    doctorName: 'Dr. Sarah Jenkins',
    hospital: 'St. Jude Cardiology Center',
    recordsAccessed: 'EHR, Lab Trends, Lipid Panel',
    purpose: 'Cardiology Consultation',
    accessDate: 'Today, 10:30 AM',
    status: 'ACTIVE',
  },
  {
    id: 'ds-2',
    doctorName: 'Dr. Marcus Brody',
    hospital: 'Metropolitan General Hospital',
    recordsAccessed: 'Annual ECG, Metabolic Panel',
    purpose: 'Routine Health Review',
    accessDate: 'Jul 22, 2026',
    status: 'ACTIVE',
  },
  {
    id: 'ds-3',
    doctorName: 'BioGen Research Team',
    hospital: 'BioGen Epidemiological Institute',
    recordsAccessed: 'Anonymized EHR, Demographics',
    purpose: 'CKD Observational Study',
    accessDate: 'Jun 15, 2026',
    status: 'ACTIVE',
  },
  {
    id: 'ds-4',
    doctorName: 'Dr. Emily Watson',
    hospital: 'Valley Radiology Associates',
    recordsAccessed: 'Chest X-Ray Digital Imaging',
    purpose: 'Radiology Diagnostic Report',
    accessDate: 'May 10, 2026',
    status: 'EXPIRED',
  },
];

export const DataSharingTable: React.FC<{ records?: DataSharingRecord[] }> = ({
  records = defaultSharingHistory,
}) => {
  return (
    <Card className="border-slate-200/80 dark:border-slate-800">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-bold">Data Sharing History</CardTitle>
            <Badge variant="success" size="sm">HIPAA Audit Logs</Badge>
          </div>
          <CardDescription className="text-xs">
            Complete transparency into which clinicians and organizations have accessed your health data.
          </CardDescription>
        </div>
        <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 rounded-xl">
          <ShieldCheck className="w-5 h-5" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                <th className="pb-3 px-3">Doctor / Entity</th>
                <th className="pb-3 px-3">Hospital / Org</th>
                <th className="pb-3 px-3">Records Accessed</th>
                <th className="pb-3 px-3">Purpose</th>
                <th className="pb-3 px-3">Access Date</th>
                <th className="pb-3 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {records.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-3 font-bold text-slate-900 dark:text-slate-100">
                    <div className="flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{row.doctorName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-400 font-medium">
                    {row.hospital}
                  </td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                    {row.recordsAccessed}
                  </td>
                  <td className="py-3 px-3 text-slate-500 dark:text-slate-400">
                    {row.purpose}
                  </td>
                  <td className="py-3 px-3 text-slate-400 dark:text-slate-500 font-mono text-[11px]">
                    {row.accessDate}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <Badge
                      variant={
                        row.status === 'ACTIVE'
                          ? 'success'
                          : row.status === 'REVOKED'
                          ? 'danger'
                          : row.status === 'PENDING'
                          ? 'warning'
                          : 'secondary'
                      }
                      size="sm"
                    >
                      {row.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
