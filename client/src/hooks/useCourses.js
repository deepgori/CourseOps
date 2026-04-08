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

export const useCourses = (filters = {}) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.get(`/courses${buildQuery(filters)}`);
      setCourses(data);
    } catch (fetchError) {
      setError(fetchError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [filters.assignee, filters.department, filters.priority, filters.search, filters.status]);

  const getCourse = async (courseId) => api.get(`/courses/${courseId}`);

  const createCourse = async (payload) => {
    const created = await api.post('/courses', payload);
    await fetchCourses();
    return created;
  };

  const updateCourse = async (courseId, payload) => {
    const updated = await api.put(`/courses/${courseId}`, payload);
    await fetchCourses();
    return updated;
  };

  const deleteCourse = async (courseId) => {
    const response = await api.delete(`/courses/${courseId}`);
    await fetchCourses();
    return response;
  };

  const updateCourseStatus = async (courseId, status) => {
    const updated = await api.patch(`/courses/${courseId}/status`, { status });
    setCourses((current) => current.map((course) => (course._id === courseId ? updated : course)));
    return updated;
  };

  return {
    courses,
    loading,
    error,
    refetch: fetchCourses,
    getCourse,
    createCourse,
    updateCourse,
    deleteCourse,
    updateCourseStatus
  };
};

