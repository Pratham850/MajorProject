import React from 'react';
import { Dialog, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { DoctorAppointmentRequest } from './AppointmentRequestCard';
import { AppointmentStatusBadge } from './AppointmentStatusBadge';
import {
  User,
  Calendar,
  Clock,
  Building2,
  FileText,
  CheckCircle2,
  XCircle,
  CalendarClock,
  ShieldCheck,
  Brain,
  AlertTriangle,
} from 'lucide-react';

export interface AppointmentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: DoctorAppointmentRequest | null;
  onAccept?: (id: string, name: string) => void;
  onReject?: (id: string, name: string) => void;
  onReschedule?: (id: string, name: string) => void;
}

export const AppointmentDetailsModal: React.FC<AppointmentDetailsModalProps> = ({
  isOpen,
  onClose,
  appointment,
  onAccept,
  onReject,
  onReschedule,
}) => {
  if (!appointment) return null;

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Appointment Details & Specifications" maxWidth="md">
      <div className="space-y-4 text-xs">
        {/* Header Summary */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold font-mono text-slate-400 uppercase">
              ID: {appointment.id}
            </span>
            <AppointmentStatusBadge status={appointment.status} />
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
              {appointment.patientName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{appointment.patientName}</h4>
              <p className="text-2xs text-slate-500 dark:text-slate-400">
                Age: {appointment.patientAge} yrs • Department: {appointment.department}
              </p>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-slate-400 font-bold uppercase text-[10px] block">Hospital / Facility</span>
            <span className="text-slate-800 dark:text-slate-200 font-semibold flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400" /> {appointment.hospital}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-slate-400 font-bold uppercase text-[10px] block">Scheduled Time</span>
            <span className="text-slate-800 dark:text-slate-200 font-semibold font-mono flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-primary-500" /> {appointment.date} • {appointment.time}
            </span>
          </div>
        </div>

        {/* Reason for Visit */}
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-slate-400 font-bold uppercase text-[10px] block">Reason for Visit</span>
          <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
            {appointment.reasonForVisit}
          </p>
        </div>

        {/* Clinical Notes */}
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-slate-400 font-bold uppercase text-[10px] block">Clinical Notes</span>
          <p className="text-slate-600 dark:text-slate-300 italic text-2xs">
            {appointment.notes || 'No pre-consultation notes provided by patient.'}
          </p>
        </div>

        {/* Consultation Readiness */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-2">
          <span className="text-slate-400 font-bold uppercase text-[10px] block">Consent & Data Authorization</span>
          <div className="flex flex-wrap items-center gap-2">
            {appointment.consentGranted ? (
              <>
                <Badge variant="success" size="sm" className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" /> Medical Records Access Granted
                </Badge>
                {appointment.aiPredictionAvailable && (
                  <Badge variant="primary" size="sm" className="flex items-center gap-1">
                    <Brain className="w-3 h-3 text-indigo-500" /> AI CKD Risk Score Included
                  </Badge>
                )}
              </>
            ) : (
              <Badge variant="warning" size="sm" className="flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-500" /> Patient Consent Pending
              </Badge>
            )}
          </div>
        </div>
      </div>

      <DialogFooter>
        <div className="flex flex-wrap items-center gap-2 w-full justify-between pt-2">
          {appointment.status === 'PENDING' && onAccept && onReject && onReschedule ? (
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="xs"
                onClick={() => {
                  onAccept(appointment.id, appointment.patientName);
                  onClose();
                }}
                leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
              >
                Accept
              </Button>

              <Button
                variant="outline"
                size="xs"
                onClick={() => {
                  onReject(appointment.id, appointment.patientName);
                  onClose();
                }}
                leftIcon={<XCircle className="w-3.5 h-3.5 text-rose-500" />}
              >
                Reject
              </Button>

              <Button
                variant="secondary"
                size="xs"
                onClick={() => {
                  onReschedule(appointment.id, appointment.patientName);
                  onClose();
                }}
                leftIcon={<CalendarClock className="w-3.5 h-3.5" />}
              >
                Reschedule
              </Button>
            </div>
          ) : (
            <div />
          )}

          <Button variant="outline" size="xs" onClick={onClose} className="ml-auto">
            Close
          </Button>
        </div>
      </DialogFooter>
    </Dialog>
  );
};
