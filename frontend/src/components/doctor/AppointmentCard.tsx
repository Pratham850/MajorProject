import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { AppointmentStatusBadge } from './AppointmentStatusBadge';
import { DoctorAppointmentRequest } from './AppointmentRequestCard';
import {
  User,
  Calendar,
  Clock,
  Building2,
  Video,
  FileText,
  CheckCircle2,
  Brain,
  AlertTriangle,
  FileCheck,
  Eye,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface DoctorAppointmentCardProps {
  appointment: DoctorAppointmentRequest & {
    diagnosis?: string;
    prescriptionUploaded?: boolean;
  };
  onStartConsultation?: (id: string, name: string) => void;
  onViewMedicalRecords?: (patientId: string) => void;
  onOpenPatientProfile?: (patientId: string) => void;
  onViewDetails?: (appointment: DoctorAppointmentRequest) => void;
}

export const AppointmentCard: React.FC<DoctorAppointmentCardProps> = ({
  appointment,
  onStartConsultation,
  onViewMedicalRecords,
  onOpenPatientProfile,
  onViewDetails,
}) => {
  const navigate = useNavigate();

  const handleOpenProfile = () => {
    if (onOpenPatientProfile) {
      onOpenPatientProfile(appointment.patientId);
    } else {
      navigate('/patients');
    }
  };

  const handleViewRecords = () => {
    if (onViewMedicalRecords) {
      onViewMedicalRecords(appointment.patientId);
    } else {
      navigate('/doctor/records');
    }
  };

  return (
    <Card className="border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
      <CardContent className="p-5 space-y-4">
        {/* Header: Patient Info & Status */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow-xs shrink-0">
              {appointment.patientName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>{appointment.patientName}</span>
                <span className="text-xs font-normal text-slate-400">({appointment.patientAge} yrs)</span>
              </h4>
              <p className="text-2xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {appointment.hospital} • {appointment.department}
              </p>
            </div>
          </div>

          <AppointmentStatusBadge status={appointment.status} />
        </div>

        {/* Date, Time & Purpose */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2 text-2xs">
          <div className="flex flex-wrap items-center gap-4 text-slate-600 dark:text-slate-300 font-mono">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-primary-500" /> {appointment.date}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-primary-500" /> {appointment.time}
            </span>
          </div>

          <div>
            <span className="text-slate-400 font-bold uppercase text-[10px] block">Purpose / Reason</span>
            <span className="text-slate-800 dark:text-slate-200 font-medium">{appointment.reasonForVisit}</span>
          </div>

          {/* Completed Specific Info: Diagnosis & Prescription */}
          {appointment.status === 'COMPLETED' && (
            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 space-y-1.5">
              {appointment.diagnosis && (
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Clinical Diagnosis</span>
                  <span className="text-slate-900 dark:text-slate-100 font-semibold">{appointment.diagnosis}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-2xs pt-0.5">
                <span className="text-slate-400">Prescription Status:</span>
                {appointment.prescriptionUploaded ? (
                  <Badge variant="success" size="sm" className="flex items-center gap-1">
                    <FileCheck className="w-3 h-3 text-emerald-500" /> Rx Uploaded
                  </Badge>
                ) : (
                  <Badge variant="secondary" size="sm">Pending Rx</Badge>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Feature 5: Consultation Preparation Status (For Confirmed) */}
        {appointment.status === 'CONFIRMED' && (
          <div className="p-3 rounded-xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Consultation Readiness:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {appointment.consentGranted ? (
                <>
                  <Badge variant="success" size="sm" className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Medical Records Available
                  </Badge>
                  {appointment.aiPredictionAvailable && (
                    <Badge variant="primary" size="sm" className="flex items-center gap-1">
                      <Brain className="w-3 h-3 text-indigo-500" /> AI Prediction Available
                    </Badge>
                  )}
                </>
              ) : (
                <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Medical records unavailable. Request consent.
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons based on Status */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
          {appointment.status === 'CONFIRMED' && (
            <>
              <Button
                variant="primary"
                size="xs"
                onClick={() => onStartConsultation && onStartConsultation(appointment.id, appointment.patientName)}
                leftIcon={<Video className="w-3.5 h-3.5" />}
              >
                Start Consultation
              </Button>

              <Button
                variant="outline"
                size="xs"
                onClick={handleViewRecords}
                leftIcon={<FileText className="w-3.5 h-3.5" />}
              >
                View Medical Records
              </Button>

              <Button
                variant="secondary"
                size="xs"
                onClick={handleOpenProfile}
                leftIcon={<User className="w-3.5 h-3.5" />}
              >
                Open Patient Profile
              </Button>
            </>
          )}

          {appointment.status === 'COMPLETED' && (
            <>
              <Button
                variant="outline"
                size="xs"
                onClick={() => onViewDetails && onViewDetails(appointment)}
                leftIcon={<Eye className="w-3.5 h-3.5" />}
              >
                View Details
              </Button>

              <Button
                variant="secondary"
                size="xs"
                onClick={handleViewRecords}
                leftIcon={<FileText className="w-3.5 h-3.5" />}
              >
                View Records
              </Button>
            </>
          )}

          {(appointment.status === 'CANCELLED' || appointment.status === 'RESCHEDULED') && (
            <Button
              variant="ghost"
              size="xs"
              onClick={() => onViewDetails && onViewDetails(appointment)}
              leftIcon={<Eye className="w-3.5 h-3.5" />}
              className="ml-auto"
            >
              View Details
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
