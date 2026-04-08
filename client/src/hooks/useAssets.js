import { useEffect, useMemo, useState } from 'react';
import { mockAssets } from '../utils/mockData';

const applyClientFilters = (assets, filters) => {
  let result = [...assets];

  if (filters.type && filters.type !== 'All') {
    const normalizedType = filters.type.toLowerCase().replace(/s$/, '');
    result = result.filter((a) => a.type === normalizedType);
  }

  if (filters.search) {
    const regex = new RegExp(filters.search, 'i');
    result = result.filter((a) => regex.test(a.fileName) || regex.test(a.originalName));
  }

  const sort = filters.sort || 'newest';
  const sortMap = {
    newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    oldest: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    name: (a, b) => a.fileName.localeCompare(b.fileName),
    largest: (a, b) => b.size - a.size
  };

  result.sort(sortMap[sort] || sortMap.newest);
  return result;
};

export const useAssets = (filters = {}) => {
  const [allAssets, setAllAssets] = useState(() => structuredClone(mockAssets));
  const [loading, setLoading] = useState(true);
  const [error] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const assets = useMemo(
    () => applyClientFilters(allAssets, filters),
    [allAssets, filters.search, filters.sort, filters.type]
  );

  const uploadAsset = async (formData) => {
    const file = formData.get('file');
    const ext = file?.name?.split('.').pop()?.toUpperCase() || 'FILE';
    const type = ['PNG', 'JPG', 'JPEG'].includes(ext) ? 'image' : ['MP4', 'MOV'].includes(ext) ? 'video' : 'document';

    const newAsset = {
      _id: `mock-${Date.now()}`,
      fileName: file?.name || 'uploaded-file',
      originalName: file?.name || 'uploaded-file',
      type,
      extension: ext,
      mimeType: file?.type || 'application/octet-stream',
      size: file?.size || 0,
      url: file ? URL.createObjectURL(file) : '',
      metadata: { resolution: 'Not available', duration: 'Not available' },
      linkedCourses: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setAllAssets((prev) => [newAsset, ...prev]);
    return newAsset;
  };

  const deleteAsset = async (assetId) => {
    setAllAssets((prev) => prev.filter((a) => a._id !== assetId));
    return { message: 'Asset deleted successfully.' };
  };

  const linkAsset = async (assetId, courseId) => {
    let updated;
    setAllAssets((prev) =>
      prev.map((a) => {
        if (a._id === assetId) {
          updated = {
            ...a,
            linkedCourses: [...a.linkedCourses, { _id: courseId, code: 'Linked', title: 'Course' }]
          };
          return updated;
        }
        return a;
      })
    );
    return updated;
  };

  return {
    assets,
    loading,
    error,
    refetch: () => {},
    uploadAsset,
    deleteAsset,
    linkAsset
  };
};
