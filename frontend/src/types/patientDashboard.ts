export interface PatientDashboardProfile {
  name: string;
  healthIndex: number;
}

export interface PatientDashboardSummary {
  medicalRecords: number;
  appointments: number;
  activeConsents: number;
  notifications: number;
  latestCkdRisk?: string;
  nextAppointment?: string;
}

export interface PatientDashboardResponse {
  profile: PatientDashboardProfile;
  summary: PatientDashboardSummary;
  totalFilesCount?: number;
  activeConsentCount?: number;
  pendingRequestsCount?: number;
  securityStandard?: string;
  recent_medical_records?: any[];
  upcoming_appointments?: any[];
  notifications_list?: any[];
}

