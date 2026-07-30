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
}

export interface UploadRecordPayload {
  title: string;
  category: string;
  file: File;
}

export interface UpdateRecordPayload {
  title?: string;
  category?: string;
}

/**
 * Service handling Medical Record Metadata operations (List, Get, Update, Delete)
 */
export const medicalRecordService = {
  async listRecords(): Promise<MedicalRecordData[]> {
    const response = await api.get<MedicalRecordData[]>('/records');
    return response.data;
  },

  async getRecord(id: string): Promise<MedicalRecordData> {
    const response = await api.get<MedicalRecordData>(`/records/${id}`);
    return response.data;
  },

  async updateRecord(id: string, payload: UpdateRecordPayload): Promise<MedicalRecordData> {
    const response = await api.put<MedicalRecordData>(`/records/${id}`, payload);
    return response.data;
  },

  async deleteRecord(id: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/records/${id}`);
    return response.data;
  },
};

/**
 * Service handling Multipart File Uploads to FastAPI POST /records/upload
 */
export const uploadService = {
  async uploadRecord(payload: UploadRecordPayload): Promise<MedicalRecordData> {
    const formData = new FormData();
    formData.append('title', payload.title);
    formData.append('category', payload.category);
    formData.append('file', payload.file);

    const response = await api.post<MedicalRecordData>('/records/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },
};

/**
 * Service handling Secure File Downloads from FastAPI GET /records/{id}/download
 */
export const downloadService = {
  async downloadRecord(recordId: string, customFilename?: string): Promise<void> {
    const response = await api.get(`/records/${recordId}/download`, {
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
