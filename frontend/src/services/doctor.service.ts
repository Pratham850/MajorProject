import api from './api';

export interface DoctorDashboardStats {
  totalPatients: number;
  activeConsults: number;
  recordsShared: number;
  appointments: number;
}

export const doctorService = {
  async getDoctorDashboardStats(): Promise<DoctorDashboardStats> {
    try {
      const response = await api.get<DoctorDashboardStats>('/dashboard/doctor');
      return response.data;
    } catch (err) {
      // Fallback to role-adaptive stats endpoint
      const response = await api.get<DoctorDashboardStats>('/dashboard/stats');
      return response.data;
    }
  },
};

export default doctorService;
