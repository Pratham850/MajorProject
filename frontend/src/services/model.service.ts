import api from './api';

export interface ModelMetadata {
  name: string;
  version: string;
  accuracy: number;
  aucRoc: number;
  features: string[];
  lastTrained: string;
  description: string;
}

export const modelService = {
  async getModelDetails(): Promise<ModelMetadata> {
    return {
      name: 'XGBoost & Random Forest Ensemble',
      version: 'v2.4-Production',
      accuracy: 96.4,
      aucRoc: 0.982,
      features: [
        'Serum Creatinine (mg/dL)',
        'Blood Urea (mg/dL)',
        'Hemoglobin (g/dL)',
        'Systolic Blood Pressure (mmHg)',
        'Fasting Blood Glucose (mg/dL)',
        'Urinary Albumin (Grade 0-4)',
      ],
      lastTrained: '2026-07-01',
      description: 'Supervised ML model trained on 10,000+ anonymized clinical renal panels for early Chronic Kidney Disease (CKD) risk stratification.',
    };
  },
};

export default modelService;
