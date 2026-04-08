import { useEffect, useState } from 'react';
import { api } from '../utils/api';

const buildQuery = (filters) => {
  const searchParams = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value && value !== 'All') {
      searchParams.set(key, value);
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

export const useAssets = (filters = {}) => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAssets = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.get(`/assets${buildQuery(filters)}`);
      setAssets(data);
    } catch (fetchError) {
      setError(fetchError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [filters.search, filters.sort, filters.type]);

  const uploadAsset = async (formData) => {
    const created = await api.post('/assets/upload', formData);
    await fetchAssets();
    return created;
  };

  const deleteAsset = async (assetId) => {
    const response = await api.delete(`/assets/${assetId}`);
    await fetchAssets();
    return response;
  };

  const linkAsset = async (assetId, courseId) => {
    const updated = await api.patch(`/assets/${assetId}/link`, { courseId });
    await fetchAssets();
    return updated;
  };

  return {
    assets,
    loading,
    error,
    refetch: fetchAssets,
    uploadAsset,
    deleteAsset,
    linkAsset
  };
};

