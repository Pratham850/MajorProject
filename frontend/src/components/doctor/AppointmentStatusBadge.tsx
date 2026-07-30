import React from 'react';
import { Badge } from '../ui/badge';

export type DoctorAppointmentStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';

export interface AppointmentStatusBadgeProps {
  status: DoctorAppointmentStatus;
}

export const AppointmentStatusBadge: React.FC<AppointmentStatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'PENDING':
      return <Badge variant="warning" size="sm">Pending Review</Badge>;
    case 'CONFIRMED':
      return <Badge variant="info" size="sm">Confirmed</Badge>;
    case 'COMPLETED':
      return <Badge variant="success" size="sm">Completed</Badge>;
    case 'CANCELLED':
      return <Badge variant="danger" size="sm">Cancelled</Badge>;
    case 'RESCHEDULED':
      return <Badge variant="primary" size="sm">Rescheduled</Badge>;
    default:
      return <Badge variant="secondary" size="sm">{status}</Badge>;
  }
};
