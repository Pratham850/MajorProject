import api from './api';

export interface MedicalRecordData {
  id: string;
  title: string;
  category: string;
  dateUploaded: string;
  fileSize: string;
  sharingStatus?: string;
  sharedWith?: string[];
  patientName?: string;
  patientId?: number;
  doctorName?: string;
  hospitalName?: string;
  verificationStatus?: 'Verified' | 'Pending' | 'Encrypted';
  fileType?: string;
  aiStatus?: string;
  doctorAccess?: string;
  extractedData?: any;
  description?: string;
  tags?: string[];
}

export interface UploadRecordPayload {
  title: string;
  category: string;
  file: File;
}

export interface UpdateRecordPayload {
  title?: string;
  category?: string;
  description?: string;
  tags?: string[];
}

/**
 * Service handling Medical Record Metadata operations (List, Get, Update, Delete, AI Analysis, Reprocess)
 */
export const medicalRecordService = {
  async listRecords(): Promise<MedicalRecordData[]> {
    const response = await api.get<MedicalRecordData[]>('/medical-records');
    return response.data;
  },

  async getRecord(id: string): Promise<MedicalRecordData> {
    const response = await api.get<MedicalRecordData>(`/medical-records/${id}`);
    return response.data;
  },

  async updateRecord(id: string, payload: UpdateRecordPayload): Promise<MedicalRecordData> {
    const response = await api.put<MedicalRecordData>(`/medical-records/${id}`, payload);
    return response.data;
  },

  async deleteRecord(id: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/medical-records/${id}`);
    return response.data;
  },

  async getAnalysis(id: string): Promise<any> {
    const response = await api.get(`/medical-records/${id}/analysis`);
    return response.data;
  },

  async reprocessRecord(id: string): Promise<any> {
    const response = await api.post(`/medical-records/${id}/reprocess`);
    return response.data;
  },
};

/**
 * Service handling Multipart File Uploads to FastAPI POST /medical-records/upload
 */
export const uploadService = {
  async uploadRecord(payload: UploadRecordPayload): Promise<MedicalRecordData> {
    const formData = new FormData();
    formData.append('title', payload.title);
    formData.append('category', payload.category);
    formData.append('file', payload.file);

    const response = await api.post<MedicalRecordData>('/medical-records/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

/**
 * Service handling Secure File Downloads from FastAPI GET /medical-records/{id}/download
 */
export const downloadService = {
  async downloadRecord(recordId: string, customFilename?: string): Promise<void> {
    const response = await api.get(`/medical-records/${recordId}/download`, {
      responseType: 'blob',
    });

    const contentTypeHeader = response.headers ? String(response.headers['content-type'] || 'application/octet-stream') : 'application/octet-stream';
    const blob = new Blob([response.data], {
      type: contentTypeHeader,
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    // Extract filename from disposition header safely
    const contentDispositionHeader = response.headers ? String(response.headers['content-disposition'] || '') : '';
    let filename = customFilename || `medical_record_${recordId}`;
    if (contentDispositionHeader) {
      const filenameMatch = contentDispositionHeader.match(/filename="?([^"]+)"?/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1];
      }
    }

    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

