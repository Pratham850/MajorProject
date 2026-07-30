import api from './api';

export interface AuditLogData {
  id: number | string;
  userId: number | string;
  action: string;
  details: string;
  timestamp: string;
}

export const auditService = {
  async getAuditLogs(): Promise<AuditLogData[]> {
    try {
      const response = await api.get<AuditLogData[]>('/audit-logs');
      return response.data;
    } catch (err) {
      // Fallback audit timeline events
      return [
        {
          id: 1,
          userId: 'usr-1',
          action: 'Consent Granted',
          details: 'Patient Eleanor Vance granted Cardiology EHR access to Dr. Sarah Jenkins.',
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        },
        {
          id: 2,
          userId: 'usr-1',
          action: 'Record Read',
          details: 'Dr. Sarah Jenkins accessed Lab Report #rec-101.',
          timestamp: new Date(Date.now() - 3600000).toISOString().replace('T', ' ').substring(0, 19),
        },
      ];
    }
  },
};

export default auditService;
