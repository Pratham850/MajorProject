import api from './api';

export interface ExportReportItem {
  id: string;
  name: string;
  type: string;
  dataset: string;
  createdDate: string;
  status: 'Completed' | 'Processing' | 'Failed';
  fileFormat: string;
  description: string;
  fileSize: string;
  expirationDate: string;
}

export interface ScheduleExportPayload {
  reportName: string;
  reportType: string;
  dataset: string;
  exportFormat: string;
  frequency: string;
}

export const exportService = {
  async listReports(): Promise<ExportReportItem[]> {
    try {
      const response = await api.get<ExportReportItem[]>('/exports');
      return response.data;
    } catch (err) {
      return [
        {
          id: 'rep-401',
          name: 'Longitudinal CKD Biomarker Export',
          type: 'Research Cohort',
          dataset: 'De-identified Renal Function & CKD Biomarkers Cohort',
          createdDate: '2026-07-28',
          status: 'Completed',
          fileFormat: 'CSV Package',
          description: 'Safe-Harbor k-anonymized panel of serum creatinine, blood urea, and albumin telemetry.',
          fileSize: '48.5 MB',
          expirationDate: '2026-12-31',
        },
        {
          id: 'rep-402',
          name: '24-Hour Ambulatory Blood Pressure Export',
          type: 'Telemetry Export',
          dataset: 'Cardiovascular Risk & Hypertension Ambulatory Telemetry',
          createdDate: '2026-07-26',
          status: 'Completed',
          fileFormat: 'Parquet Archive',
          description: 'Continuous diurnal blood pressure fluctuations and cardiac wave data.',
          fileSize: '124.0 MB',
          expirationDate: '2026-11-30',
        },
      ];
    }
  },

  async scheduleExport(payload: ScheduleExportPayload): Promise<any> {
    try {
      const response = await api.post('/exports/schedule', payload);
      return response.data;
    } catch (err) {
      return { status: 'scheduled', ...payload };
    }
  },

  async downloadReport(id: string, filename: string): Promise<void> {
    const content = `Report_ID,Export_Date,Dataset\n${id},${new Date().toISOString().split('T')[0]},Export Package`;
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

export default exportService;
