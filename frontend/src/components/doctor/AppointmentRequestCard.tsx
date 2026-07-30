import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { AppointmentStatusBadge, DoctorAppointmentStatus } from './AppointmentStatusBadge';
import {
  User,
  Calendar,
  Clock,
  Building2,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Brain,
  XCircle,
  Eye,
  CalendarClock,
} from 'lucide-react';

export interface DoctorAppointmentRequest {
  id: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender?: string;
  date: string;
  time: string;
  department: string;
  reasonForVisit: string;
  status: DoctorAppointmentStatus;
  consentGranted: boolean;
  aiPredictionAvailable: boolean;
  hospital: string;
  notes?: string;
}

export interface AppointmentRequestCardProps {
  request: DoctorAppointmentRequest;
  onAccept: (id: string, name: string) => void;
  onReject: (id: string, name: string) => void;
  onReschedule: (id: string, name: string) => void;
  onViewDetails: (request: DoctorAppointmentRequest) => void;
  onRequestConsent?: (patientId: string, name: string) => void;
}

export const AppointmentRequestCard: React.FC<AppointmentRequestCardProps> = ({
  request,
  onAccept,
  onReject,
  onReschedule,
  onViewDetails,
  onRequestConsent,
}) => {
  return (
    <Card className="border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
      <CardContent className="p-5 space-y-4">
        {/* Header: Patient Info & Status */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow-xs shrink-0">
              {request.patientName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>{request.patientName}</span>
                <span className="text-xs font-normal text-slate-400">({request.patientAge} yrs{request.patientGender ? `, ${request.patientGender}` : ''})</span>
              </h4>
              <p className="text-2xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {request.hospital} • {request.department}
              </p>
            </div>
          </div>

          <AppointmentStatusBadge status={request.status} />
        </div>

        {/* Date, Time & Reason */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2 text-2xs">
          <div className="flex flex-wrap items-center gap-4 text-slate-600 dark:text-slate-300 font-mono">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-primary-500" /> {request.date}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-primary-500" /> {request.time}
            </span>
          </div>

          <div>
            <span className="text-slate-400 font-bold uppercase text-[10px] block">Reason for Visit</span>
            <span className="text-slate-800 dark:text-slate-200 font-medium">{request.reasonForVisit}</span>
          </div>
        </div>

        {/* Feature 5: Consultation Preparation (Consent Indicators) */}
        <div className="p-3 rounded-xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block w-full sm:w-auto">
            Consultation Readiness:
          </span>

          <div className="flex flex-wrap items-center gap-2 text-2xs">
            {request.consentGranted ? (
              <>
                <Badge variant="success" size="sm" className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Medical Records Available
                </Badge>
                {request.aiPredictionAvailable && (
                  <Badge variant="primary" size="sm" className="flex items-center gap-1">
                    <Brain className="w-3 h-3 text-indigo-500" /> AI Prediction Available
                  </Badge>
                )}
              </>
            ) : (
              <div className="flex items-center gap-2 w-full sm:w-auto justify-between">
                <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1 text-2xs">
                  <AlertTriangle className="w-3.5 h-3.5" /> Medical records unavailable.
                </span>
                {onRequestConsent && (
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => onRequestConsent(request.patientId, request.patientName)}
                    className="text-[10px] h-6 px-2 text-amber-600 border-amber-300 hover:bg-amber-50"
                  >
                    Request Consent
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
          <Button
            variant="primary"
            size="xs"
            onClick={() => onAccept(request.id, request.patientName)}
            leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
          >
            Accept
          </Button>

          <Button
            variant="outline"
            size="xs"
            onClick={() => onReject(request.id, request.patientName)}
            leftIcon={<XCircle className="w-3.5 h-3.5 text-rose-500" />}
            className="hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-600"
          >
            Reject
          </Button>

          <Button
            variant="secondary"
            size="xs"
            onClick={() => onReschedule(request.id, request.patientName)}
            leftIcon={<CalendarClock className="w-3.5 h-3.5" />}
          >
            Reschedule
          </Button>

          <Button
            variant="ghost"
            size="xs"
            onClick={() => onViewDetails(request)}
            leftIcon={<Eye className="w-3.5 h-3.5" />}
            className="ml-auto"
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
