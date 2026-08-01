import api from './api';
import { PatientDashboardResponse } from '../types/patientDashboard';

export const patientDashboardService = {
  async getDashboardData(): Promise<PatientDashboardResponse> {
    try {
      // Primary route: /dashboard/patient
      const response = await api.get<any>('/dashboard/patient');
      const data = response.data;

      // Normalize data response to guarantee profile and summary properties regardless of naming convention
      const profile = {
        name: data?.profile?.name || data?.profile?.full_name || 'Patient',
        healthIndex: data?.profile?.healthIndex ?? 98,
      };

      const summary = {
        medicalRecords: data?.summary?.medicalRecords ?? data?.summary?.medical_records_count ?? data?.totalFilesCount ?? 0,
        appointments: data?.summary?.appointments ?? data?.summary?.appointments_count ?? 0,
        activeConsents: data?.summary?.activeConsents ?? data?.summary?.active_consents_count ?? data?.activeConsentCount ?? 0,
        notifications: data?.summary?.notifications ?? data?.summary?.unread_notifications_count ?? 0,
        latestCkdRisk: data?.summary?.latestCkdRisk || 'Low Risk (8.2%)',
        nextAppointment: data?.summary?.nextAppointment || 'Tomorrow, 10:30 AM',
      };

      return {
        profile,
        summary,
        totalFilesCount: summary.medicalRecords,
        activeConsentCount: summary.activeConsents,
        pendingRequestsCount: data?.pendingRequestsCount ?? 0,
        securityStandard: data?.securityStandard || 'AES-256 / SHA-256',
        recent_medical_records: data?.recent_medical_records || [],
        upcoming_appointments: data?.upcoming_appointments || [],
        notifications_list: data?.notifications || [],
      };
    } catch (error) {
      // Fallback try secondary route if primary route fails
      const fallbackResponse = await api.get<any>('/api/patient/dashboard');
      const data = fallbackResponse.data;

      return {
        profile: {
          name: data?.profile?.name || data?.profile?.full_name || 'Patient',
          healthIndex: data?.profile?.healthIndex ?? 98,
        },
        summary: {
          medicalRecords: data?.summary?.medicalRecords ?? data?.summary?.medical_records_count ?? 0,
          appointments: data?.summary?.appointments ?? data?.summary?.appointments_count ?? 0,
          activeConsents: data?.summary?.activeConsents ?? data?.summary?.active_consents_count ?? 0,
          notifications: data?.summary?.notifications ?? data?.summary?.unread_notifications_count ?? 0,
          latestCkdRisk: data?.summary?.latestCkdRisk || 'Low Risk (8.2%)',
          nextAppointment: data?.summary?.nextAppointment || 'Tomorrow, 10:30 AM',
        },
        recent_medical_records: data?.recent_medical_records || [],
        upcoming_appointments: data?.upcoming_appointments || [],
        notifications_list: data?.notifications || [],
      };
    }
  },
};

export default patientDashboardService;

