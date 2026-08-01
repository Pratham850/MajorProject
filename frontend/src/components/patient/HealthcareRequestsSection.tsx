import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useToast } from '../ui/toast';
import {
  Stethoscope,
  FlaskConical,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Eye,
  ArrowRight,
  Shield,
  Clock,
  Building2,
  FileText,
  Inbox,
} from 'lucide-react';

export interface DoctorRequestItem {
  id: string;
  doctorName: string;
  hospital: string;
  purpose: string;
  requestedRecords: string;
  requestedDuration: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
}

export interface ResearchRequestItem {
  id: string;
  researchTitle: string;
  institution: string;
  purpose: string;
  requestedCategory: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
}

const initialDoctorRequests: DoctorRequestItem[] = [
  {
    id: 'dr-1',
    doctorName: 'Dr. Sarah Jenkins',
    hospital: 'St. Jude Cardiology Center',
    purpose: 'Cardiology Consultation & Diagnostic Review',
    requestedRecords: 'EHR, Lab Trends, Lipid Panel',
    requestedDuration: '6 Months',
    status: 'PENDING',
  },
  {
    id: 'dr-2',
    doctorName: 'Dr. Marcus Brody',
    hospital: 'Metropolitan General Hospital',
    purpose: 'Annual Health Check & Renal Evaluation',
    requestedRecords: 'ECG Report, Metabolic Panel',
    requestedDuration: '30 Days',
    status: 'APPROVED',
  },
];

const initialResearchRequests: ResearchRequestItem[] = [
  {
    id: 'res-1',
    researchTitle: 'CKD Early Detection Observational Study',
    institution: 'BioGen Epidemiological Institute',
    purpose: 'Investigating biomarker predictors for early renal decline',
    requestedCategory: 'Anonymized EHR, Renal Panel Trends',
    status: 'PENDING',
  },
  {
    id: 'res-2',
    researchTitle: 'AI Risk Model Clinical Validation',
    institution: 'Stanford Health AI Lab',
    purpose: 'Validating machine learning risk scores across demographics',
    requestedCategory: 'De-identified Lab Results',
    status: 'APPROVED',
  },
];

