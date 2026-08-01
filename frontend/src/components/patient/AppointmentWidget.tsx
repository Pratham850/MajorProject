import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Calendar, Video, MapPin, Clock, CalendarX2 } from 'lucide-react';

export interface Appointment {
  id: string;
  doctorName: string;
  specialty: string;
  hospital: string;
  date: string;
  time: string;
  type: 'Telehealth' | 'In-Person';
  status: 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled';
}

const defaultAppointments: Appointment[] = [
  {
    id: 'app-1',
    doctorName: 'Dr. Sarah Jenkins',
    specialty: 'Cardiology Specialist',
    hospital: 'St. Jude Cardiology Center',
    date: 'Tomorrow, Jul 31',
    time: '10:30 AM (30 min)',
    type: 'Telehealth',
    status: 'Confirmed',
  },
  {
    id: 'app-2',
    doctorName: 'St. Jude Diagnostic Lab',
    specialty: 'Routine Renal & Lipid Panel',
    hospital: 'St. Jude Lab Center',
    date: 'Aug 04, 2026',
    time: '08:15 AM',
    type: 'In-Person',
    status: 'Confirmed',
  },
];

export const AppointmentWidget: React.FC<{ initialAppointments?: Appointment[] }> = ({
  initialAppointments = defaultAppointments,
}) => {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);

  React.useEffect(() => {
    setAppointments(initialAppointments);
  }, [initialAppointments]);


  return (
    <Card className="border-slate-200/80 dark:border-slate-800">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-base font-bold">Upcoming Appointments</CardTitle>
          <CardDescription className="text-xs">
            Scheduled telehealth consultations and in-person lab visits.
          </CardDescription>
        </div>
        <div className="p-2 bg-sky-50 dark:bg-sky-950/60 text-sky-600 rounded-xl">
          <Calendar className="w-5 h-5" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {appointments.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
              <CalendarX2 className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">No Upcoming Appointments</h4>
            <p className="text-2xs text-slate-400 max-w-xs mx-auto">
              You currently have no scheduled appointments. Contact your care manager to request a consultation.
            </p>
          </div>
        ) : (
          appointments.map((app) => (
            <div
              key={app.id}
              className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white dark:hover:bg-slate-800 transition-all"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{app.doctorName}</h4>
                  <Badge variant={app.type === 'Telehealth' ? 'info' : 'secondary'} size="sm">
                    {app.type}
                  </Badge>
                  <Badge variant="success" size="sm">
                    {app.status}
                  </Badge>
                </div>
                <p className="text-2xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" /> {app.hospital} • {app.specialty}
                </p>
                <div className="flex items-center gap-3 text-2xs text-slate-400 font-mono mt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" /> {app.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" /> {app.time}
                  </span>
                </div>
              </div>

              <div className="shrink-0">
                {app.type === 'Telehealth' ? (
                  <Button variant="primary" size="xs" leftIcon={<Video className="w-3.5 h-3.5" />}>
                    Join Call
                  </Button>
                ) : (
                  <Button variant="outline" size="xs">
                    View Details
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
