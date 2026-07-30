import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Database, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';

export interface DatasetGovernanceItem {
  id: string;
  name: string;
  publicationStatus: 'Published' | 'Restricted' | 'Draft';
  accessLevel: 'IRB Clearance Required' | 'Public De-Identified' | 'Controlled Access';
  category: 'Cardiology' | 'Oncology' | 'Endocrinology' | 'Neurology';
  lastUpdated: string;
  approvedResearchersCount: number;
}

export interface DatasetGovernancePanelProps {
  datasets: DatasetGovernanceItem[];
  className?: string;
}

export const DatasetGovernancePanel: React.FC<DatasetGovernancePanelProps> = ({
  datasets,
  className,
}) => {
  const navigate = useNavigate();

  return (
    <Card className={cn('border-slate-200/80 dark:border-slate-800', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-500" />
            <CardTitle className="text-sm font-bold">Anonymized Dataset Governance Matrix</CardTitle>
          </div>
          <Badge variant="outline" size="sm">
            {datasets.length} Active Datasets
          </Badge>
        </div>
        <CardDescription className="text-2xs">
          Manage publication statuses, access policies, and approved researcher counts across de-identified clinical datasets.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-left text-2xs">
          <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 uppercase font-bold border-b border-slate-100 dark:border-slate-800">
            <tr>
              <th className="px-4 py-2.5">Dataset Name</th>
              <th className="px-4 py-2.5">Category</th>
              <th className="px-4 py-2.5">Access Level Policy</th>
              <th className="px-4 py-2.5">Publication Status</th>
              <th className="px-4 py-2.5">Approved Researchers</th>
              <th className="px-4 py-2.5">Last Updated</th>
              <th className="px-4 py-2.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {datasets.map((ds) => (
              <tr key={ds.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                <td className="px-4 py-2.5 font-bold text-slate-900 dark:text-white">{ds.name}</td>
                <td className="px-4 py-2.5">
                  <Badge variant="secondary" size="sm">{ds.category}</Badge>
                </td>
                <td className="px-4 py-2.5 font-mono text-slate-500">{ds.accessLevel}</td>
                <td className="px-4 py-2.5">
                  <Badge variant={ds.publicationStatus === 'Published' ? 'success' : 'warning'} size="sm" dot>
                    {ds.publicationStatus}
                  </Badge>
                </td>
                <td className="px-4 py-2.5 font-mono text-slate-600 dark:text-slate-300 font-bold">
                  {ds.approvedResearchersCount} Researchers
                </td>
                <td className="px-4 py-2.5 font-mono text-slate-400">{ds.lastUpdated}</td>
                <td className="px-4 py-2.5 text-right">
                  <Button variant="ghost" size="xs" onClick={() => navigate('/datasets')} leftIcon={<Eye className="w-3.5 h-3.5" />}>
                    View Dataset
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
};
