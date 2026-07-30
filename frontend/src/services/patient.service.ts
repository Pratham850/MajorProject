import api from './api';

export interface ConsentedPatientData {
  id: string;
  patientId: number;
  name: string;
  mrn: string;
  age: number;
  gender: string;
  consentStatus: 'Active' | 'Expiring Soon' | 'Pending Renewal';
  consentExpiry: string;
  lastUpdated: string;
  dataScopes: string[];
  aiRiskLevel: 'LOW' | 'MODERATE' | 'HIGH';
  aiRiskScore: number;
  primaryCondition: string;
  recentRecordsCount: number;
  contactEmail: string;
  phone: string;
}

export const patientService = {
  async getAuthorizedPatients(): Promise<ConsentedPatientData[]> {
    const response = await api.get<any[]>('/consents');
    return response.data.map((c: any, idx: number) => ({
      id: `pat-${c.id || c.patientId || idx + 100}`,
      patientId: c.patientId || c.patient_id || idx + 1,
      name: c.patientName || c.patient || (c.patient && c.patient.full_name) || `Patient #${c.patientId || idx + 1}`,
      mrn: c.mrn || `MRN-${9000 + idx}`,
      age: c.age || 52,
      gender: c.gender || 'Female',
      consentStatus: (c.status === 'Active' || c.status === 'ACTIVE' ? 'Active' : 'Expiring Soon') as any,
      consentExpiry: c.expiryDate || c.expiry_date || '2026-12-31',
      lastUpdated: c.grantedDate || c.granted_date || '2026-07-28',
      dataScopes: c.sharedRecords || ['EHR Summary', 'Lab Trends', 'Lipid Panel'],
      aiRiskLevel: c.riskLevel || 'MODERATE',
      aiRiskScore: c.riskScore || 48,
      primaryCondition: c.condition || 'Hypertension & Dyslipidemia',
      recentRecordsCount: c.recordsCount || 4,
      contactEmail: c.email || 'patient@healthshare.org',
      phone: c.phone || '+1 (555) 234-5678',
    }));
  },
};

export default patientService;
