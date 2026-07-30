import api from './api';

export interface DiseasePredictionPayload {
  disease: string;
  year: number;
}

export interface DiseasePredictionResult {
  disease: string;
  year: number;
  predictedIncidenceRate: number;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH';
  confidence: number;
  modelVersion: string;
}

export interface PredictionHistoryRecord {
  id: number;
  disease: string;
  year: number;
  predictedValue: number;
  riskLevel?: 'LOW' | 'MODERATE' | 'HIGH';
  created_at: string;
}

export const predictionService = {
  async predictDisease(payload: DiseasePredictionPayload): Promise<DiseasePredictionResult> {
    const response = await api.post<DiseasePredictionResult>('/ml/predict', payload);
    return response.data;
  },

  async getPredictionHistory(): Promise<PredictionHistoryRecord[]> {
    const response = await api.get<PredictionHistoryRecord[]>('/ml/history');
    return response.data;
  },

  async getDiseaseTrends(): Promise<any[]> {
    const response = await api.get<any[]>('/ml/predictions');
    return response.data;
  },
};

export default predictionService;
