import api from './api';

export interface ResearchAnalyticsData {
  totalQueries: number;
  approvedQueries: number;
  downloadedDatasets: number;
  activeCohorts: number;
  categoryBreakdown: { category: string; percentage: number }[];
}

export const analyticsService = {
  async getResearcherAnalytics(): Promise<ResearchAnalyticsData> {
    try {
      const response = await api.get<any>('/dashboard/researcher');
      return response.data;
    } catch (err) {
      return {
        totalQueries: 14,
        approvedQueries: 11,
        downloadedDatasets: 8,
        activeCohorts: 5,
        categoryBreakdown: [
          { category: 'Nephrology', percentage: 40 },
          { category: 'Cardiology', percentage: 30 },
          { category: 'Endocrinology', percentage: 20 },
          { category: 'Pulmonology', percentage: 10 },
        ],
      };
    }
  },
};

export default analyticsService;