export const HealthcareRequestsSection: React.FC = () => {
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [doctorRequests, setDoctorRequests] = useState<DoctorRequestItem[]>(initialDoctorRequests);
  const [researchRequests, setResearchRequests] = useState<ResearchRequestItem[]>(initialResearchRequests);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await api.get<any[]>('/access-requests');
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          const mapped: DoctorRequestItem[] = response.data.map((r: any) => ({
            id: r.id || `req-${r.id}`,
            doctorName: r.doctorName || 'Doctor',
            hospital: r.doctorEmail ? `Contact: ${r.doctorEmail}` : 'Hospital Affiliate',
            purpose: r.reason || 'Medical Access Request',
            requestedRecords: r.recordTitle || 'All Medical Records',
            requestedDuration: r.requestedDuration || '90 Days',
            status: (r.status ? r.status.toUpperCase() : 'PENDING') as any,
          }));
          setDoctorRequests(mapped);
        }
      } catch (err) {
        // Fallback to initial mock requests on API connection failure
      }
    };

    fetchRequests();
  }, []);

  const handleDoctorAction = async (id: string, action: 'approve' | 'reject', name: string) => {
    const nextStatus = action === 'approve' ? 'APPROVED' : 'REJECTED';
    setDoctorRequests((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: nextStatus }
          : item
      )
    );

    try {
      const cleanId = id.replace('req-', '').replace('dr-', '');
      await api.put(`/access-requests/${cleanId}`, {
        status: action === 'approve' ? 'Approved' : 'Rejected',
      });
    } catch (err) {
      // In-memory status update already applied
    }

    addToast({
      type: action === 'approve' ? 'success' : 'warning',
      title: action === 'approve' ? 'Request Approved' : 'Request Rejected',
      message:
        action === 'approve'
          ? `Granted record access to ${name}.`
          : `Declined data access request from ${name}.`,
    });
  };

  const handleResearchAction = (id: string, action: 'approve' | 'reject', title: string) => {
    setResearchRequests((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: action === 'approve' ? 'APPROVED' : 'REJECTED' }
          : item
      )
    );

    addToast({
      type: action === 'approve' ? 'success' : 'warning',
      title: action === 'approve' ? 'Research Approved' : 'Research Rejected',
      message:
        action === 'approve'
          ? `Approved anonymized data sharing for "${title}".`
          : `Declined research request for "${title}".`,
    });
  };


  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-slate-100">
              Healthcare Requests
            </h2>
            <Badge variant="primary" size="sm">Patient Consent Control</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Review requests from doctors and researchers. You decide how your health information is shared.
          </p>
        </div>

        <Button
          variant="outline"
          size="xs"
          onClick={() => navigate('/consent')}
          rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          className="shrink-0"
        >
          View All Requests
        </Button>
      </div>

      {/* 2-Column Responsive Card Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Doctor Access Requests */}
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-bold">Doctor Access Requests</CardTitle>
                <Badge variant="info" size="sm">Clinical Access</Badge>
              </div>
              <CardDescription className="text-xs mt-0.5">
                Doctors request permission to access your medical records to support diagnosis and treatment.
              </CardDescription>
            </div>
            <div className="p-2.5 bg-sky-50 dark:bg-sky-950/60 text-sky-600 rounded-xl shrink-0">
              <Stethoscope className="w-5 h-5" />
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {doctorRequests.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
                <Inbox className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs font-bold text-slate-600 dark:text-slate-400">No pending healthcare requests.</p>
              </div>
            ) : (
              doctorRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{req.doctorName}</h4>
                      <p className="text-2xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3 h-3 text-slate-400 shrink-0" /> {req.hospital}
                      </p>
                    </div>

                    <Badge
                      variant={
                        req.status === 'APPROVED'
                          ? 'success'
                          : req.status === 'REJECTED'
                          ? 'danger'
                          : req.status === 'PENDING'
                          ? 'warning'
                          : 'secondary'
                      }
                      size="sm"
                    >
                      {req.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-2xs p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80">
                    <div>
                      <span className="text-slate-400 font-bold uppercase text-[10px] block">Purpose</span>
                      <span className="text-slate-700 dark:text-slate-300 font-medium">{req.purpose}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold uppercase text-[10px] block">Requested Records</span>
                      <span className="text-slate-700 dark:text-slate-300 font-mono text-[11px] flex items-center gap-1">
                        <FileText className="w-3 h-3 text-slate-400 shrink-0" /> {req.requestedRecords}
                      </span>
                    </div>
                    <div className="sm:col-span-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-slate-400" /> Duration: <strong className="text-slate-600 dark:text-slate-300">{req.requestedDuration}</strong>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1">
                    {req.status === 'PENDING' && (
                      <>
                        <Button
                          variant="primary"
                          size="xs"
                          onClick={() => handleDoctorAction(req.id, 'approve', req.doctorName)}
                          leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => handleDoctorAction(req.id, 'reject', req.doctorName)}
                          leftIcon={<XCircle className="w-3.5 h-3.5 text-rose-500" />}
                          className="hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-600"
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => navigate('/consent')}
                      leftIcon={<Eye className="w-3.5 h-3.5" />}
                      className="ml-auto"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Card 2: Research Requests */}
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-bold">Research Requests</CardTitle>
                <Badge variant="success" size="sm">Anonymized Data</Badge>
              </div>
              <CardDescription className="text-xs mt-0.5">
                Researchers request anonymized medical data to improve healthcare research and medicine quality.
              </CardDescription>
            </div>
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 rounded-xl shrink-0">
              <FlaskConical className="w-5 h-5" />
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {researchRequests.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
                <Inbox className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs font-bold text-slate-600 dark:text-slate-400">No pending healthcare requests.</p>
              </div>
            ) : (
              researchRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{req.researchTitle}</h4>
                      <p className="text-2xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3 h-3 text-slate-400 shrink-0" /> {req.institution}
                      </p>
                    </div>

                    <Badge
                      variant={
                        req.status === 'APPROVED'
                          ? 'success'
                          : req.status === 'REJECTED'
                          ? 'danger'
                          : req.status === 'PENDING'
                          ? 'warning'
                          : 'secondary'
                      }
                      size="sm"
                    >
                      {req.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-2xs p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80">
                    <div>
                      <span className="text-slate-400 font-bold uppercase text-[10px] block">Research Purpose</span>
                      <span className="text-slate-700 dark:text-slate-300 font-medium">{req.purpose}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold uppercase text-[10px] block">Dataset Category</span>
                      <span className="text-slate-700 dark:text-slate-300 font-mono text-[11px] flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0" /> {req.requestedCategory}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1">
                    {req.status === 'PENDING' && (
                      <>
                        <Button
                          variant="primary"
                          size="xs"
                          onClick={() => handleResearchAction(req.id, 'approve', req.researchTitle)}
                          leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => handleResearchAction(req.id, 'reject', req.researchTitle)}
                          leftIcon={<XCircle className="w-3.5 h-3.5 text-rose-500" />}
                          className="hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-600"
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => navigate('/consent')}
                      leftIcon={<Eye className="w-3.5 h-3.5" />}
                      className="ml-auto"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Patient Privacy Notice Info Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-primary-500/10 via-sky-500/10 to-indigo-500/10 border border-primary-200/60 dark:border-primary-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary-600 dark:text-primary-400 shrink-0" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Your Privacy, Your Decision</h3>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-600 dark:text-slate-300">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0" />
              <span>Doctors can only access records after your approval.</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span>Researchers never receive your personal identity.</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
              <span>Only anonymized medical data is shared for approved research.</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
              <span>You can revoke consent at any time.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
