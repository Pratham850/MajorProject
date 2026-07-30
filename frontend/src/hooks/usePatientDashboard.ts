import { useState, useEffect, useCallback } from 'react';
import { patientDashboardService } from '../services/patientDashboardService';
import { PatientDashboardResponse } from '../types/patientDashboard';

export interface UsePatientDashboardResult {
  data: PatientDashboardResponse | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export const usePatientDashboard = (): UsePatientDashboardResult => {
  const [data, setData] = useState<PatientDashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchDashboard = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      const result = await patientDashboardService.getDashboardData();
      setData(result);
    } catch (err: any) {
      setIsError(true);
      setError(err instanceof Error ? err : new Error(err?.message || 'Failed to load dashboard metrics'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();

    // Part 8: Automatic Refetch when page regains focus
    const handleFocus = () => {
      fetchDashboard();
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchDashboard]);

  return {
    data,
    isLoading,
    isError,
    error,
    refetch: fetchDashboard,
  };
};

export default usePatientDashboard;
