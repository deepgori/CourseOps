import { useEffect, useState } from 'react';
import { api } from '../utils/api';

export const useReports = () => {
  const [data, setData] = useState({
    overview: null,
    completion: [],
    departments: { breakdown: [], summary: [] },
    activity: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError('');
      const [overview, completion, departments, activity] = await Promise.all([
        api.get('/reports/overview'),
        api.get('/reports/completion'),
        api.get('/reports/departments'),
        api.get('/reports/activity')
      ]);

      setData({ overview, completion, departments, activity });
    } catch (fetchError) {
      setError(fetchError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const exportCsv = async () => api.download('/reports/export');

  return {
    ...data,
    loading,
    error,
    refetch: fetchReports,
    exportCsv
  };
};

