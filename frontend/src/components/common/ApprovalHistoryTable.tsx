import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { History } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ApprovalHistoryItem {
  id: string;
  approvalDate: string;
  requestId: string;
  researcherName: string;
  decision: 'Approved' | 'Rejected' | 'More Information Requested';
  decisionMaker: string;
  reviewerComments: string;
}

export interface ApprovalHistoryTableProps {
  history: ApprovalHistoryItem[];
  className?: string;
}

export const ApprovalHistoryTable: React.FC<ApprovalHistoryTableProps> = ({
  history,
  className,
}) => {
  return (
    <Card className={cn('border-slate-200/80 dark:border-slate-800', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-primary-600" />
            <CardTitle className="text-sm font-bold">Research Governance Approval History & Audit Trail</CardTitle>
          </div>
          <Badge variant="outline" size="sm">
            {history.length} Decided Proposals
          </Badge>
        </div>
        <CardDescription className="text-2xs">
          Immutable audit record of all IRB ethics decisions, dataset access clearances, and administrative reviews.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-left text-2xs">
          <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 uppercase font-bold border-b border-slate-100 dark:border-slate-800">
            <tr>
              <th className="px-4 py-2.5">Decision Date</th>
              <th className="px-4 py-2.5">Request ID</th>
              <th className="px-4 py-2.5">Researcher</th>
              <th className="px-4 py-2.5">Governance Decision</th>
              <th className="px-4 py-2.5">Decision Maker</th>
              <th className="px-4 py-2.5">Reviewer Comments</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {history.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                <td className="px-4 py-2.5 font-mono text-slate-400">{item.approvalDate}</td>
                <td className="px-4 py-2.5 font-mono font-bold text-slate-500">{item.requestId}</td>
                <td className="px-4 py-2.5 font-bold text-slate-900 dark:text-white">{item.researcherName}</td>
                <td className="px-4 py-2.5">
                  <Badge variant={item.decision === 'Approved' ? 'success' : item.decision === 'Rejected' ? 'danger' : 'warning'} size="sm">
                    {item.decision}
                  </Badge>
                </td>
                <td className="px-4 py-2.5 font-mono text-slate-600 dark:text-slate-300">{item.decisionMaker}</td>
                <td className="px-4 py-2.5 text-slate-500 italic max-w-[260px] truncate">{item.reviewerComments}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
};
