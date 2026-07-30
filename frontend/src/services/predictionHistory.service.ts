import api from './api';
import { predictionService, PredictionHistoryRecord } from './prediction.service';

export const predictionHistoryService = {
  async getHistory(): Promise<PredictionHistoryRecord[]> {
    return await predictionService.getPredictionHistory();
  },

  async getHistoryById(id: number | string): Promise<PredictionHistoryRecord | null> {
    const list = await predictionService.getPredictionHistory();
    return list.find((item) => String(item.id) === String(id)) || null;
  },
};

export default predictionHistoryService;
