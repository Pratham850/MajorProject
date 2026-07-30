import api from './api';

export interface GrantConsentPayload {
  doctor_id: number;
  record_ids?: string[];
  expiry_date?: string;
}

export interface RevokeConsentPayload {
  doctor_id: number;
  record_id?: string;
}

export interface ConsentItemData {
  id: number | string;
  patientId: number;
  patientName?: string;
  doctorId: number;
  doctorName?: string;
  status: string;
  grantedDate?: string;
  expiryDate?: string;
}

export const consentService = {
  async listActiveConsents(): Promise<ConsentItemData[]> {
    const response = await api.get<ConsentItemData[]>('/consents');
    return response.data;
  },

  async grantConsent(payload: GrantConsentPayload): Promise<any> {
    const response = await api.post('/consents/grant', payload);
    return response.data;
  },

  async revokeConsent(payload: RevokeConsentPayload): Promise<any> {
    const response = await api.post('/consents/revoke', payload);
    return response.data;
  },
};

export default consentService;
